import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("manifesting_access_key");

    return NextResponse.json({
      success: true,
      message: "Berhasil keluar (cookie access key dihapus)",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses logout: " + error.message },
      { status: 500 }
    );
  }
}
