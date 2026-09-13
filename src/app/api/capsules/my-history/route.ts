import { NextRequest, NextResponse } from "next/server";
import { getActiveAccessKey } from "@/features/capsules/actions";
import * as repository from "@/features/capsules/repository";
import { sanitizeCapsuleForClient } from "@/features/capsules/services";

export async function GET(_request: NextRequest) {
  try {
    const key = await getActiveAccessKey();
    if (!key) {
      return NextResponse.json({ success: true, data: [] });
    }

    const capsules = await repository.getCapsulesByAccessKey(key);
    const clientCapsules = capsules.map((c) => sanitizeCapsuleForClient(c));

    return NextResponse.json({
      success: true,
      data: clientCapsules,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil riwayat kapsul: " + error.message },
      { status: 500 }
    );
  }
}
