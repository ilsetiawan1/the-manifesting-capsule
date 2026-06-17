import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import * as repository from "@/features/capsules/repository";
import { sanitizeCapsuleForClient } from "@/features/capsules/services";
import CapsulePageClient from "./CapsulePageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const capsule = await repository.getCapsuleMetadataById(id);

  if (!capsule) {
    return {
      title: "The Manifesting Capsule",
      description: "Kapsul waktu untuk menyimpan harapan dan impianmu.",
    };
  }

  const isLocked = new Date() < new Date(capsule.unlockAt);
  let photoUrl = capsule.photoUrl;

  if (!isLocked) {
    const full = await repository.getUnlockedCapsuleContent(id);
    if (full?.photoUrl) photoUrl = full.photoUrl;
  }

  const title = `The Manifesting Capsule - Harapan ${capsule.targetName}`;
  const description = `Seseorang telah mengunci harapannya untuk ${capsule.targetName}. Apakah sudah terbuka?`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: photoUrl || "/og-image-default.png",
          width: 800,
          height: 600,
          alt: `Harapan ${capsule.targetName}`,
        },
      ],
    },
  };
}

export default async function CapsulePage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const now = new Date();
  
  const meta = await repository.getCapsuleMetadataById(id);
  if (!meta) {
    notFound();
  }

  const isLocked = now < new Date(meta.unlockAt);
  let capsuleData;
  if (isLocked) {
    capsuleData = meta;
  } else {
    capsuleData = await repository.getUnlockedCapsuleContent(id);
  }

  if (!capsuleData) {
    notFound();
  }

  const clientCapsule = sanitizeCapsuleForClient(capsuleData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white flex flex-col justify-between">
      {/* Standalone Page Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-lg text-white">
          <span className="text-2xl">🌱</span>
          <span>Manifesting Capsule</span>
        </Link>
        <Link
          href="/"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl transition-all active:scale-95"
        >
          Buat Kapsul Sendiri ✨
        </Link>
      </header>

      {/* Standalone Client page rendering the Capsule Modal / Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <CapsulePageClient capsule={clientCapsule} />
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-slate-500 font-mono">
        &copy; {new Date().getFullYear()} The Manifesting Capsule. All rights reserved.
      </footer>
    </div>
  );
}
