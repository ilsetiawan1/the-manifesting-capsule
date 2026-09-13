import { NextRequest, NextResponse } from "next/server";
import * as repository from "@/features/capsules/repository";
import { sanitizeCapsuleForClient } from "@/features/capsules/services";
import { CreateCapsuleSchema } from "@/features/capsules/schemas";
import { getOrCreateAccessKey } from "@/features/capsules/actions";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 6;

    const { capsules, total, hasMore } = await repository.getPublicCapsules(page, limit);
    const clientCapsules = capsules.map((c) => sanitizeCapsuleForClient(c));

    return NextResponse.json({
      success: true,
      data: {
        capsules: clientCapsules,
        total,
        hasMore,
        page,
        limit,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data kapsul publik: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = CreateCapsuleSchema.safeParse({
      ...body,
      unlockAt: body.unlockAt ? new Date(body.unlockAt) : new Date(NaN),
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const allowed = await checkRateLimit("create_capsule", 5);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak permintaan. Silakan tunggu 1 menit." },
        { status: 429 }
      );
    }

    const { key } = await getOrCreateAccessKey();

    const capsule = await repository.createCapsule({
      accessKey: key,
      targetName: validation.data.targetName.trim(),
      messageContent: validation.data.messageContent.trim(),
      unlockAt: new Date(validation.data.unlockAt),
      authorName: validation.data.authorName,
      photoUrl: validation.data.photoUrl ?? null,
      ifNotAchieved: validation.data.ifNotAchieved ?? null,
      ifAchieved: validation.data.ifAchieved ?? null,
      isPrivate: validation.data.isPrivate,
      isAnonymousTarget: validation.data.isAnonymousTarget,
      vibe: validation.data.vibe,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Kapsul berhasil ditanam",
        data: sanitizeCapsuleForClient(capsule),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat kapsul: " + error.message },
      { status: 500 }
    );
  }
}
