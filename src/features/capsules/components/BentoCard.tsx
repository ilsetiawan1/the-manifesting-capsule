"use client";

import React, { useState, useEffect } from "react";
import { Lock, Unlock, Sparkles, MoreVertical, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientCapsule } from "@/types";
import { resonateAction } from "../actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BentoCardProps {
  capsule: ClientCapsule;
  onCardClick: (capsule: ClientCapsule) => void;
}

export default function BentoCard({ capsule, onCardClick }: BentoCardProps) {
  const [resonateCount, setResonateCount] = useState(capsule.resonateCount);
  const [hasResonated, setHasResonated] = useState(false);
  const [isResonating, setIsResonating] = useState(false);

  useEffect(() => {
    // Cek di localStorage apakah user sudah pernah resonate kapsul ini
    const resonatedList = JSON.parse(localStorage.getItem("resonated_capsules") || "[]");
    if (resonatedList.includes(capsule.id)) {
      setHasResonated(true);
    }
  }, [capsule.id]);

  const handleResonate = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah terbukanya modal detail

    if (hasResonated) {
      toast.info("Kamu sudah menyalurkan resonansi ke kapsul ini.");
      return;
    }

    // Optimistic Update
    setResonateCount((prev) => prev + 1);
    setHasResonated(true);
    setIsResonating(true);

    try {
      const resonatedList = JSON.parse(localStorage.getItem("resonated_capsules") || "[]");
      resonatedList.push(capsule.id);
      localStorage.setItem("resonated_capsules", JSON.stringify(resonatedList));

      const res = await resonateAction(capsule.id);
      if (!res.success) {
        // Rollback jika gagal
        setResonateCount((prev) => prev - 1);
        setHasResonated(false);
        const index = resonatedList.indexOf(capsule.id);
        if (index > -1) resonatedList.splice(index, 1);
        localStorage.setItem("resonated_capsules", JSON.stringify(resonatedList));
        toast.error("Gagal mengirimkan resonansi.");
      } else {
        toast.success("✨ Resonansi tersalurkan!");
      }
    } catch (err) {
      setResonateCount((prev) => prev - 1);
      setHasResonated(false);
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsResonating(false);
    }
  };

  const dateObj = new Date(capsule.unlockAt);
  const formattedDate = `${dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}, ${dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;  return (
    <div
      onClick={() => onCardClick(capsule)}
      className={cn(
        "relative flex flex-col justify-between h-56 min-h-[200px] p-5 rounded-[2rem] cursor-pointer transition-all duration-300 select-none overflow-hidden group",
        capsule.isLocked
          ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200/60 dark:border-slate-700/50 shadow-sm"
          : "bg-blue-900 text-white shadow-lg shadow-blue-950/10 hover:shadow-xl hover:shadow-blue-950/20"
      )}
    >
      {/* Top Section: Date & Lock Icon */}
      <div className="flex items-center justify-between w-full z-10">
        <span
          className={cn(
            "text-[10px] font-semibold tracking-wider uppercase",
            capsule.isLocked ? "text-slate-400 dark:text-slate-500" : "text-blue-200"
          )}
        >
          {formattedDate}
        </span>
        {capsule.isLocked && (
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
              <Lock className="size-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Middle Section: Target, Author, & Blurred/Normal Message */}
      <div className="flex-1 flex flex-col justify-center my-3 z-10">
        <div className={cn(
          "flex items-center justify-between w-full border-b pb-2 mb-3",
          capsule.isLocked 
            ? "border-amber-500/10" 
            : "border-blue-950/20"
        )}>
          <span className={cn(
            "text-[11px] font-medium",
            capsule.isLocked 
              ? "text-slate-600 dark:text-slate-300" 
              : "text-blue-200"
          )}>
            {capsule.authorName || "Anonim"}
          </span>
          <div className="flex-1 mx-2.5 flex items-center">
            <div className={cn(
              "flex-1 border-b border-dashed",
              capsule.isLocked ? "border-[#D4AF37]/20" : "border-blue-300/30"
            )} />
            <span className={cn(
              "px-1.5 text-[10px]",
              capsule.isLocked ? "text-[#D4AF37]/40" : "text-blue-300/60"
            )}>
              ✦
            </span>
            <div className={cn(
              "flex-1 border-b border-dashed",
              capsule.isLocked ? "border-[#D4AF37]/20" : "border-blue-300/30"
            )} />
          </div>
          <span className={cn(
            "text-[11px] font-semibold capitalize",
            capsule.isLocked ? "text-[#D4AF37]" : "text-blue-355"
          )}>
            {capsule.targetName}
          </span>
        </div>
        
        {capsule.isLocked ? (
          <p className="text-[12px] text-slate-400/50 dark:text-slate-500/50 line-clamp-2 select-none filter blur-[5px] pointer-events-none font-mono">
            Lorem ipsum dolor sit amet-consectetur adipisicing elit-architecto laboriosam optio.
          </p>
        ) : (
          <p className="text-[12px] text-blue-100 font-medium line-clamp-2 leading-relaxed italic">
            "{capsule.messageContent || "Harapan telah terbuka..."}"
          </p>
        )}
      </div>

      {/* Bottom Section: Progress & Resonate */}
      <div className="flex flex-row items-center justify-between gap-2 w-full mt-2 z-10">
        {/* Progress Bar & Status */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1 text-[9px] sm:text-[10px] tracking-tight">
            <span className={cn("font-mono font-medium truncate", capsule.isLocked ? "text-slate-550 dark:text-slate-400" : "text-blue-200")}>
              {capsule.isLocked ? `⏳ ${capsule.daysLeft} hari lagi` : "✅ Awakened"}
            </span>
            <span className={cn("font-mono font-semibold shrink-0 ml-1", capsule.isLocked ? "text-slate-600 dark:text-slate-355" : "text-blue-100")}>
              {capsule.progressPercent}%
            </span>
          </div>
          {/* Progress Track */}
          <div
            className={cn(
              "w-full h-1.5 rounded-full overflow-hidden",
              capsule.isLocked ? "bg-slate-200 dark:bg-slate-700" : "bg-blue-950/40"
            )}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capsule.progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                capsule.isLocked ? "bg-blue-500" : "bg-blue-400"
              )}
            />
          </div>
        </div>

        {/* Resonate Counter Button */}
        <motion.button
          onClick={handleResonate}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-[10px] sm:text-xs font-semibold transition-all shadow-sm active:scale-95 shrink-0",
            capsule.isLocked
              ? hasResonated
                ? "bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-450 border-rose-200 dark:border-rose-900/50"
                : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
              : hasResonated
              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
              : "bg-blue-800/40 text-blue-100 border-blue-700/30 hover:bg-blue-800/60"
          )}
        >
          <motion.div
            animate={isResonating ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={cn(
                "size-3.5",
                hasResonated ? "fill-rose-500 stroke-rose-500" : ""
              )}
            />
          </motion.div>
          <span className="font-mono">{resonateCount}</span>
        </motion.button>
      </div>

      {/* Decorative Aura Background for Hover States */}
      <div
        className={cn(
          "absolute -right-4 -bottom-4 size-32 rounded-full filter blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none",
          capsule.isLocked ? "bg-blue-400" : "bg-blue-300"
        )}
      />
    </div>
  );
}
