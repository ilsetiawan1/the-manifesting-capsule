"use server";

import { cookies } from "next/headers";
import { CreateCapsuleSchema, ResonateSchema, SyncKeySchema } from "./schemas";
import * as repository from "./repository";
import {
  generateAccessKey,
  sanitizeCapsuleForClient,
} from "./services";
import { ClientCapsule, CreateCapsuleInput, ServerActionResponse } from "@/types";
import { checkRateLimit } from "@/lib/rate-limiter";

import { uploadCapsulePhoto } from "@/lib/blob";

/**
 * Mendapatkan atau membuat accessKey baru di cookie
 */
export async function getOrCreateAccessKey(): Promise<{ key: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const existingKey = cookieStore.get("manifesting_access_key")?.value;

  if (existingKey) {
    return { key: existingKey, isNew: false };
  }

  const newKey = generateAccessKey();
  cookieStore.set("manifesting_access_key", newKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365 * 5, // 5 tahun
    path: "/",
  });

  return { key: newKey, isNew: true };
}

/**
 * Membaca accessKey aktif dari cookie (tanpa auto-generate)
 */
export async function getActiveAccessKey(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("manifesting_access_key")?.value ?? null;
}

/**
 * Membuat Kapsul Baru (Drop Capsule)
 */
export async function createCapsuleAction(
  formData: FormData
): Promise<ServerActionResponse<ClientCapsule>> {
  try {
    const targetName = formData.get("targetName") as string;
    const messageContent = formData.get("messageContent") as string;
    const unlockAtStr = formData.get("unlockAt") as string;
    const authorName = (formData.get("authorName") as string) || undefined;
    const ifNotAchieved = (formData.get("ifNotAchieved") as string) || null;
    const ifAchieved = (formData.get("ifAchieved") as string) || null;
    const photoFile = formData.get("photo") as File | null;
    const isPrivate = formData.get("isPrivate") as string;
    const isAnonymousTarget = formData.get("isAnonymousTarget") as string;

    // 1. Validasi input
    const validation = CreateCapsuleSchema.safeParse({
      targetName,
      messageContent,
      unlockAt: unlockAtStr ? new Date(unlockAtStr) : new Date(NaN),
      authorName,
      ifNotAchieved,
      ifAchieved,
      isPrivate,
      isAnonymousTarget,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    // 1.5 Rate Limiting (max 5 per menit)
    const allowed = await checkRateLimit("create_capsule", 5);
    if (!allowed) {
      return {
        success: false,
        error: "Terlalu banyak permintaan. Silakan tunggu 1 menit.",
      };
    }

    // 2. Ambil/buat access key dari cookie
    const { key } = await getOrCreateAccessKey();

    // 2.5 Upload foto jika ada
    let photoUrl: string | null = null;
    if (photoFile && photoFile.size > 0 && photoFile.name !== "undefined") {
      try {
        photoUrl = await uploadCapsulePhoto(photoFile, key);
      } catch (uploadErr) {
        console.error("Photo upload failed, continuing without photo:", uploadErr);
        // Jangan gagalkan seluruh capsule hanya karena foto gagal upload
      }
    }

    // 3. Simpan ke Database
    const capsule = await repository.createCapsule({
      accessKey: key,
      targetName: validation.data.targetName.trim(),
      messageContent: validation.data.messageContent.trim(),
      unlockAt: new Date(validation.data.unlockAt),
      authorName: validation.data.authorName,
      photoUrl,
      ifNotAchieved: validation.data.ifNotAchieved,
      ifAchieved: validation.data.ifAchieved,
      isPrivate: validation.data.isPrivate,
      isAnonymousTarget: validation.data.isAnonymousTarget,
    });

    // 4. Return data yang sudah disanitasi
    return {
      success: true,
      data: sanitizeCapsuleForClient(capsule),
    };
  } catch (error) {
    console.error("[createCapsuleAction] Error:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Mengambil Kapsul Publik untuk Explore Feed
 */
export async function getPublicCapsulesAction(
  page = 1,
  limit = 6
): Promise<ServerActionResponse<{ capsules: ClientCapsule[]; total: number; hasMore: boolean }>> {
  try {
    const { capsules, total, hasMore } = await repository.getPublicCapsules(page, limit);

    // Sanitasi dan petakan data ke format client
    const clientCapsules = capsules.map((c) => sanitizeCapsuleForClient(c));

    return {
      success: true,
      data: {
        capsules: clientCapsules,
        total,
        hasMore,
      },
    };
  } catch (err: any) {
    console.error("Error in getPublicCapsulesAction:", err);
    return {
      success: false,
      error: "Gagal mengambil data kapsul publik.",
    };
  }
}

/**
 * Mengambil Kapsul Riwayat Milik User Sendiri
 */
export async function getMyCapsulesAction(): Promise<ServerActionResponse<ClientCapsule[]>> {
  try {
    const key = await getActiveAccessKey();
    if (!key) {
      return { success: true, data: [] }; // Kosong jika belum ada key
    }

    const capsules = await repository.getCapsulesByAccessKey(key);
    const clientCapsules = capsules.map((c) => sanitizeCapsuleForClient(c));

    return { success: true, data: clientCapsules };
  } catch (err: any) {
    console.error("Error in getMyCapsulesAction:", err);
    return {
      success: false,
      error: "Gagal mengambil riwayat kapsul Anda.",
    };
  }
}

/**
 * Mengambil Konten Teks Kapsul Terbuka (On-Demand)
 */
export async function getUnlockedCapsuleContentAction(
  id: string
): Promise<ServerActionResponse<ClientCapsule>> {
  try {
    const capsule = await repository.getUnlockedCapsuleContent(id);

    if (!capsule) {
      return {
        success: false,
        error: "Kapsul masih terkunci atau tidak ditemukan.",
      };
    }

    return {
      success: true,
      data: sanitizeCapsuleForClient(capsule),
    };
  } catch (err: any) {
    console.error("Error in getUnlockedCapsuleContentAction:", err);
    return {
      success: false,
      error: "Gagal memuat konten kapsul.",
    };
  }
}

/**
 * Memberikan Resonansi ke Kapsul
 */
export async function resonateAction(
  capsuleId: string
): Promise<ServerActionResponse<{ resonateCount: number }>> {
  try {
    // Validasi ID
    const validation = ResonateSchema.safeParse({ capsuleId });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    // 1.5 Rate Limiting (max 10 per menit)
    const allowed = await checkRateLimit("resonate_capsule", 10);
    if (!allowed) {
      return {
        success: false,
        error: "Terlalu banyak memberikan resonansi. Silakan tunggu 1 menit.",
      };
    }

    const updated = await repository.incrementResonate(capsuleId);

    return {
      success: true,
      data: { resonateCount: updated.resonateCount },
    };
  } catch (err: any) {
    console.error("Error in resonateAction:", err);
    return {
      success: false,
      error: "Gagal memproses resonansi.",
    };
  }
}

/**
 * Menyinkronkan Access Key Baru (Paste Key)
 */
export async function syncAccessKeyAction(
  key: string
): Promise<ServerActionResponse<{ key: string }>> {
  try {
    // Validasi format key
    const validation = SyncKeySchema.safeParse({ accessKey: key.trim().toUpperCase() });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const targetKey = key.trim().toUpperCase();
    const cookieStore = await cookies();

    cookieStore.set("manifesting_access_key", targetKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 5, // 5 tahun
      path: "/",
    });

    return {
      success: true,
      data: { key: targetKey },
    };
  } catch (err: any) {
    console.error("Error in syncAccessKeyAction:", err);
    return {
      success: false,
      error: "Gagal menyinkronkan Access Key.",
    };
  }
}

/**
 * Keluar dari Akun Aktif (Menghapus Cookie Access Key)
 */
export async function logoutAction(): Promise<ServerActionResponse<void>> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("manifesting_access_key");
    return { success: true };
  } catch (err: any) {
    console.error("Error in logoutAction:", err);
    return { success: false, error: "Gagal keluar akun." };
  }
}
