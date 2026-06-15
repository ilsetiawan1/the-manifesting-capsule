"use client";

import React from "react";
import { Compass, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: "explore" | "settings";
  setActiveTab: (tab: "explore" | "settings") => void;
  onAddClick: () => void;
}

export default function BottomNav({
  activeTab,
  setActiveTab,
  onAddClick,
}: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex justify-center pointer-events-none">
      <div className="relative w-full max-w-md bg-white border-t border-slate-100/50 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] px-8 py-2 flex items-center justify-between pointer-events-auto rounded-t-[2.5rem]">
        {/* Tab Explore */}
        <button
          onClick={() => setActiveTab("explore")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all active:scale-95",
            activeTab === "explore"
              ? "text-blue-600 font-semibold"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Compass className="size-6" />
          <span className="text-[10px] tracking-wide">Explore</span>
        </button>

        {/* Center Floating Action Button (FAB) dengan Concave space mock */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <button
            onClick={onAddClick}
            className="flex items-center justify-center size-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 border-4 border-white"
            aria-label="Tanam kapsul baru"
          >
            <Plus className="size-6 stroke-[3]" />
          </button>
        </div>

        {/* Spacer for FAB */}
        <div className="w-12 h-10 pointer-events-none" />

        {/* Tab Settings */}
        <button
          onClick={() => setActiveTab("settings")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all active:scale-95",
            activeTab === "settings"
              ? "text-blue-600 font-semibold"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Settings className="size-6" />
          <span className="text-[10px] tracking-wide">Settings</span>
        </button>
      </div>
    </div>
  );
}
