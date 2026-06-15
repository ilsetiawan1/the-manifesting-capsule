import { generateAccessKey as generateKey } from "@/lib/nanoid";
import { ClientCapsule, Manifest } from "@/types";

export type VibeCategory = "Career & Study" | "Love & Self" | "Random";

export function generateAccessKey(): string {
  return generateKey();
}

export function getVibeCategory(targetName: string, messageContent?: string | null): VibeCategory {
  const textToSearch = `${targetName} ${messageContent || ""}`.toLowerCase();
  
  if (
    textToSearch.includes("karir") ||
    textToSearch.includes("career") ||
    textToSearch.includes("kerja") ||
    textToSearch.includes("lulus") ||
    textToSearch.includes("study") ||
    textToSearch.includes("kuliah") ||
    textToSearch.includes("cum laude") ||
    textToSearch.includes("cumlaude") ||
    textToSearch.includes("sekolah") ||
    textToSearch.includes("usaha") ||
    textToSearch.includes("bisnis") ||
    textToSearch.includes("work") ||
    textToSearch.includes("job") ||
    textToSearch.includes("sukses") ||
    textToSearch.includes("target") ||
    textToSearch.includes("mimpi")
  ) {
    return "Career & Study";
  }
  
  if (
    textToSearch.includes("love") ||
    textToSearch.includes("cinta") ||
    textToSearch.includes("diri") ||
    textToSearch.includes("self") ||
    textToSearch.includes("kamu") ||
    textToSearch.includes("sahabat") ||
    textToSearch.includes("dia") ||
    textToSearch.includes("ibu") ||
    textToSearch.includes("mama") ||
    textToSearch.includes("ayah") ||
    textToSearch.includes("keluarga") ||
    textToSearch.includes("pacar") ||
    textToSearch.includes("friend") ||
    textToSearch.includes("heart") ||
    textToSearch.includes("sayang")
  ) {
    return "Love & Self";
  }
  
  return "Random";
}

export function sanitizeCapsuleForClient(
  capsule: Omit<Manifest, "messageContent"> & { messageContent?: string | null }
): ClientCapsule {
  const now = new Date();
  const unlockAt = new Date(capsule.unlockAt);
  const createdAt = new Date(capsule.createdAt);
  const isLocked = now < unlockAt;

  const totalDuration = unlockAt.getTime() - createdAt.getTime();
  const elapsed = now.getTime() - createdAt.getTime();
  
  let progressPercent = 100;
  if (isLocked) {
    if (totalDuration > 0) {
      progressPercent = Math.min(Math.floor((elapsed / totalDuration) * 100), 99);
      if (progressPercent < 0) progressPercent = 0;
    } else {
      progressPercent = 0;
    }
  }

  const daysLeft = isLocked
    ? Math.ceil((unlockAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const vibe = getVibeCategory(capsule.targetName, capsule.messageContent);

  return {
    ...capsule,
    messageContent: isLocked ? null : (capsule.messageContent ?? null), // Double protection
    isLocked,
    progressPercent,
    daysLeft,
    vibe,
  };
}
