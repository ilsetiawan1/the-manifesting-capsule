// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const seedData = [
  {
    accessKey: 'DEMO-001-AAA',
    authorName: 'Indra',
    targetName: 'Diri Sendiri',
    messageContent: 'Kamu berhasil. Kamu akhirnya bisa beristirahat dengan tenang. Tidak ada yang perlu dibuktikan lagi kepada siapa pun.',
    ifAchieved: 'Rayakan dengan liburan ke tempat yang selama ini kamu impikan.',
    ifNotAchieved: 'Evaluasi ulang, ambil napas, dan mulai lagi dengan strategi yang lebih baik.',
    photoUrl: null,
    resonateCount: 102,
    unlockAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40),
  },
  {
    accessKey: 'DEMO-002-BBB',
    authorName: 'Citra',
    targetName: 'Kamu',
    messageContent: 'Kalau kamu baca ini, berarti kita berhasil melewati semua yang pernah kita takutkan bersama.',
    ifAchieved: 'Makan malam berdua di tempat pertama kali kita kenal.',
    ifNotAchieved: 'Tetap berjalan bersama, karena prosesnya lebih penting dari hasilnya.',
    photoUrl: null,
    resonateCount: 88,
    unlockAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 33),
  },
  {
    accessKey: 'DEMO-003-CCC',
    authorName: 'Dewi',
    targetName: 'Versi Terbaik Saya',
    messageContent: 'Di tanggal ini, aku sudah punya usaha sendiri yang menghasilkan cukup untuk keluarga.',
    ifAchieved: 'Traktir seluruh keluarga makan di restoran pilihan mereka.',
    ifNotAchieved: 'Tidak apa-apa. Aku akan tetap berjalan, satu langkah lebih kecil pun tetap maju.',
    photoUrl: null,
    resonateCount: 15,
    unlockAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
  },
  {
    accessKey: 'DEMO-004-DDD',
    authorName: 'Eko',
    targetName: 'Sahabatku',
    messageContent: 'Aku berharap di saat kamu baca ini, kamu sudah menemukan ketenangan yang selama ini kamu cari.',
    ifAchieved: null,
    ifNotAchieved: null,
    photoUrl: null,
    resonateCount: 7,
    unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    accessKey: 'DEMO-005-EEE',
    authorName: 'Fajar',
    targetName: 'Ibuku',
    messageContent: 'Ibu, terima kasih sudah sabar menunggu anakmu ini berkembang pelan-pelan.',
    ifAchieved: null,
    ifNotAchieved: null,
    photoUrl: null,
    resonateCount: 23,
    unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    accessKey: 'DEMO-006-GGG',
    authorName: 'Gita',
    targetName: 'Mimpi Karir',
    messageContent: 'Aku percaya posisi yang aku impikan itu nyata dan layak untuk aku perjuangkan.',
    ifAchieved: 'Beli kamera mirrorless yang sudah lama aku incar.',
    ifNotAchieved: 'Ambil kursus baru dan perluas jaringan profesional.',
    photoUrl: null,
    resonateCount: 3,
    unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    accessKey: 'DEMO-007-HHH',
    authorName: 'Hendra',
    targetName: 'Si Dia',
    messageContent: 'Semoga saat kamu baca ini, kamu sudah tahu betapa berharganya dirimu.',
    ifAchieved: null,
    ifNotAchieved: null,
    photoUrl: null,
    resonateCount: 56,
    unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    accessKey: 'DEMO-008-III',
    authorName: 'Mie Ayam',
    targetName: 'Bakso',
    messageContent: 'Kita sudah melewati semua badai bersama. Ini saatnya menikmati hasilnya.',
    ifAchieved: 'Liburan berdua ke Bali.',
    ifNotAchieved: 'Kita evaluasi bersama dan coba lagi dengan cara yang berbeda.',
    photoUrl: null,
    resonateCount: 0,
    unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
  },
];

async function main() {
  console.log('🌱 Menghapus data seed lama...');
  await prisma.manifest.deleteMany({
    where: { accessKey: { startsWith: 'DEMO-' } },
  });

  console.log('🌱 Menanam data seed baru...\n');
  for (const item of seedData) {
    const capsule = await prisma.manifest.create({ data: item });
    const status = new Date() >= new Date(capsule.unlockAt) ? '✅ Awakened' : '🔒 Locked  ';
    console.log(`  ${status}  [${capsule.accessKey}] UNTUK: "${capsule.targetName}" oleh ${capsule.authorName}`);
  }

  console.log(`\n✨ Selesai! ${seedData.length} kapsul berhasil ditanam.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeder gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
