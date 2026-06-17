"use client";

import React, { useRef, useState } from "react";
import { X, Download, Link as LinkIcon, Lock, Unlock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ClientCapsule } from "@/types";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  capsule: ClientCapsule;
  onClose: () => void;
}

export default function ShareModal({ capsule, onClose }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    const toastId = toast.loading("Sedang menyiapkan kartu cerita...");

    try {
      // Tunggu font & image load
      await new Promise((resolve) => setTimeout(resolve, 600));

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        logging: true, // Untuk membantu melihat log jika ada error di konsol
        scale: 2, // Meningkatkan resolusi hasil download agar tidak pecah/blur
        backgroundColor: null, // Biarkan transparan/mengikuti gradasi latar belakang element
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `manifesting-capsule-${theme}-${capsule.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("✨ Gambar berhasil disimpan ke perangkat!", { id: toastId });
    } catch (err) {
      console.error("[html2canvas download error]:", err);
      toast.error("Gagal menyimpan gambar. Silakan coba lagi.", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/capsule/${capsule.id}`;
    navigator.clipboard.writeText(url);
    toast.success("✅ Tautan kapsul disalin ke clipboard!");
  };

  const dateObj = new Date(capsule.unlockAt);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      {/* Share Dialog */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-sm overflow-visible z-10 flex flex-col items-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full transition-all active:scale-90 bg-white/10 hover:bg-white/20 text-white z-20"
        >
          <X className="size-5" />
        </button>

        {/* Theme Switcher tabs/buttons */}
        <div className="flex bg-slate-900/80 dark:bg-black/40 backdrop-blur-md p-1 rounded-2xl border border-white/10 w-full mb-4 z-10 justify-between gap-1 shadow-lg">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5",
              theme === "light"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white/60 hover:text-white"
            )}
          >
            <span>☀️</span> Tema Terang
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5",
              theme === "dark"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white/60 hover:text-white"
            )}
          >
            <span>🌙</span> Tema Gelap
          </button>
        </div>

        {/* 9:16 Instagram Story Card Element (target for html2canvas) */}
        <div className="w-full overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/10">
          <div
            ref={cardRef}
            className={cn(
              "relative w-full aspect-[9/16] p-6 flex flex-col justify-between overflow-hidden select-none transition-all duration-300",
              theme === "light"
                ? "bg-gradient-to-tr from-slate-50 via-white to-blue-50/50"
                : "bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950"
            )}
            style={{ width: "360px", height: "640px" }}
          >
            {/* Aurora Background Glows (visible only in dark mode or soft in light mode) */}
            <div className={cn(
              "absolute top-[-20%] left-[-20%] w-[100%] h-[60%] rounded-full blur-[80px] pointer-events-none transition-all duration-350",
              theme === "light" ? "bg-blue-300/10" : "bg-blue-500/10"
            )} />
            <div className={cn(
              "absolute bottom-[-10%] right-[-10%] w-[100%] h-[60%] rounded-full blur-[80px] pointer-events-none transition-all duration-350",
              theme === "light" ? "bg-violet-300/10" : "bg-violet-600/10"
            )} />
            <div className={cn(
              "absolute top-[30%] left-[20%] w-[80%] h-[40%] rounded-full blur-[90px] pointer-events-none transition-all duration-350",
              theme === "light" ? "bg-emerald-300/5" : "bg-emerald-500/5"
            )} />

            {/* Header: App Watermark Logo (Top) */}
            <div className="flex items-center gap-2.5 z-10">
              <div className={cn(
                "relative size-8 rounded-lg overflow-hidden border flex items-center justify-center transition-all duration-300",
                theme === "light"
                  ? "border-slate-200 bg-slate-100"
                  : "border-white/20 bg-white/5"
              )}>
                <img
                  src="/logo/logo.png"
                  alt="Logo"
                  className="size-6 object-contain"
                />
              </div>
              <div>
                <h4 className={cn(
                  "text-[10px] font-black tracking-widest uppercase leading-none transition-colors duration-300",
                  theme === "light" ? "text-slate-900" : "text-white"
                )}>
                  The Manifesting Capsule
                </h4>
                <span className={cn(
                  "text-[8px] font-medium tracking-wider uppercase mt-0.5 block transition-colors duration-300",
                  theme === "light" ? "text-blue-600" : "text-blue-300"
                )}>
                  Silent Sanctuary
                </span>
              </div>
            </div>

            {/* Middle: Bento Replica Card */}
            <div className={cn(
              "w-full rounded-[2.2rem] p-5 shadow-2xl z-10 flex flex-col justify-between h-80 relative overflow-hidden transition-all duration-300",
              theme === "light"
                ? "bg-white text-slate-900 border border-slate-100"
                : "bg-white/5 border border-white/10 text-white backdrop-blur-xl"
            )}>
              {/* Card Header Vibe */}
              <div className="flex justify-between items-center mb-4">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider transition-colors duration-300",
                  theme === "light"
                    ? "bg-slate-100 text-slate-800"
                    : "bg-white/10 text-white/80"
                )}>
                  {capsule.vibe}
                </span>
                <span className={cn(
                  "text-[9px] font-medium transition-colors duration-300",
                  theme === "light" ? "text-slate-500" : "text-white/50"
                )}>
                  {formattedDate}
                </span>
              </div>

              {/* Photo representation */}
              {capsule.photoUrl ? (
                <div className={cn(
                  "w-full h-24 rounded-xl overflow-hidden mb-3 border transition-colors duration-300",
                  theme === "light" ? "border-slate-100" : "border-white/10"
                )}>
                  <img
                    src={capsule.photoUrl}
                    alt="Capsule photo"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous" // Sangat krusial untuk mencegah canvas tainting saat unduh
                  />
                </div>
              ) : (
                <div className={cn(
                  "w-full h-20 rounded-xl border flex items-center justify-center mb-3 transition-all duration-300",
                  theme === "light"
                    ? "bg-slate-50 border-slate-200/50 text-slate-400"
                    : "bg-white/5 border-white/5 text-white/30"
                )}>
                  <span className="text-[10px] italic">Terkunci dalam waktu...</span>
                </div>
              )}

              {/* Sender & Receiver Info */}
              <div className={cn(
                "flex flex-row items-center justify-between w-full border-b pb-2 mb-3 text-[10px] transition-colors duration-300",
                theme === "light"
                  ? "border-slate-100 text-slate-600"
                  : "border-white/10 text-white/70"
              )}>
                <div className="flex items-center gap-1 min-w-0">
                  <User className={cn("size-3", theme === "light" ? "text-slate-400" : "text-white/40")} />
                  <span className="truncate">Dari: <span className="font-semibold">{capsule.authorName || "Anonim"}</span></span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="truncate">Untuk: <span className="font-semibold">{capsule.targetName}</span></span>
                  <ArrowRight className={cn("size-3", theme === "light" ? "text-slate-400" : "text-white/40")} />
                </div>
              </div>

              {/* Status Message */}
              <div className="flex-1 flex flex-col justify-center mb-3">
                {capsule.isLocked ? (
                  <div className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-300",
                    theme === "light"
                      ? "bg-blue-50/50 border-blue-100/50 text-blue-800"
                      : "bg-white/5 border-white/5 text-blue-200"
                  )}>
                    <Lock className={cn("size-3.5 shrink-0 transition-colors duration-300", theme === "light" ? "text-blue-600" : "text-blue-300")} />
                    <span className="text-[9px] leading-tight">
                      Kapsul ini tersegel dan baru dapat dibuka dalam {capsule.daysLeft} hari lagi.
                    </span>
                  </div>
                ) : (
                  <div className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-300",
                    theme === "light"
                      ? "bg-emerald-50/50 border-emerald-100/50 text-emerald-800"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-250"
                  )}>
                    <Unlock className={cn("size-3.5 shrink-0 transition-colors duration-300", theme === "light" ? "text-emerald-600" : "text-emerald-350")} />
                    <span className="text-[9px] leading-tight">
                      Kapsul manifestasi ini telah terbuka sepenuhnya!
                    </span>
                  </div>
                )}
              </div>

              {/* Time progress bar */}
              <div className="space-y-1">
                <div className={cn(
                  "flex justify-between items-center text-[8px] transition-colors duration-300",
                  theme === "light" ? "text-slate-500" : "text-white/60"
                )}>
                  <span>Progress Kematangan:</span>
                  <span className="font-mono">{capsule.progressPercent}%</span>
                </div>
                <div className={cn(
                  "w-full h-1 rounded-full overflow-hidden transition-colors duration-300",
                  theme === "light" ? "bg-slate-100" : "bg-white/10"
                )}>
                  <div
                    className={cn(
                      "h-full rounded-full transition-colors duration-300",
                      theme === "light" ? "bg-blue-600" : "bg-blue-400"
                    )}
                    style={{ width: `${capsule.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Watermark & Call To Action */}
            <div className="flex flex-col items-center gap-1 z-10">
              <span className={cn(
                "text-[9px] tracking-wider font-semibold transition-colors duration-300",
                theme === "light" ? "text-slate-400" : "text-white/40"
              )}>
                Kunci manifestasimu sendiri di:
              </span>
              <span className={cn(
                "text-xs font-bold px-4 py-1.5 rounded-full tracking-wide transition-all duration-300 border",
                theme === "light"
                  ? "text-slate-800 bg-slate-100 border-slate-200 shadow-sm"
                  : "text-white/90 bg-white/5 border-white/10"
              )}>
                the-manifesting-capsule.vercel.app
              </span>
            </div>
          </div>
        </div>

        {/* Footer Modal Share Controls */}
        <div className="w-full flex gap-3 mt-4">
          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/80 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
          >
            <Download className="size-4" />
            <span>{isDownloading ? "Menyimpan..." : "Simpan Foto"}</span>
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl border border-slate-700/50 active:scale-95 transition-all"
            aria-label="Salin Tautan"
          >
            <LinkIcon className="size-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
