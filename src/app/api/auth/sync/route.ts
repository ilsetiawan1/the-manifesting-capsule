import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SyncKeySchema } from "@/features/capsules/schemas";

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const key = cookieStore.get("manifesting_access_key")?.value ?? null;

    return NextResponse.json({
      success: true,
      data: {
        accessKey: key,
        isAuthenticated: !!key,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil sesi: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = SyncKeySchema.safeParse({
      accessKey: body.accessKey ? String(body.accessKey).trim().toUpperCase() : "",
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const targetKey = validation.data.accessKey;
    const cookieStore = await cookies();

    cookieStore.set("manifesting_access_key", targetKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 5, // 5 tahun
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Access Key berhasil disinkronkan",
      data: { accessKey: targetKey },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal menyinkronkan Access Key: " + error.message },
      { status: 500 }
    );
  }
}
