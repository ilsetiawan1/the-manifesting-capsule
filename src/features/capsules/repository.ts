import { prisma } from "@/lib/prisma";
import { Manifest } from "@/types";

export async function createCapsule(data: {
  accessKey: string;
  targetName: string;
  messageContent: string;
  unlockAt: Date;
}) {
  return prisma.manifest.create({
    data,
  });
}

export async function getPublicCapsules() {
  return prisma.manifest.findMany({
    select: {
      id: true,
      accessKey: true,
      targetName: true,
      resonateCount: true,
      unlockAt: true,
      createdAt: true,
      // messageContent sengaja dihilangkan dari select publik demi keamanan
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCapsulesByAccessKey(accessKey: string) {
  return prisma.manifest.findMany({
    where: {
      accessKey,
    },
    select: {
      id: true,
      accessKey: true,
      targetName: true,
      resonateCount: true,
      unlockAt: true,
      createdAt: true,
      // messageContent sengaja dihilangkan demi keamanan data pemilik saat ditarik massal
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUnlockedCapsuleContent(id: string) {
  return prisma.manifest.findFirst({
    where: {
      id,
      unlockAt: {
        lte: new Date(), // Filter di level database: hanya ambil jika sudah terbuka
      },
    },
    select: {
      id: true,
      accessKey: true,
      targetName: true,
      messageContent: true, // Boleh diambil karena terbukti sudah unlock
      resonateCount: true,
      unlockAt: true,
      createdAt: true,
    },
  });
}

export async function getCapsuleMetadataById(id: string) {
  return prisma.manifest.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      accessKey: true,
      targetName: true,
      resonateCount: true,
      unlockAt: true,
      createdAt: true,
      // messageContent tidak diambil
    },
  });
}

export async function incrementResonate(id: string) {
  return prisma.manifest.update({
    where: {
      id,
    },
    data: {
      resonateCount: {
        increment: 1,
      },
    },
  });
}
