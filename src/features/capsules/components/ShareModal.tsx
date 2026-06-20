"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Download, Link as LinkIcon, Lock, Unlock, User, ArrowRight, Sun, Moon, Sparkles } from "lucide-react";
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
  const [scale, setScale] = useState(1);

  // Dynamic scaling for mobile responsiveness (maintaining high resolution 360x640 capture)
  useEffect(() => {
    const handleResize = () => {
      const availableWidth = window.innerWidth - 32; // 16px horizontal padding
      const availableHeight = window.innerHeight - 180; // height buffer for buttons/switcher
      
      const widthScale = Math.min(1, availableWidth / 360);
      const heightScale = Math.min(1, availableHeight / 640);
      
      setScale(Math.min(widthScale, heightScale));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        logging: process.env.NODE_ENV === "development",
        scale: 2, // Capture at high-resolution
        backgroundColor: theme === "light" ? "#ffffff" : "#0f172a", // fallback solid color
        width: 360,
        height: 640,
        windowWidth: 360,
        windowHeight: 640,
      });

      // Gunakan canvas.toBlob (lebih stabil untuk Windows daripada base64 toDataURL)
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Gagal membuat berkas gambar.", { id: toastId });
          setIsDownloading(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const fileName = `manifesting-capsule-${theme}-${Date.now()}.png`;

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke object URL setelah sedikit delay untuk memastikan browser selesai mendownload
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 150);

        toast.success("Gambar berhasil disimpan ke perangkat!", { id: toastId });
        setIsDownloading(false);
      }, "image/png");

    } catch (err) {
      console.error("[html2canvas download error]:", err);
      toast.error("Gagal menyimpan gambar. Silakan coba lagi.", { id: toastId });
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/capsule/${capsule.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Tautan kapsul disalin ke clipboard!");
  };

  const dateObj = new Date(capsule.unlockAt);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Reusable card content layout using raw HEX/RGBA colors to avoid oklab/oklch parser errors in html2canvas
  const renderCardContent = () => {
    const isLight = theme === "light";
    const colors = {
      cardBg: isLight 
        ? "linear-gradient(to bottom right, #f8fafc, #ffffff, #eff6ff)" 
        : "linear-gradient(to bottom, #020617, #0f172a, #0c0a2e)",
      cardBorder: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)",
      textPrimary: isLight ? "#0f172a" : "#ffffff",
      textSecondary: isLight ? "#475569" : "rgba(255, 255, 255, 0.7)",
      textMuted: isLight ? "#64748b" : "rgba(255, 255, 255, 0.4)",
      logoBorder: isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.2)",
      logoBg: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
      logoTextSub: isLight ? "#2563eb" : "#93c5fd",
      sparkles: isLight ? "#3b82f6" : "#93c5fd",
      lockIcon: isLight ? "#64748b" : "rgba(255, 255, 255, 0.4)",
      successIcon: isLight ? "#16a34a" : "#34d399",
      successText: isLight ? "#16a34a" : "#34d399",
      divider: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.2)",
      ctaText: isLight ? "#64748b" : "rgba(255, 255, 255, 0.5)",
      ctaBadgeBg: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
      ctaBadgeBorder: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)",
      glow1: isLight ? "rgba(147, 197, 253, 0.1)" : "rgba(59, 130, 246, 0.1)",
      glow2: isLight ? "rgba(196, 181, 253, 0.1)" : "rgba(124, 58, 237, 0.1)",
      glow3: isLight ? "rgba(110, 231, 183, 0.05)" : "rgba(16, 185, 129, 0.05)",
    };

    return (
      <div
        className="relative w-full h-full p-6 flex flex-col justify-between overflow-hidden rounded-[2.5rem] select-none transition-all duration-300"
        style={{
          background: colors.cardBg,
          borderColor: colors.cardBorder,
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >
        {/* Photo Background (renders as overlay background if photo exists and unlocked) */}
        {capsule.photoUrl && !capsule.isLocked && (
          <div className="absolute inset-0 z-0">
            <img
              src={capsule.photoUrl}
              alt=""
              className="w-full h-full object-cover opacity-25"
              crossOrigin="anonymous"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: isLight
                  ? "linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.95))"
                  : "linear-gradient(to bottom, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.7), rgba(2, 6, 23, 0.95))"
              }}
            />
          </div>
        )}

        {/* Aurora Background Glows (only visible when there is no background photo) */}
        {(!capsule.photoUrl || capsule.isLocked) && (
          <>
            <div
              className="absolute top-[-20%] left-[-20%] w-[100%] h-[60%] rounded-full blur-[80px] pointer-events-none transition-all duration-350"
              style={{ background: colors.glow1 }}
            />
            <div
              className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[60%] rounded-full blur-[80px] pointer-events-none transition-all duration-350"
              style={{ background: colors.glow2 }}
            />
            <div
              className="absolute top-[30%] left-[20%] w-[80%] h-[40%] rounded-full blur-[90px] pointer-events-none transition-all duration-350"
              style={{ background: colors.glow3 }}
            />
          </>
        )}

        {/* Header: App Watermark Logo (Top) */}
        <div className="flex items-center gap-2.5 z-10">
          <div
            className="relative size-8 rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300"
            style={{
              border: `1px solid ${colors.logoBorder}`,
              backgroundColor: colors.logoBg,
            }}
          >
            <img
              src="/logo/logo.png"
              alt="Logo"
              className="size-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <h4
              className="text-[10px] font-black tracking-widest uppercase leading-none transition-colors duration-300"
              style={{ color: colors.textPrimary }}
            >
              The Manifesting Capsule
            </h4>
            <span
              className="text-[8px] font-medium tracking-wider uppercase mt-0.5 block transition-colors duration-300"
              style={{ color: colors.logoTextSub }}
            >
              Silent Sanctuary
            </span>
          </div>
        </div>

        {/* Hero Message Content Panel */}
        {!capsule.isLocked ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 z-10">
            <Sparkles
              className="size-5 mb-4 opacity-30"
              style={{ color: colors.sparkles }}
            />
            <p
              className="text-base leading-relaxed font-serif italic line-clamp-6 transition-colors duration-300"
              style={{ color: colors.textPrimary }}
            >
              "{capsule.messageContent}"
            </p>
            <Sparkles
              className="size-5 mt-4 opacity-30"
              style={{ color: colors.sparkles }}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 z-10">
            <Lock
              className="size-6 mb-4 opacity-40"
              style={{ color: colors.lockIcon }}
            />
            <p
              className="text-sm italic transition-colors duration-300"
              style={{ color: colors.textSecondary }}
            >
              Sebuah manifestasi sedang tersegel...
            </p>
            {/* Visual Teaser Placeholder Lines */}
            <div className="mt-4 space-y-2.5 w-full px-6">
              <div
                className="h-1.5 rounded-full mx-auto w-[85%]"
                style={{ backgroundColor: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)" }}
              />
              <div
                className="h-1.5 rounded-full mx-auto w-[70%]"
                style={{ backgroundColor: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)" }}
              />
              <div
                className="h-1.5 rounded-full mx-auto w-[55%]"
                style={{ backgroundColor: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)" }}
              />
            </div>
          </div>
        )}

        {/* Sender & Receiver Info */}
        <div className="text-center mb-1 z-10">
          <p
            className="text-base font-black tracking-tight transition-colors duration-300"
            style={{ color: colors.textPrimary }}
          >
            Untuk {capsule.isAnonymousTarget ? "Anonim" : capsule.targetName}
          </p>
          <p
            className="text-[11px] font-medium mt-0.5 transition-colors duration-300"
            style={{ color: colors.textMuted }}
          >
            dari {capsule.authorName || "Anonim"}
          </p>
        </div>

        {/* Status Info */}
        <div className="flex items-center justify-center gap-1.5 mb-4 z-10">
          {capsule.isLocked ? (
            <>
              <Lock
                className="size-3"
                style={{ color: colors.textMuted }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: colors.textMuted }}
              >
                Terbuka dalam {capsule.daysLeft} hari
              </span>
            </>
          ) : (
            <>
              <Unlock
                className="size-3"
                style={{ color: colors.successIcon }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: colors.successText }}
              >
                Terbuka sepenuhnya
              </span>
            </>
          )}
        </div>

        {/* Bottom Watermark & Call To Action */}
        <div className="flex flex-col items-center gap-1.5 z-10 pb-1">
          <div
            className="w-8 h-[1px] mb-1"
            style={{ backgroundColor: colors.divider }}
          />
          <span
            className="text-[10px] font-medium transition-colors duration-300"
            style={{ color: colors.ctaText }}
          >
            Apa manifestasimu?
          </span>
          <span
            className="text-[11px] font-bold px-4 py-1.5 rounded-full tracking-wide transition-all duration-300"
            style={{
              color: colors.textPrimary,
              backgroundColor: colors.ctaBadgeBg,
              border: `1px solid ${colors.ctaBadgeBorder}`,
            }}
          >
            the-manifesting-capsule.vercel.app
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
        className="relative w-full max-w-sm z-10 flex flex-col items-center max-h-[90vh] overflow-y-auto scrollbar-hide p-1"
      >
        {/* Close Button (Relatively placed inside scrollable container) */}
        <button
          onClick={onClose}
          className="sticky top-2 self-end mr-2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white z-30 shadow-lg active:scale-90 transition-all mb-2"
          aria-label="Tutup"
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
            <Sun className="size-3.5" /> Tema Terang
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
            <Moon className="size-3.5" /> Tema Gelap
          </button>
        </div>

        {/* PREVIEW — yang terlihat user, boleh di-scale */}
        <div
          className="flex items-center justify-center overflow-visible"
          style={{
            width: `${360 * scale}px`,
            height: `${640 * scale}px`,
            transition: "all 0.2s ease-out",
          }}
        >
          <div
            style={{
              width: "360px",
              height: "640px",
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              flexShrink: 0,
            }}
          >
            {renderCardContent()}
          </div>
        </div>

        {/* CAPTURE TARGET — tersembunyi, TANPA transform, ukuran asli pasti */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: "-9999px",
            width: "360px",
            height: "640px",
          }}
        >
          <div ref={cardRef} style={{ width: "360px", height: "640px" }}>
            {renderCardContent()}
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
