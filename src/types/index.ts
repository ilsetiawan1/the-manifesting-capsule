// src/types/index.ts

// ──────────────────────────────────────────────────
// RAW TYPE — Cerminan langsung dari Prisma model
// (digunakan di repository.ts)
// ──────────────────────────────────────────────────
export type Manifest = {
  id:             string;
  accessKey:      string;
  targetName:     string;
  messageContent: string;
  authorName:     string | null;
  resonateCount:  number;
  unlockAt:       Date;
  createdAt:      Date;
};

// ──────────────────────────────────────────────────
// CLIENT TYPE — Versi aman untuk dikirim ke UI
// messageContent bisa null jika kapsul masih Locked
// (digunakan di services.ts dan components)
// ──────────────────────────────────────────────────
export type ClientCapsule = {
  id:              string;
  targetName:      string;
  messageContent:  string | null; // null = masih terkunci
  authorName:      string | null;
  resonateCount:   number;
  unlockAt:        Date;
  createdAt:       Date;
  isLocked:        boolean;       // Computed field dari services
  progressPercent: number;        // 0–100, computed dari selisih waktu
  daysLeft:        number | null; // null jika sudah terbuka
  vibe:            "Career & Study" | "Love & Self" | "Random"; // Computed vibe category
};

// ──────────────────────────────────────────────────
// SERVER ACTION RESPONSE — Return type standar wajib
// (digunakan di actions.ts)
// ──────────────────────────────────────────────────
export type ServerActionResponse<T = undefined> = {
  success: boolean;
  data?:   T;
  error?:  string;
};

// ──────────────────────────────────────────────────
// FORM INPUT TYPE — Payload dari Create Capsule Form
// (digunakan di schemas.ts & actions.ts)
// ──────────────────────────────────────────────────
export type CreateCapsuleInput = {
  targetName:     string;
  messageContent: string;
  unlockAt:       Date;
  authorName?:    string;
};
