'use client';

import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SaveKeyModalProps {
  accessKey: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SaveKeyModal({ accessKey, isOpen, onClose }: SaveKeyModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !accessKey) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accessKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin key:", err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-100 flex flex-col text-slate-900 overflow-hidden"
        >
          {/* Decorative Top Gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

          {/* Icon Header */}
          <div className="mx-auto size-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-4 mt-2">
            🔑
          </div>

          <h3 className="text-lg font-black text-center text-slate-800 tracking-tight mb-2">
            Kapsul Berhasil Dikunci!
          </h3>
          <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
            Gunakan Access Key di bawah ini untuk melihat kembali harapan dan impianmu ketika gemboknya terbuka nanti.
          </p>

          {/* Access Key Display Box */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3 mb-6 relative overflow-hidden group">
            <span className="font-mono text-lg font-bold text-blue-900 tracking-widest selection:bg-blue-100 select-all">
              {accessKey}
            </span>
            <button
              onClick={handleCopy}
              className={cn(
                "p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center border",
                copied
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 shadow-sm"
              )}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </div>

          {/* Warning Card */}
          <div className="bg-rose-50 border border-rose-100/50 rounded-2xl p-4 flex gap-3 items-start mb-6">
            <AlertTriangle className="size-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Penting
              </h4>
              <p className="text-[11px] text-rose-600/90 leading-relaxed font-medium">
                Catat dan simpan key ini dengan aman. Kami tidak menyimpan salinan key Anda di server kami, sehingga <strong className="font-bold underline">key ini tidak dapat dipulihkan jika hilang!</strong>
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold active:scale-95 transition-all shadow-md shadow-slate-950/10"
          >
            Saya Sudah Menyimpannya
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
