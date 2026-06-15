"use client";

import React, { useState, useEffect } from "react";
import { Copy, QrCode, RefreshCw, Check, Sparkles, X } from "lucide-react";
import { getActiveAccessKey, syncAccessKeyAction } from "@/features/capsules/actions";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface SyncPanelProps {
  onSyncSuccess: () => void;
}

export default function SyncPanel({ onSyncSuccess }: SyncPanelProps) {
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const [pasteKey, setPasteKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchKey = async () => {
    setIsLoading(true);
    try {
      const key = await getActiveAccessKey();
      setAccessKey(key);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKey();
  }, []);

  const handleCopy = () => {
    if (!accessKey) return;
    navigator.clipboard.writeText(accessKey);
    setCopied(true);
    toast.success("✅ Access Key berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteKey.trim()) return;

    setIsSyncing(true);
    try {
      const res = await syncAccessKeyAction(pasteKey);
      if (res.success) {
        toast.success("🔄 Riwayat berhasil disinkronkan!");
        setAccessKey(res.data?.key || pasteKey.trim().toUpperCase());
        setPasteKey("");
        onSyncSuccess(); // Panggil callback untuk reload history feed
      } else {
        toast.error(res.error || "Gagal sinkronisasi. Cek format key.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>⚙️</span> Pengaturan Akses
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Kelola kunci akses untuk memulihkan atau menyinkronkan data antar perangkat.
        </p>
      </div>

      {/* Access Key Display */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Access Key Kamu:
        </label>
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-3xl">
          <span className="font-mono text-sm font-bold text-slate-900 tracking-wider">
            {isLoading ? "Memuat..." : accessKey || "BELUM ADA KEY (Tanam kapsul dulu)"}
          </span>
          {accessKey && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 bg-white text-slate-500 hover:text-slate-950 border border-slate-100 rounded-2xl transition-all active:scale-95"
                title="Salin Key"
              >
                {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="p-2 bg-white text-slate-500 hover:text-slate-950 border border-slate-100 rounded-2xl transition-all active:scale-95"
                title="Tampilkan QR Code"
              >
                <QrCode className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Sync Key Form */}
      <form onSubmit={handleSync} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Punya key lama? Sync di sini:
          </label>
          <input
            type="text"
            value={pasteKey}
            onChange={(e) => setPasteKey(e.target.value)}
            placeholder="Contoh: ABCD-123-EFG"
            className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400/80 px-4 py-3 rounded-2xl text-sm border border-slate-100 focus:outline-none focus:border-slate-200 focus:ring-2 focus:ring-blue-500/10 transition-all font-mono uppercase tracking-wider"
          />
        </div>

        <button
          type="submit"
          disabled={isSyncing || !pasteKey.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none rounded-2xl text-xs font-bold shadow-md shadow-slate-900/5 active:scale-95 transition-all"
        >
          <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>Sinkronkan Riwayat</span>
        </button>

        <p className="text-[10px] text-slate-400 leading-normal text-center">
          ⚠️ <span className="font-semibold text-slate-500">Peringatan:</span> Riwayat di perangkat ini akan digantikan dengan riwayat key baru.
        </p>
      </form>

      {/* QR Code Modal */}
      {showQrModal && accessKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setShowQrModal(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          {/* Content */}
          <div className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl max-w-xs w-full p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-250">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Access Key QR Code</h3>
            <p className="text-[11px] text-slate-400 mb-6">Scan QR untuk memindahkan key ke perangkat lain.</p>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-center mb-6">
              <QRCodeSVG value={accessKey} size={160} level="M" includeMargin={false} />
            </div>
            <div className="font-mono text-xs font-bold text-slate-800 tracking-wider bg-slate-50 py-2.5 rounded-xl border border-slate-100">
              {accessKey}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
