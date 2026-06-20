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

      const dataUrl = canvas.toDataURL("image/png");

      // Deteksi jika hasil capture kosong/blank (kemungkinan tainted canvas)
      if (dataUrl === "data:,") {
        throw new Error("Canvas kosong — kemungkinan masalah CORS pada gambar");
      }

      const link = document.createElement("a");
      link.download = `manifesting-capsule-${theme}-${capsule.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link); // pastikan link ter-attach ke DOM (fix Safari)
      link.click();
      document.body.removeChild(link);

      toast.success("Gambar berhasil disimpan ke perangkat!", { id: toastId });
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
    toast.success("Tautan kapsul disalin ke clipboard!");
  };

  const dateObj = new Date(capsule.unlockAt);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Reusable card content layout to avoid duplication
  const renderCardContent = () => (
    <div
      className={cn(
        "relative w-full h-full p-6 flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 select-none transition-all duration-300",
        theme === "light"
          ? "bg-gradient-to-tr from-slate-50 via-white to-blue-50/50"
          : "bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950"
      )}
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
          <div className={cn(
            "absolute inset-0",
            theme === "light"
              ? "bg-gradient-to-b from-white/90 via-white/70 to-white/95"
              : "bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/95"
          )} />
        </div>
      )}

      {/* Aurora Background Glows (only visible when there is no background photo) */}
      {(!capsule.photoUrl || capsule.isLocked) && (
        <>
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
        </>
      )}

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
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
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

      {/* Hero Message Content Panel */}
      {!capsule.isLocked ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 z-10">
          <Sparkles className={cn("size-5 mb-4 opacity-30", theme === "light" ? "text-blue-500" : "text-blue-300")} />
          <p className={cn(
            "text-base leading-relaxed font-serif italic line-clamp-6 transition-colors duration-300",
            theme === "light" ? "text-slate-800" : "text-white"
          )}>
            "{capsule.messageContent}"
          </p>
          <Sparkles className={cn("size-5 mt-4 opacity-30", theme === "light" ? "text-blue-500" : "text-blue-300")} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 z-10">
          <Lock className={cn("size-6 mb-4 opacity-40", theme === "light" ? "text-slate-500" : "text-white/40")} />
          <p className={cn(
            "text-sm italic transition-colors duration-300",
            theme === "light" ? "text-slate-500" : "text-white/60"
          )}>
            Sebuah manifestasi sedang tersegel...
          </p>
          {/* Visual Teaser Placeholder Lines */}
          <div className="mt-4 space-y-2.5 w-full px-6">
            <div className={cn("h-1.5 rounded-full mx-auto w-[85%]", theme === "light" ? "bg-slate-200" : "bg-white/10")} />
            <div className={cn("h-1.5 rounded-full mx-auto w-[70%]", theme === "light" ? "bg-slate-200" : "bg-white/10")} />
            <div className={cn("h-1.5 rounded-full mx-auto w-[55%]", theme === "light" ? "bg-slate-200" : "bg-white/10")} />
          </div>
        </div>
      )}

      {/* Sender & Receiver Info */}
      <div className="text-center mb-1 z-10">
        <p className={cn(
          "text-base font-black tracking-tight transition-colors duration-300",
          theme === "light" ? "text-slate-900" : "text-white"
        )}>
          Untuk {capsule.isAnonymousTarget ? "Anonim" : capsule.targetName}
        </p>
        <p className={cn(
          "text-[11px] font-medium mt-0.5 transition-colors duration-300",
          theme === "light" ? "text-slate-400" : "text-white/40"
        )}>
          dari {capsule.authorName || "Anonim"}
        </p>
      </div>

      {/* Status Info */}
      <div className="flex items-center justify-center gap-1.5 mb-4 z-10">
        {capsule.isLocked ? (
          <>
            <Lock className={cn("size-3", theme === "light" ? "text-slate-400" : "text-white/40")} />
            <span className={cn("text-[10px] font-semibold", theme === "light" ? "text-slate-400" : "text-white/40")}>
              Terbuka dalam {capsule.daysLeft} hari
            </span>
          </>
        ) : (
          <>
            <Unlock className={cn("size-3", theme === "light" ? "text-emerald-600" : "text-emerald-400")} />
            <span className={cn("text-[10px] font-semibold", theme === "light" ? "text-emerald-600" : "text-emerald-400")}>
              Terbuka sepenuhnya
            </span>
          </>
        )}
      </div>

      {/* Bottom Watermark & Call To Action */}
      <div className="flex flex-col items-center gap-1.5 z-10 pb-1">
        <div className={cn(
          "w-8 h-[1px] mb-1",
          theme === "light" ? "bg-slate-300" : "bg-white/20"
        )} />
        <span className={cn(
          "text-[10px] font-medium transition-colors duration-300",
          theme === "light" ? "text-slate-500" : "text-white/50"
        )}>
          Apa manifestasimu?
        </span>
        <span className={cn(
          "text-[11px] font-bold px-4 py-1.5 rounded-full tracking-wide transition-all duration-300 border",
          theme === "light"
            ? "text-slate-800 bg-slate-100 border-slate-200"
            : "text-white/90 bg-white/5 border-white/10"
        )}>
          the-manifesting-capsule.vercel.app
        </span>
      </div>
    </div>
  );

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
