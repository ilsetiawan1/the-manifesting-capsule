"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Sparkles } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-50/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      {!isSearchOpen ? (
        <>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                Manifest Capsule
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                Silent Sanctuary
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-all active:scale-95"
            aria-label="Cari kapsul"
          >
            <Search className="size-5" />
          </button>
        </>
      ) : (
        <div className="w-full flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari target nama kapsul..."
              className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 pl-10 pr-10 py-2.5 rounded-full text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleCloseSearch}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-95"
          >
            Batal
          </button>
        </div>
      )}
    </header>
  );
}
