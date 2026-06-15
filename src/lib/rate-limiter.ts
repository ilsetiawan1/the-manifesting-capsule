import { headers } from "next/headers";

interface RateLimitTracker {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitTracker>();

// Clean up old entries periodically (every 10 minutes)
if (typeof globalThis !== "undefined") {
  const globalAny = globalThis as any;
  if (!globalAny.__rateLimitCleanupRegistered) {
    setInterval(() => {
      const now = Date.now();
      for (const [key, tracker] of rateLimitMap.entries()) {
        tracker.timestamps = tracker.timestamps.filter((t) => now - t < 60000);
        if (tracker.timestamps.length === 0) {
          rateLimitMap.delete(key);
        }
      }
    }, 60000 * 10);
    globalAny.__rateLimitCleanupRegistered = true;
  }
}

/**
 * Memvalidasi rate limit untuk IP saat ini.
 * @param actionName Nama aksi (misal: 'create_capsule')
 * @param limit Jumlah request maksimum per menit
 * @returns boolean true jika diijinkan, false jika dibatasi
 */
export async function checkRateLimit(actionName: string, limit: number): Promise<boolean> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  const key = `${actionName}:${ip}`;
  const now = Date.now();
  
  let tracker = rateLimitMap.get(key);
  if (!tracker) {
    tracker = { timestamps: [] };
    rateLimitMap.set(key, tracker);
  }

  // Filter timestamp yang terjadi dalam 60 detik terakhir
  tracker.timestamps = tracker.timestamps.filter((t) => now - t < 60000);

  if (tracker.timestamps.length >= limit) {
    return false;
  }

  tracker.timestamps.push(now);
  return true;
}
