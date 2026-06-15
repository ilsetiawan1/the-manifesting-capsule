// prisma/seed.ts
// Jalankan dengan: pnpm prisma db seed

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

// ──────────────────────────────────────────────────
// Data tiruan: 8 kapsul manifestasi anonim
// Campuran status: beberapa sudah Awakened, beberapa masih Locked
// ──────────────────────────────────────────────────
const seedData = [
  {
    accessKey:      'DEMO-001-AAA',
    targetName:     'Diriku di Masa Depan',
    messageContent: 'Aku percaya bahwa di akhir tahun ini aku sudah lulus cum laude. Aku sudah bekerja keras tanpa henti dan hasilnya pasti sepadan. Kamu kuat, kamu mampu.',
    resonateCount:  42,
    unlockAt:       new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // Sudah terbuka 10 hari lalu
  },
  {
    accessKey:      'DEMO-002-BBB',
    targetName:     'Kamu',
    messageContent: 'Kalau kamu baca ini, berarti kita berhasil melewati semua yang pernah kita takutkan. Terima kasih sudah tidak menyerah.',
    resonateCount:  88,
    unlockAt:       new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // Sudah terbuka 3 hari lalu
  },
  {
    accessKey:      'DEMO-003-CCC',
    targetName:     'Versi Terbaik Saya',
    messageContent: 'Di tanggal ini, aku sudah punya usaha sendiri yang menghasilkan cukup untuk keluarga. Tidak perlu besar, cukup — dan itu sudah luar biasa.',
    resonateCount:  15,
    unlockAt:       new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // Sudah terbuka 30 hari lalu
  },
  {
    accessKey:      'DEMO-004-DDD',
    targetName:     'Sahabatku',
    messageContent: '[LOCKED CONTENT]', // Akan otomatis ter-censor di UI
    resonateCount:  7,
    unlockAt:       new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // Masih terkunci 30 hari lagi
  },
  {
    accessKey:      'DEMO-005-EEE',
    targetName:     'Ibuku',
    messageContent: '[LOCKED CONTENT]',
    resonateCount:  23,
    unlockAt:       new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // Masih terkunci 90 hari lagi
  },
  {
    accessKey:      'DEMO-006-FFF',
    targetName:     'Mimpi Karir',
    messageContent: '[LOCKED CONTENT]',
    resonateCount:  3,
    unlockAt:       new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), // Masih terkunci 180 hari lagi
  },
  {
    accessKey:      'DEMO-007-GGG',
    targetName:     'Si Dia',
    messageContent: '[LOCKED CONTENT]',
    resonateCount:  56,
    unlockAt:       new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // Masih terkunci 14 hari lagi
  },
  {
    accessKey:      'DEMO-008-HHH',
    targetName:     'Diri Sendiri',
    messageContent: 'Kamu berhasil. Kamu akhirnya bisa beristirahat dengan tenang. Tidak ada yang perlu dibuktikan lagi.',
    resonateCount:  101,
    unlockAt:       new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // Baru terbuka kemarin
  },
];

async function main() {
  console.log('🌱 Memulai proses seeder...\n');

  // Bersihkan data lama sebelum seed ulang (development only)
  await prisma.manifest.deleteMany({
    where: {
      accessKey: {
        startsWith: 'DEMO-', // Hanya hapus data seeder, bukan data real
      },
    },
  });

  for (const item of seedData) {
    const capsule = await prisma.manifest.create({ data: item });
    const status  = new Date() >= new Date(capsule.unlockAt) ? '✅ Awakened' : '🔒 Locked';
    console.log(`  ${status}  [${capsule.accessKey}] "${capsule.targetName}"`);
  }

  console.log(`\n✨ Seeder selesai! ${seedData.length} kapsul berhasil ditanam.`);
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
