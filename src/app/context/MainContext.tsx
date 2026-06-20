"use client";

import React, { createContext, useContext } from "react";
import { ClientCapsule } from "@/types";

export interface MainContextType {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  createdKey: string | null;
  setCreatedKey: (key: string | null) => void;
  selectedCapsule: ClientCapsule | null;
  setSelectedCapsule: (capsule: ClientCapsule | null) => void;
  vibeFilter: string;
  setVibeFilter: (filter: string) => void;
  activeSubTab: "global" | "history";
  setActiveSubTab: (tab: "global" | "history") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stats: { total: number; unlocked: number; resonateCount: number };
  setStats: React.Dispatch<React.SetStateAction<{ total: number; unlocked: number; resonateCount: number }>>;
  refreshCounter: number;
  triggerRefresh: () => void;
}

export const MainContext = createContext<MainContextType | undefined>(undefined);

export function useMain() {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useMain must be used within a MainProvider");
  }
  return context;
}
