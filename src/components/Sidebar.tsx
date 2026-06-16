"use client";

import React from "react";
import Image from "next/image";
import { Compass, Settings, Plus, Heart, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: "explore" | "settings";
  setActiveTab: (tab: "explore" | "settings") => void;
  activeSubTab: "global" | "history";
  setActiveSubTab: (subTab: "global" | "history") => void;
  onAddClick: () => void;
  vibeFilter: string;
  setVibeFilter: (filter: string) => void;
  stats: { total: number; unlocked: number; resonateCount: number };
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeSubTab,
  setActiveSubTab,
  onAddClick,
  vibeFilter,
  setVibeFilter,
  stats,
}: SidebarProps) {
  const vibes = ["All", "Career & Study", "Love & Self", "Random"];

  const handleTabClick = (tab: "explore" | "settings") => {
    setActiveTab(tab);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-100 p-6 justify-between select-none">
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo/logo.png"
            alt="The Manifesting Capsule"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
              The Manifesting Capsule
            </h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">
              Silent Sanctuary
            </span>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={onAddClick}
          className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-500/10 active:scale-95 transition-all"
        >
          <Plus className="size-4 stroke-[3]" />
          <span>Drop Capsule</span>
        </button>

        {/* Navigation Tabs */}
        <div className="space-y-1.5">
          <button
            onClick={() => handleTabClick("explore")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-98",
              activeTab === "explore"
                ? "bg-slate-50 text-blue-600"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-800"
            )}
          >
            <Compass className="size-5" />
            <span>Explore Feed</span>
          </button>
          <button
            onClick={() => handleTabClick("settings")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-98",
              activeTab === "settings"
                ? "bg-slate-50 text-blue-600"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-800"
            )}
          >
            <Settings className="size-5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Sidebar sub-controls (only visible on explore tab) */}
        {activeTab === "explore" && (
          <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Vibe Filters */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Filter Vibes
              </span>
              <div className="flex flex-col gap-1.5">
                {vibes.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVibeFilter(v)}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                      vibeFilter === v
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-800"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-tabs Global vs History */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Feed Section
              </span>
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveSubTab("global")}
                  className={cn(
                    "py-1.5 text-center text-xs font-semibold rounded-lg transition-all",
                    activeSubTab === "global"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Global
                </button>
                <button
                  onClick={() => setActiveSubTab("history")}
                  className={cn(
                    "py-1.5 text-center text-xs font-semibold rounded-lg transition-all",
                    activeSubTab === "history"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Stats Counter (Desktop only) */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl space-y-3 shadow-inner">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Live Stats
        </span>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <span className="block text-sm font-black text-slate-800">{stats.total}</span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase">Total</span>
          </div>
          <div className="space-y-1">
            <span className="block text-sm font-black text-slate-800">{stats.unlocked}</span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase">Open</span>
          </div>
          <div className="space-y-1">
            <span className="block text-sm font-black text-slate-800">{stats.resonateCount}</span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase">Vibes</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
