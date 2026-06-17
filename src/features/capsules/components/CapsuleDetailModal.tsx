"use client";

import React, { useState, useEffect } from "react";
import { X, Lock, Unlock, Heart, Check, Share2, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientCapsule } from "@/types";
import { getUnlockedCapsuleContentAction, resonateAction } from "../actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ShareModal from "./ShareModal";

interface CapsuleDetailModalProps {
  initialCapsule: ClientCapsule;
  onClose: () => void;
  onResonateSuccess: (capsuleId: string, newCount: number) => void;
}

export default function CapsuleDetailModal({
  initialCapsule,
  onClose,
  onResonateSuccess,
}: CapsuleDetailModalProps) {
  const [capsule, setCapsule] = useState<ClientCapsule>(initialCapsule);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasResonated, setHasResonated] = useState(false);
  const [resonateCount, setResonateCount] = useState(initialCapsule.resonateCount);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Load capsule data (fetch unlocked content if it is awakened but we only have metadata)
  useEffect(() => {
    const loadUnlockedContent = async () => {
      if (!initialCapsule.isLocked && !initialCapsule.messageContent) {
        setIsLoading(true);
        try {
          const res = await getUnlockedCapsuleContentAction(initialCapsule.id);
          if (res.success && res.data) {
            setCapsule(res.data);
            setResonateCount(res.data.resonateCount);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCapsule(initialCapsule);
        setResonateCount(initialCapsule.resonateCount);
      }
    };

    loadUnlockedContent();

    // Check local resonance status
    const resonatedList = JSON.parse(localStorage.getItem("resonated_capsules") || "[]");
    setHasResonated(resonatedList.includes(initialCapsule.id));
  }, [initialCapsule]);

  // Countdown Timer ticking
  useEffect(() => {
    if (!capsule || !capsule.isLocked) return;

    const timer = setInterval(() => {
      const difference = new Date(capsule.unlockAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Reload capsule content since it has unlocked
        getUnlockedCapsuleContentAction(capsule.id).then((res) => {
          if (res.success && res.data) setCapsule(res.data);
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [capsule]);

  const handleResonate = async () => {
    if (hasResonated) return;

    setResonateCount((prev) => prev + 1);
    setHasResonated(true);

    try {
      const resonatedList = JSON.parse(localStorage.getItem("resonated_capsules") || "[]");
      resonatedList.push(capsule.id);
      localStorage.setItem("resonated_capsules", JSON.stringify(resonatedList));

      const res = await resonateAction(capsule.id);
      if (res.success) {
        onResonateSuccess(capsule.id, res.data?.resonateCount || resonateCount + 1);
        toast.success("✨ Resonansi ditambahkan!");
      } else {
        setResonateCount((prev) => prev - 1);
        setHasResonated(false);
        const index = resonatedList.indexOf(capsule.id);
        if (index > -1) resonatedList.splice(index, 1);
        localStorage.setItem("resonated_capsules", JSON.stringify(resonatedList));
        toast.error("Gagal mengirimkan resonansi.");
      }
    } catch (err) {
      setResonateCount((prev) => prev - 1);
      setHasResonated(false);
      toast.error("Gagal mengirimkan resonansi.");
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/capsule/${capsule.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("✅ Tautan kapsul disalin!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Ignore clicks on buttons/interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest(".no-flip")) {
      return;
    }

    if (capsule.isLocked) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast.error("🔒 Kapsul ini masih terkunci!");
    } else {
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal Dialog with Perspective */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md overflow-visible z-10 flex flex-col p-0 select-none [perspective:1000px]"
      >
        {/* Close Button (outside/above the card to avoid being rotated) */}
        <button
          onClick={onClose}
          className={cn(
            "absolute -top-12 right-0 p-2 rounded-full transition-all active:scale-90 bg-white/10 hover:bg-white/20 text-white z-20"
          )}
        >
          <X className="size-5" />
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[2.5rem] p-6 shadow-2xl">
            <div className="size-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-xs font-semibold text-slate-400">Memuat isi kapsul...</span>
          </div>
        ) : (
          /* Flipping Card Container */
          <motion.div
            onClick={handleCardClick}
            animate={
              isShaking
                ? { x: [-10, 10, -10, 10, -5, 5, -2, 2, 0] }
                : { rotateY: isFlipped ? 180 : 0 }
            }
            transition={
              isShaking
                ? { duration: 0.5 }
                : { type: "spring", stiffness: 80, damping: 15 }
            }
            style={{ transformStyle: "preserve-3d" }}
            className={cn(
              "w-full rounded-[2.5rem] border shadow-2xl relative cursor-pointer min-h-[480px] transition-colors duration-500",
              capsule.isLocked
                ? "bg-white border-slate-100 text-slate-900"
                : isFlipped
                ? "bg-slate-950 border-slate-800 text-white"
                : "bg-blue-900 border-blue-800 text-white"
            )}
          >
            {/* FRONT SIDE */}
            <div
              style={{ backfaceVisibility: "hidden" }}
              className="w-full h-full p-6 flex flex-col justify-between space-y-4"
            >
              {/* Header / Vibe Category */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    capsule.isLocked
                      ? "bg-slate-100 text-slate-500 border border-slate-200/50"
                      : "bg-blue-800/80 text-blue-200"
                  )}
                >
                  {capsule.vibe}
                </span>
                {!capsule.isLocked && (
                  <span className="text-xs font-semibold text-blue-200 animate-pulse flex items-center gap-1">
                    ✨ Tap untuk Balik
                  </span>
                )}
              </div>

              {/* Photo Uploaded if any */}
              {capsule.photoUrl && (
                <div className="w-full rounded-2xl overflow-hidden shadow-inner no-flip">
                  <img
                    src={capsule.photoUrl}
                    alt="Capsule photo"
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}

              {/* Target & Sender/Receiver Info Row */}
              <div className={cn(
                "flex items-center justify-between w-full border-b pb-3 mb-4",
                capsule.isLocked 
                  ? "border-slate-100" 
                  : "border-blue-800/40"
              )}>
                <span className={cn(
                  "text-xs sm:text-sm font-medium",
                  capsule.isLocked 
                    ? "text-slate-500 dark:text-slate-400" 
                    : "text-blue-200"
                )}>
                  {capsule.authorName || "Anonim"}
                </span>
                <div className="flex-1 mx-3 flex items-center">
                  <div className={cn(
                    "flex-1 border-b border-dashed",
                    capsule.isLocked ? "border-[#D4AF37]/20" : "border-blue-300/30"
                  )} />
                  <span className={cn(
                    "px-2 text-xs",
                    capsule.isLocked ? "text-[#D4AF37]/45" : "text-blue-300/60"
                  )}>
                    ✦
                  </span>
                  <div className={cn(
                    "flex-1 border-b border-dashed",
                    capsule.isLocked ? "border-[#D4AF37]/20" : "border-blue-300/30"
                  )} />
                </div>
                <span className={cn(
                  "text-xs sm:text-sm font-semibold capitalize",
                  capsule.isLocked ? "text-[#D4AF37]" : "text-blue-355"
                )}>
                  {capsule.targetName}
                </span>
              </div>

              {/* Content Body / Countdown */}
              {capsule.isLocked ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-3xl flex items-center gap-3">
                    <div className="p-2 bg-slate-200/60 text-slate-500 rounded-2xl">
                      <Lock className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Harapan Masih Terkunci</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                        Pesan ini aman tersegel sampai tanggal gembok yang ditentukan.
                      </p>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Waktu Tersisa:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-slate-50 py-2.5 rounded-2xl border border-slate-100">
                        <span className="block font-mono text-base font-bold text-slate-800">
                          {timeLeft.days}
                        </span>
                        <span className="block text-[9px] text-slate-400 uppercase font-semibold">
                          Hari
                        </span>
                      </div>
                      <div className="bg-slate-50 py-2.5 rounded-2xl border border-slate-100">
                        <span className="block font-mono text-base font-bold text-slate-800">
                          {timeLeft.hours}
                        </span>
                        <span className="block text-[9px] text-slate-400 uppercase font-semibold">
                          Jam
                        </span>
                      </div>
                      <div className="bg-slate-50 py-2.5 rounded-2xl border border-slate-100">
                        <span className="block font-mono text-base font-bold text-slate-800">
                          {timeLeft.minutes}
                        </span>
                        <span className="block text-[9px] text-slate-400 uppercase font-semibold">
                          Menit
                        </span>
                      </div>
                      <div className="bg-slate-50 py-2.5 rounded-2xl border border-slate-100">
                        <span className="block font-mono text-base font-bold text-slate-800">
                          {timeLeft.seconds}
                        </span>
                        <span className="block text-[9px] text-slate-400 uppercase font-semibold">
                          Detik
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-950/20 border border-blue-800/10 rounded-3xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-200 rounded-2xl">
                      <Unlock className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Harapan Telah Terbuka!</h4>
                      <p className="text-[10px] text-blue-200 mt-0.5 leading-normal">
                        Ketuk kartu ini untuk membalik dan melihat isi manifestasimu.
                      </p>
                    </div>
                  </div>
                  <span className="text-xl">🔄</span>
                </div>
              )}

              {/* Time progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className={capsule.isLocked ? "text-slate-400" : "text-blue-200"}>
                    Tingkat Kematangan Waktu:
                  </span>
                  <span className={cn("font-mono font-bold", capsule.isLocked ? "text-slate-600" : "text-blue-100")}>
                    {capsule.progressPercent}%
                  </span>
                </div>
                <div className={cn("w-full h-2 rounded-full overflow-hidden", capsule.isLocked ? "bg-slate-100 border border-slate-200/40" : "bg-blue-950/40")}>
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", capsule.isLocked ? "bg-blue-500" : "bg-blue-400")}
                    style={{ width: `${capsule.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Footer Metadata */}
              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-dashed border-slate-100/10">
                <div className={capsule.isLocked ? "text-slate-400" : "text-blue-200"}>
                  <span>Dibuat: </span>
                  <span className="font-semibold">
                    {new Date(capsule.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className={capsule.isLocked ? "text-slate-400" : "text-blue-200"}>
                  <span>Terbuka: </span>
                  <span className="font-semibold">
                    {(() => {
                      const d = new Date(capsule.unlockAt);
                      return `${d.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}, ${d.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex gap-2 pt-2 no-flip">
                <button
                  onClick={handleResonate}
                  disabled={hasResonated}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95",
                    capsule.isLocked
                      ? hasResonated
                        ? "bg-rose-50 text-rose-500 border border-rose-100 cursor-not-allowed"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                      : hasResonated
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/20 cursor-not-allowed"
                      : "bg-blue-800 text-white hover:bg-blue-700"
                  )}
                >
                  <Heart className={cn("size-4", hasResonated ? "fill-current" : "")} />
                  <span>Resonate ({resonateCount})</span>
                </button>

                 <button
                  onClick={() => setIsShareOpen(true)}
                  className={cn(
                    "p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center",
                    capsule.isLocked
                      ? "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
                      : "bg-blue-800 text-blue-200 border-blue-700/30 hover:text-white"
                  )}
                >
                  <Share2 className="size-4" />
                </button>
              </div>
            </div>

            {/* BACK SIDE */}
            <div
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Isi Kapsul
                </span>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  🔄 Tap untuk Balik Depan
                </span>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {/* Message Content */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Manifestasi
                  </span>
                  <blockquote className="text-sm font-medium leading-relaxed italic bg-slate-900 border border-slate-850 p-5 rounded-3xl text-slate-100">
                    "{capsule.messageContent}"
                  </blockquote>
                </div>

                {/* If Achieved */}
                {capsule.ifAchieved && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider block">
                      Jika impian tercapai
                    </span>
                    <div className="text-xs font-medium leading-relaxed bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-2xl text-emerald-200">
                      {capsule.ifAchieved}
                    </div>
                  </div>
                )}

                {/* If Not Achieved */}
                {capsule.ifNotAchieved && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider block">
                      Jika impian belum tercapai
                    </span>
                    <div className="text-xs font-medium leading-relaxed bg-rose-950/20 border border-rose-900/30 p-4 rounded-2xl text-rose-200">
                      {capsule.ifNotAchieved}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Metadata (Back) */}
              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-dashed border-slate-800 text-slate-400">
                <div>
                  <span>Dibuat: </span>
                  <span className="font-semibold">
                    {new Date(capsule.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className="text-[10px] flex items-center gap-1 text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <Unlock className="size-3" />
                  <span>Terbuka</span>
                </div>
              </div>

              {/* Action Row (Back) */}
              <div className="flex gap-2 pt-2 no-flip">
                <button
                  onClick={handleResonate}
                  disabled={hasResonated}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95",
                    hasResonated
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/20 cursor-not-allowed"
                      : "bg-slate-800 text-white hover:bg-slate-700"
                  )}
                >
                  <Heart className={cn("size-4", hasResonated ? "fill-current" : "")} />
                  <span>Resonate ({resonateCount})</span>
                </button>

                <button
                  onClick={() => setIsShareOpen(true)}
                  className="p-3 rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                >
                  <Share2 className="size-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareOpen && (
          <ShareModal
            capsule={capsule}
            onClose={() => setIsShareOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
