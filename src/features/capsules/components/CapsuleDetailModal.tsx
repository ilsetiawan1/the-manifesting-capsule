"use client";

import React, { useState, useEffect } from "react";
import { X, Lock, Unlock, Heart, Check, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { ClientCapsule } from "@/types";
import { getUnlockedCapsuleContentAction, resonateAction } from "../actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

      {/* Modal Dialog */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={cn(
          "relative w-full max-w-md bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden z-10 flex flex-col p-6 text-slate-900 select-none",
          capsule.isLocked ? "" : "bg-blue-900 text-white"
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-5 right-5 p-1.5 rounded-full transition-all active:scale-90",
            capsule.isLocked
              ? "bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              : "bg-blue-800 text-blue-200 hover:text-white hover:bg-blue-700"
          )}
        >
          <X className="size-4" />
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="size-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-xs font-semibold text-slate-400">Memuat isi kapsul...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header / Vibe Category */}
            <div className="flex items-center gap-2">
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
            </div>

            {/* Target & Lock Status */}
            <div>
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wider uppercase block mb-1",
                  capsule.isLocked ? "text-slate-400" : "text-blue-200"
                )}
              >
                KAPSUL MANIFESTASI
              </span>
              <h2 className="text-lg font-black tracking-tight leading-tight capitalize">
                Untuk: {capsule.targetName}
              </h2>
            </div>

            {/* Content Body */}
            {capsule.isLocked ? (
              /* Locked Content Details with Countdown */
              <div className="space-y-6">
                {/* Visual Lock Notification */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-3xl flex items-center gap-3">
                  <div className="p-2 bg-slate-200/60 text-slate-500 rounded-2xl">
                    <Lock className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Harapan Masih Terkunci</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                      Pesan ini aman tersegel sampai tanggal gembok yang telah ditentukan.
                    </p>
                  </div>
                </div>

                {/* Countdown display */}
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Waktu Tersisa:
                  </span>
                  <div className="grid grid-cols-4 gap-2 px-4">
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
              /* Unlocked Content Details */
              <div className="space-y-4">
                <blockquote className="text-sm font-medium leading-relaxed italic bg-blue-950/20 p-5 rounded-3xl border border-blue-800/10">
                  "{capsule.messageContent}"
                </blockquote>
                <div className="flex items-center gap-2 text-[10px] text-blue-200">
                  <Unlock className="size-3" />
                  <span>Kapsul ini telah terbuka sepenuhnya secara anonim.</span>
                </div>
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
                  {new Date(capsule.unlockAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>

            {/* Resonate & Share Action Row */}
            <div className="flex gap-2 pt-2">
              {/* Resonate */}
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

              {/* Copy/Share Link */}
              <button
                onClick={handleCopyLink}
                className={cn(
                  "p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center",
                  capsule.isLocked
                    ? "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
                    : "bg-blue-800 text-blue-200 border-blue-700/30 hover:text-white"
                )}
                title="Salin Tautan Kapsul"
              >
                {copiedLink ? <Check className="size-4 text-green-500" /> : <Share2 className="size-4" />}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
