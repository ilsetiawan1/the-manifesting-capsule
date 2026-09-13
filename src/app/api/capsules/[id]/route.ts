import { NextRequest, NextResponse } from "next/server";
import * as repository from "@/features/capsules/repository";
import { sanitizeCapsuleForClient } from "@/features/capsules/services";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const capsule = await repository.getCapsuleMetadataById(id);

    if (!capsule) {
      return NextResponse.json(
        { success: false, error: "Kapsul tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jika sudah terbuka, ambil konten lengkapnya
    if (new Date() >= new Date(capsule.unlockAt)) {
      const unlocked = await repository.getUnlockedCapsuleContent(id);
      if (unlocked) {
        return NextResponse.json({
          success: true,
          data: sanitizeCapsuleForClient(unlocked),
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: sanitizeCapsuleForClient(capsule),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan: " + error.message },
      { status: 500 }
    );
  }
}
