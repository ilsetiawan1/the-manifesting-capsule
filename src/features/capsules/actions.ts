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
  input: CreateCapsuleInput
): Promise<ServerActionResponse<ClientCapsule>> {
  try {
    // 1. Validasi input
    const validation = CreateCapsuleSchema.safeParse(input);
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

    // 3. Simpan ke Database
    const capsule = await repository.createCapsule({
      accessKey: key,
      targetName: validation.data.targetName.trim(),
      messageContent: validation.data.messageContent.trim(),
      unlockAt: new Date(validation.data.unlockAt),
      authorName: validation.data.authorName,
    });

    // 4. Return data yang sudah disanitasi
    return {
      success: true,
      data: sanitizeCapsuleForClient(capsule),
    };
  } catch (err: any) {
    console.error("Error in createCapsuleAction:", err);
    return {
      success: false,
      error: "Gagal membuat kapsul manifestasi. Silakan coba lagi.",
    };
  }
}

/**
 * Mengambil Kapsul Publik untuk Explore Feed
 */
export async function getPublicCapsulesAction(
  vibeFilter?: string
): Promise<ServerActionResponse<ClientCapsule[]>> {
  try {
    const capsules = await repository.getPublicCapsules();

    // Sanitasi dan petakan data ke format client
    const clientCapsules = capsules.map((c) => sanitizeCapsuleForClient(c));

    // Filter berdasarkan Vibe jika ditentukan
    if (vibeFilter && vibeFilter !== "All") {
      const filtered = clientCapsules.filter((c) => c.vibe === vibeFilter);
      return { success: true, data: filtered };
    }

    return { success: true, data: clientCapsules };
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
