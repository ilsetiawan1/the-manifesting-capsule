"use client";

import React, { useState, useEffect, useTransition } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import SyncPanel from "@/components/SyncPanel";
import CapsuleList from "@/features/capsules/components/CapsuleList";
import CreateCapsuleForm from "@/features/capsules/components/CreateCapsuleForm";
import CapsuleDetailModal from "@/features/capsules/components/CapsuleDetailModal";
import SaveKeyModal from "@/features/capsules/components/SaveKeyModal";
import { getPublicCapsulesAction, getMyCapsulesAction } from "@/features/capsules/actions";
import { ClientCapsule } from "@/types";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"explore" | "history" | "settings">("history");
  const [vibeFilter, setVibeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<ClientCapsule | null>(null);
  
  const [capsules, setCapsules] = useState<ClientCapsule[]>([]);
  const [publicPage, setPublicPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    resonateCount: 0,
  });

  // Fetch data capsules
  const loadCapsules = async (pageToLoad = 1, shouldAppend = false) => {
    setIsLoading(true);
    try {
      if (activeTab === "explore") {
        const publicRes = await getPublicCapsulesAction(pageToLoad);
        if (publicRes.success && publicRes.data) {
          const { capsules: newCapsules, hasMore: more } = publicRes.data;
          setCapsules((prev) => shouldAppend ? [...prev, ...newCapsules] : newCapsules);
          setHasMore(more);
          setPublicPage(pageToLoad);
        }
      } else if (activeTab === "history") {
        const myRes = await getMyCapsulesAction();
        if (myRes.success && myRes.data) {
          setCapsules(myRes.data);
          setHasMore(false);
        }
      }

      // Hitung stats agregat unik
      const publicResStats = await getPublicCapsulesAction(1, 100);
      const myResStats = await getMyCapsulesAction();
      
      const allPublic = publicResStats.success && publicResStats.data ? publicResStats.data.capsules : [];
      const allMy = myResStats.success && myResStats.data ? myResStats.data : [];
      
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
    loadCapsules(1, false);
  }, [activeTab, vibeFilter]);

  // Real-time search & vibe filter di client-side
  const filteredCapsules = capsules.filter((c) => {
    const matchesSearch = c.targetName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVibe = vibeFilter === "All" || c.vibe === vibeFilter;
    return matchesSearch && matchesVibe;
  });

  const handleLoadMore = () => {
    loadCapsules(publicPage + 1, true);
  };

  const handleResonateSuccess = (capsuleId: string, newCount: number) => {
    // Update local state untuk card yang aktif
    setCapsules((prev) =>
      prev.map((c) => (c.id === capsuleId ? { ...c, resonateCount: newCount } : c))
    );
    // Update stats
    setStats((prev) => ({ ...prev, resonateCount: prev.resonateCount + 1 }));
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab === "settings" ? "settings" : "explore"}
        setActiveTab={setActiveTab}
        activeSubTab={activeTab === "explore" ? "global" : "history"}
        setActiveSubTab={(subTab) => setActiveTab(subTab === "global" ? "explore" : "history")}
        onAddClick={() => setIsCreateOpen(true)}
        vibeFilter={vibeFilter}
        setVibeFilter={setVibeFilter}
        stats={stats}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-5xl mx-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:max-h-screen lg:overflow-y-auto pb-28 lg:pb-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-950/20">
        {/* Header dengan Ghost Search */}
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Tab Explore Sub-Bar (Mobile & Tablet only) */}
        {activeTab !== "settings" && (
          <div className="flex flex-col gap-3 px-2 py-3 sm:px-4 lg:hidden">
            {/* Sub-tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100/80 dark:bg-slate-800 rounded-2xl border border-slate-200/10 dark:border-slate-700/50">
              <button
                onClick={() => setActiveTab("explore")}
                className={cn(
                  "py-2.5 text-center text-xs font-bold rounded-xl transition-all",
                  activeTab === "explore"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                Global Feed
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "py-2.5 text-center text-xs font-bold rounded-xl transition-all",
                  activeTab === "history"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
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
                      ? "bg-blue-900 dark:bg-blue-800 text-white shadow-sm"
                      : "bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 mt-4">
          {activeTab !== "settings" ? (
            /* Explore Feed View (Bento Grid) */
            <div className="space-y-4">
              <div className="hidden lg:flex items-center justify-between mb-6">
                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                  {activeTab === "explore" ? "Manifest Feed" : "My Capsule History"}
                </h2>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                  Menampilkan {filteredCapsules.length} kapsul
                </span>
              </div>

              {isLoading && capsules.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 p-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-56 min-h-[200px] bg-slate-100/80 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-[2rem] p-5 flex flex-col justify-between animate-pulse",
                        i === 1 ? "col-span-2 sm:col-span-1" : "col-span-1"
                      )}
                    >
                      {/* Top Header */}
                      <div className="flex justify-between items-center">
                        <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="size-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      </div>
                      {/* Middle Content */}
                      <div className="space-y-3 my-3">
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-3.5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      </div>
                      {/* Bottom Footer */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
                        </div>
                        <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <CapsuleList
                    capsules={filteredCapsules}
                    onCardClick={(capsule) => setSelectedCapsule(capsule)}
                    onAddFirstClick={() => setIsCreateOpen(true)}
                    isHistoryTab={activeTab === "history"}
                  />
                  {activeTab === "explore" && hasMore && (
                    <button
                      onClick={handleLoadMore}
                      className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      Muat Lebih Banyak ✨
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Settings View (Sync Access Key) */
            <div className="py-6">
              <SyncPanel onSyncSuccess={() => {
                setActiveTab("history");
                loadCapsules(1, false);
              }} />
            </div>
          )}
        </main>
      </div>

      {/* Concave Bottom Navigation (Mobile & Tablet) */}
      <BottomNav
        activeTab={activeTab === "settings" ? "settings" : "explore"}
        setActiveTab={(tab) => {
          if (tab === "settings") {
            setActiveTab("settings");
          } else {
            setActiveTab("history");
          }
        }}
        onAddClick={() => setIsCreateOpen(true)}
      />

      {/* Modals & Sheets Container */}
      <AnimatePresence>
        {/* Create Capsule Bottom Sheet */}
        {isCreateOpen && (
          <CreateCapsuleForm
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={(key) => {
              if (key) setCreatedKey(key);
              loadCapsules(1, false);
            }}
          />
        )}

        {/* Save Key Modal */}
        {createdKey && (
          <SaveKeyModal
            accessKey={createdKey}
            isOpen={!!createdKey}
            onClose={() => setCreatedKey(null)}
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
