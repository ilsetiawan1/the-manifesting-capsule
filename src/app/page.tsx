"use client";

import React, { useState, useEffect, useTransition } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import SyncPanel from "@/components/SyncPanel";
import CapsuleList from "@/features/capsules/components/CapsuleList";
import CreateCapsuleForm from "@/features/capsules/components/CreateCapsuleForm";
import CapsuleDetailModal from "@/features/capsules/components/CapsuleDetailModal";
import { getPublicCapsulesAction, getMyCapsulesAction } from "@/features/capsules/actions";
import { ClientCapsule } from "@/types";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"explore" | "settings">("explore");
  const [activeSubTab, setActiveSubTab] = useState<"global" | "history">("global");
  const [vibeFilter, setVibeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<ClientCapsule | null>(null);
  
  const [capsules, setCapsules] = useState<ClientCapsule[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    resonateCount: 0,
  });

  // Fetch data capsules
  const loadCapsules = async () => {
    setIsLoading(true);
    try {
      const publicRes = await getPublicCapsulesAction(vibeFilter);
      const myRes = await getMyCapsulesAction();

      let currentList: ClientCapsule[] = [];
      if (activeSubTab === "global") {
        if (publicRes.success && publicRes.data) {
          currentList = publicRes.data;
        }
      } else {
        if (myRes.success && myRes.data) {
          currentList = myRes.data;
        }
      }
      setCapsules(currentList);

      // Hitung stats agregat unik
      const allPublic = publicRes.success && publicRes.data ? publicRes.data : [];
      const allMy = myRes.success && myRes.data ? myRes.data : [];
      
      const uniqueMap = new Map<string, ClientCapsule>();
      allPublic.forEach((c) => uniqueMap.set(c.id, c));
      allMy.forEach((c) => uniqueMap.set(c.id, c));
      const allUnique = Array.from(uniqueMap.values());

      setStats({
        total: allUnique.length,
        unlocked: allUnique.filter((c) => !c.isLocked).length,
        resonateCount: allUnique.reduce((acc, c) => acc + c.resonateCount, 0),
      });
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCapsules();
  }, [activeSubTab, vibeFilter]);

  // Real-time search filter di client-side
  const filteredCapsules = capsules.filter((c) =>
    c.targetName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResonateSuccess = (capsuleId: string, newCount: number) => {
    // Update local state untuk card yang aktif
    setCapsules((prev) =>
      prev.map((c) => (c.id === capsuleId ? { ...c, resonateCount: newCount } : c))
    );
    // Update stats
    setStats((prev) => ({ ...prev, resonateCount: prev.resonateCount + 1 }));
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        onAddClick={() => setIsCreateOpen(true)}
        vibeFilter={vibeFilter}
        setVibeFilter={setVibeFilter}
        stats={stats}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-5xl lg:max-h-screen lg:overflow-y-auto pb-28 lg:pb-6">
        {/* Header dengan Ghost Search */}
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Tab Explore Sub-Bar (Mobile & Tablet only) */}
        {activeTab === "explore" && (
          <div className="flex flex-col gap-3 px-6 py-3 lg:hidden">
            {/* Sub-tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/10">
              <button
                onClick={() => setActiveSubTab("global")}
                className={cn(
                  "py-2.5 text-center text-xs font-bold rounded-xl transition-all",
                  activeSubTab === "global"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                Global Feed
              </button>
              <button
                onClick={() => setActiveSubTab("history")}
                className={cn(
                  "py-2.5 text-center text-xs font-bold rounded-xl transition-all",
                  activeSubTab === "history"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                My History
              </button>
            </div>

            {/* Vibe Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide -mx-2 px-2">
              {["All", "Career & Study", "Love & Self", "Random"].map((v) => (
                <button
                  key={v}
                  onClick={() => setVibeFilter(v)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95",
                    vibeFilter === v
                      ? "bg-blue-900 text-white shadow-sm"
                      : "bg-slate-200/50 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 px-6 py-4">
          {activeTab === "explore" ? (
            /* Explore Feed View (Bento Grid) */
            <div className="space-y-4">
              <div className="hidden lg:flex items-center justify-between mb-2">
                <h2 className="text-xl font-black tracking-tight text-slate-800">
                  {activeSubTab === "global" ? "Global Manifest Gallery" : "My Capsule History"}
                </h2>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                  Menampilkan {filteredCapsules.length} kapsul
                </span>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <div className="size-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <span className="text-xs font-medium">Memuat galeri kapsul...</span>
                </div>
              ) : (
                <CapsuleList
                  capsules={filteredCapsules}
                  onCardClick={(capsule) => setSelectedCapsule(capsule)}
                  onAddFirstClick={() => setIsCreateOpen(true)}
                  isHistoryTab={activeSubTab === "history"}
                />
              )}
            </div>
          ) : (
            /* Settings View (Sync Access Key) */
            <div className="py-6">
              <SyncPanel onSyncSuccess={() => {
                setActiveTab("explore");
                setActiveSubTab("history");
                loadCapsules();
              }} />
            </div>
          )}
        </main>
      </div>

      {/* Concave Bottom Navigation (Mobile & Tablet) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddClick={() => setIsCreateOpen(true)}
      />

      {/* Modals & Sheets Container */}
      <AnimatePresence>
        {/* Create Capsule Bottom Sheet */}
        {isCreateOpen && (
          <CreateCapsuleForm
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={loadCapsules}
          />
        )}

        {/* Capsule Detail Modal */}
        {selectedCapsule && (
          <CapsuleDetailModal
            initialCapsule={selectedCapsule}
            onClose={() => setSelectedCapsule(null)}
            onResonateSuccess={handleResonateSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
