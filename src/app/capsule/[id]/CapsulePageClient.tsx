'use client';

import { useRouter } from "next/navigation";
import CapsuleDetailModal from "@/features/capsules/components/CapsuleDetailModal";
import { ClientCapsule } from "@/types";

export default function CapsulePageClient({ capsule }: { capsule: ClientCapsule }) {
  const router = useRouter();

  return (
    <CapsuleDetailModal
      initialCapsule={capsule}
      onClose={() => router.push("/")}
      onResonateSuccess={() => {}}
    />
  );
}
