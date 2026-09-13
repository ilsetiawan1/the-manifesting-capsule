import { NextRequest, NextResponse } from "next/server";
import { ResonateSchema } from "@/features/capsules/schemas";
import * as repository from "@/features/capsules/repository";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = ResonateSchema.safeParse({ capsuleId: id });
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const allowed = await checkRateLimit("resonate_capsule", 10);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak memberikan resonansi. Silakan tunggu 1 menit." },
        { status: 429 }
      );
    }

    const updated = await repository.incrementResonate(id);

    return NextResponse.json({
      success: true,
      message: "Resonansi berhasil ditambahkan",
      data: { resonateCount: updated.resonateCount },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses resonansi: " + error.message },
      { status: 500 }
    );
  }
}
