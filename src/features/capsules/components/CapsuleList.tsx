"use client";

import React from "react";
import BentoCard from "./BentoCard";
import { ClientCapsule } from "@/types";
import { Sparkles, Compass } from "lucide-react";

interface CapsuleListProps {
  capsules: ClientCapsule[];
  onCardClick: (capsule: ClientCapsule) => void;
  onAddFirstClick: () => void;
  isHistoryTab: boolean;
}

export default function CapsuleList({
  capsules,
  onCardClick,
  onAddFirstClick,
  isHistoryTab,
}: CapsuleListProps) {
  if (capsules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 py-16 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm max-w-sm mx-auto my-12 animate-in fade-in zoom-in-95 duration-350">
        <div className="size-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <span className="text-3xl">🌱</span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-2">
          {isHistoryTab ? "Belum ada teks mimpi" : "Feed masih kosong"}
        </h3>
        <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed mb-8">
          {isHistoryTab
            ? "Tanam harapan, impian, atau manifestasi pertamamu ke dalam kapsul waktu digital."
            : "Jadilah yang pertama menuliskan manifestasi di galeri waktu global."}
        </p>
        {isHistoryTab ? (
          <button
            onClick={onAddFirstClick}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <span>✚</span> Buat Kapsul Pertama
          </button>
        ) : (
          <button
            onClick={onAddFirstClick}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Compass className="size-4" /> Mulai Menjelajah
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 p-1">
      {capsules.map((capsule, index) => {
        const positionInBatch = index % 4; // 0, 1, 2, 3
        const isFullWidthMobile = positionInBatch === 0 || positionInBatch === 3;
        
        return (
          <div
            key={capsule.id}
            className={isFullWidthMobile ? "col-span-2 sm:col-span-1" : "col-span-1"}
          >
            <BentoCard capsule={capsule} onCardClick={onCardClick} />
          </div>
        );
      })}
    </div>
  );
}
