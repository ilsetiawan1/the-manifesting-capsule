import { prisma } from "@/lib/prisma";
import { Manifest } from "@/types";

export async function createCapsule(data: {
  accessKey: string;
  targetName: string;
  messageContent: string;
  unlockAt: Date;
  authorName?: string | null;
  photoUrl?: string | null;
  ifNotAchieved?: string | null;
  ifAchieved?: string | null;
  isPrivate?: boolean;
  isAnonymousTarget?: boolean;
}) {
  return prisma.manifest.create({
    data,
  });
}

export async function getPublicCapsules(page = 1, limit = 6) {
  const skip = (page - 1) * limit;
  const [capsules, total] = await Promise.all([
    prisma.manifest.findMany({
      where: {
        isPrivate: false,
      },
      select: {
        id: true,
        accessKey: true,
        targetName: true,
        authorName: true,
        resonateCount: true,
        unlockAt: true,
        createdAt: true,
        photoUrl: true,
        isPrivate: true,
        isAnonymousTarget: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.manifest.count({
      where: {
        isPrivate: false,
      },
    }),
  ]);
  return { capsules, total, hasMore: skip + limit < total };
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
      authorName: true,
      messageContent: true, // Diperlukan untuk menampilkan pesan kartu yang sudah terbuka di history
      resonateCount: true,
      unlockAt: true,
      createdAt: true,
      photoUrl: true,
      ifNotAchieved: true,
      ifAchieved: true,
      isPrivate: true,
      isAnonymousTarget: true,
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
      authorName: true,
      messageContent: true, // Boleh diambil karena terbukti sudah unlock
      resonateCount: true,
      unlockAt: true,
      createdAt: true,
      photoUrl: true,
      ifNotAchieved: true,
      ifAchieved: true,
      isPrivate: true,
      isAnonymousTarget: true,
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
      authorName: true,
      resonateCount: true,
      unlockAt: true,
      createdAt: true,
      photoUrl: true,
      isPrivate: true,
      isAnonymousTarget: true,
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
