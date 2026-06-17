import { z } from "zod";

export const CreateCapsuleSchema = z.object({
  targetName: z
    .string()
    .min(1, "Nama target wajib diisi")
    .max(50, "Nama target maksimal 50 karakter"),
  messageContent: z
    .string()
    .min(10, "Isi pesan minimal 10 karakter")
    .max(1000, "Isi pesan maksimal 1000 karakter"),
  unlockAt: z
    .coerce
    .date()
    .refine((date) => {
      const minDate = new Date();
      minDate.setHours(0, 0, 0, 0);
      minDate.setDate(minDate.getDate() + 1); // minimal +1 hari dari hari ini
      return date >= minDate;
    }, "Tanggal gembok minimal harus +1 hari dari hari ini"),
  authorName: z
    .string()
    .max(30, "Nama pembuat maksimal 30 karakter")
    .optional()
    .transform((val) => (!val || val.trim() === "" ? "Anonim" : val)),
  photoUrl: z.string().nullable().optional(),
  ifNotAchieved: z.string().max(500, "Maksimal 500 karakter").nullable().optional(),
  ifAchieved: z.string().max(500, "Maksimal 500 karakter").nullable().optional(),
  isPrivate: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional().default(false),
  isAnonymousTarget: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional().default(true),
});

export const ResonateSchema = z.object({
  capsuleId: z.string().uuid("ID Kapsul tidak valid"),
});

export const SyncKeySchema = z.object({
  accessKey: z
    .string()
    .regex(/^[A-Z]{4}-[0-9]{3}-[A-Z]{3}$/, "Format Access Key harus XXXX-000-XXX"),
});
