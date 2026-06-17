"use client";

import React, { useState, useEffect } from "react";
import { 
  Copy, 
  QrCode, 
  Check, 
  ChevronRight, 
  Trash2, 
  Globe, 
  Moon, 
  Bug, 
  Info, 
  LogOut, 
  Plus, 
  User,
  Key,
  X
} from "lucide-react";
import { 
  getActiveAccessKey, 
  syncAccessKeyAction, 
  getMyCapsulesAction,
  logoutAction
} from "@/features/capsules/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

interface CapsuleAccount {
  key: string;
  name: string;
}

interface SyncPanelProps {
  onSyncSuccess: () => void;
}

export default function SyncPanel({ onSyncSuccess }: SyncPanelProps) {
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const [activeName, setActiveName] = useState<string>("Memuat...");
  const [storedAccounts, setStoredAccounts] = useState<CapsuleAccount[]>([]);
  const [pasteKey, setPasteKey] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Preferences State
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ID");

  // Load preferences
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);

    const lang = localStorage.getItem("language") || "ID";
    setLanguage(lang);

    const accountsData = localStorage.getItem("manifesting_accounts");
    if (accountsData) {
      setStoredAccounts(JSON.parse(accountsData));
    }
  }, []);

  // Fetch active key and name
  const fetchKey = async () => {
    setIsLoading(true);
    try {
      const key = await getActiveAccessKey();
      setAccessKey(key);
      if (key) {
        await fetchCapsulesAndResolveName(key);
      } else {
        setActiveName("Belum Ada Key");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKey();
  }, []);

  const fetchCapsulesAndResolveName = async (activeKey: string) => {
    try {
      const res = await getMyCapsulesAction();
      let name = "Anonim";
      if (res.success && res.data && res.data.length > 0) {
        const firstCapsule = res.data[0];
        name = firstCapsule.authorName?.trim() || firstCapsule.targetName || "Anonim";
      }

      setActiveName(name);

      // Save/update in local storage accounts list
      const accountsData = localStorage.getItem("manifesting_accounts");
      let accountsList: CapsuleAccount[] = accountsData ? JSON.parse(accountsData) : [];
      
      const idx = accountsList.findIndex((acc) => acc.key === activeKey);
      if (idx > -1) {
        accountsList[idx].name = name;
      } else {
        accountsList.push({ key: activeKey, name });
      }
      
      localStorage.setItem("manifesting_accounts", JSON.stringify(accountsList));
      setStoredAccounts(accountsList);
    } catch (err) {
      console.error(err);
      setActiveName("Anonim");
    }
  };

  const handleCopy = () => {
    if (!accessKey) return;
    navigator.clipboard.writeText(accessKey);
    setCopied(true);
    toast.success(language === "ID" ? "✅ Access Key berhasil disalin!" : "✅ Access Key copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteKey.trim()) return;

    setIsSyncing(true);
    try {
      const cleanKey = pasteKey.trim().toUpperCase();
      const res = await syncAccessKeyAction(cleanKey);
      if (res.success) {
        toast.success(language === "ID" ? "🔄 Akun baru terhubung!" : "🔄 New account synced!");
        setPasteKey("");
        setShowAddInput(false);
        await fetchKey();
        onSyncSuccess();
      } else {
        toast.error(res.error || "Gagal menghubungkan. Cek format key.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSwitchAccount = async (targetKey: string) => {
    if (targetKey === accessKey) return;
    setIsSyncing(true);
    try {
      const res = await syncAccessKeyAction(targetKey);
      if (res.success) {
        toast.success(language === "ID" ? "🔄 Berhasil beralih akun!" : "🔄 Account switched!");
        await fetchKey();
        onSyncSuccess();
      } else {
        toast.error("Gagal beralih akun.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveAccount = (keyToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storedAccounts.filter((acc) => acc.key !== keyToRemove);
    localStorage.setItem("manifesting_accounts", JSON.stringify(updated));
    setStoredAccounts(updated);
    toast.success(language === "ID" ? "Akun dihapus dari riwayat lokal." : "Account removed from local history.");
  };

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem("darkMode", nextDark ? "true" : "false");
    
    if (nextDark) {
      document.documentElement.classList.add("dark");
      toast.success(language === "ID" ? "Mode gelap diaktifkan" : "Dark mode enabled");
    } else {
      document.documentElement.classList.remove("dark");
      toast.success(language === "ID" ? "Mode terang diaktifkan" : "Light mode enabled");
    }
  };

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem("language", val);
    toast.success(val === "ID" ? "Bahasa diubah ke Indonesia" : "Language changed to English");
  };

  const handleReportBug = () => {
    window.location.href = "mailto:bug@manifestingcapsule.com?subject=Bug Report - The Manifesting Capsule";
    toast.info(language === "ID" ? "Membuka aplikasi email..." : "Opening mail client...");
  };

  const handleLogout = async () => {
    const msg = language === "ID" 
      ? "Apakah Anda yakin ingin keluar dari akun aktif? Riwayat lokal akun ini tetap tersimpan." 
      : "Are you sure you want to log out of the active account? Local account history will remain.";
    
    if (window.confirm(msg)) {
      try {
        const res = await logoutAction();
        if (res.success) {
          toast.success(language === "ID" ? "Berhasil keluar!" : "Logged out successfully!");
          // Reload page to reset state & cookie
          window.location.reload();
        } else {
          toast.error("Gagal keluar.");
        }
      } catch (err) {
        toast.error("Terjadi kesalahan.");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-3 sm:py-6 space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 1. AKUN KAPSUL AKTIF (Multi-Account) */}
      <div>
        <h3 className="text-[11px] font-medium tracking-wider text-slate-400 uppercase mb-2 block px-1">
          {language === "ID" ? "Pengaturan Akun" : "Account Settings"}
        </h3>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Active Profile Info */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <User className="size-5.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 leading-snug">
                  {isLoading ? "Memuat..." : activeName}
                  <span className="inline-block size-2 bg-emerald-500 rounded-full shrink-0" title="Aktif" />
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate max-w-[150px] sm:max-w-[280px]">
                  {accessKey || (language === "ID" ? "Belum ada kunci" : "No active key")}
                </p>
              </div>
            </div>
            
            {accessKey && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopy}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-all active:scale-95"
                  title="Salin Key"
                >
                  {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-all active:scale-95"
                  title="Tampilkan QR"
                >
                  <QrCode className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* List of other stored accounts */}
          {storedAccounts.length > 1 && (
            <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {language === "ID" ? "Beralih Akun Cepat" : "Quick Switch Accounts"}
              </p>
              <div className="space-y-1.5 mt-2">
                {storedAccounts.map((acc) => {
                  const isActive = acc.key === accessKey;
                  return (
                    <div 
                      key={acc.key}
                      onClick={() => handleSwitchAccount(acc.key)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-[11px] cursor-pointer transition-all",
                        isActive 
                          ? "bg-blue-50/30 border-blue-200/40 dark:bg-blue-950/10 dark:border-blue-900/40 text-blue-900 dark:text-blue-100" 
                          : "bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Key className={cn("size-3.5 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                        <div className="min-w-0">
                          <p className="font-bold truncate">{acc.name}</p>
                          <p className="font-mono text-[9px] text-slate-400 truncate tracking-wider">{acc.key}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isActive ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[8px] font-bold dark:bg-emerald-950/30 dark:text-emerald-400">
                            Aktif
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleRemoveAccount(acc.key, e)}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                            title="Hapus akun dari riwayat"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form / Button to add key */}
          {showAddInput ? (
            <form onSubmit={handleAddAccount} className="flex gap-2 p-3 border-t border-slate-100/60 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-950/10">
              <input
                type="text"
                value={pasteKey}
                onChange={(e) => setPasteKey(e.target.value)}
                placeholder={language === "ID" ? "MASUKKAN ACCESS KEY LAMA" : "ENTER OLD ACCESS KEY"}
                className="flex-1 bg-white dark:bg-slate-900 text-xs font-mono uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-150 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                required
              />
              <button 
                type="submit" 
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-900 text-white hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isSyncing ? "..." : (language === "ID" ? "Hubungkan" : "Connect")}
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddInput(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="size-4" />
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setShowAddInput(true)} 
              className="w-full text-center py-3 text-xs text-blue-600 dark:text-blue-400 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 font-semibold transition-all border-t border-slate-100/60 dark:border-slate-800/60"
            >
              + {language === "ID" ? "Hubungkan Akun / Access Key Lain" : "Connect Another Account / Access Key"}
            </button>
          )}
        </div>
      </div>

      {/* 2. PERSONALISASI */}
      <div>
        <h3 className="text-[11px] font-medium tracking-wider text-slate-400 uppercase mb-2 block px-1">
          {language === "ID" ? "Personalisasi" : "Personalization"}
        </h3>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          
          {/* Dark Mode Item */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-350">
              <Moon className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {language === "ID" ? "Mode Gelap" : "Dark Mode"}
              </span>
            </div>
            
            {/* Custom Toggle Switch */}
            <button
              onClick={toggleDarkMode}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                darkMode ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  darkMode ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Language Selection */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-350">
              <Globe className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {language === "ID" ? "Bahasa" : "Language"}
              </span>
            </div>
            
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-sm font-normal text-slate-500 dark:text-slate-400 focus:outline-none cursor-pointer pr-1 py-1"
            >
              <option value="ID" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">Bahasa Indonesia</option>
              <option value="EN" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. TENTANG APLIKASI */}
      <div>
        <h3 className="text-[11px] font-medium tracking-wider text-slate-400 uppercase mb-2 block px-1">
          {language === "ID" ? "Tentang Aplikasi" : "About Application"}
        </h3>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          
          {/* Report Bug */}
          <div 
            onClick={handleReportBug}
            className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/20 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-350">
              <Bug className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {language === "ID" ? "Laporkan Bug" : "Report a Bug"}
              </span>
            </div>
            <ChevronRight className="size-4 text-slate-300 dark:text-slate-600" />
          </div>

          {/* App Version */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-350">
              <Info className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {language === "ID" ? "Versi Aplikasi" : "App Version"}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
              v1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* 4. KELUAR AKUN BUTTON */}
      {accessKey && (
        <div className="pt-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-rose-50/30 dark:bg-slate-900 dark:hover:bg-rose-950/10 border border-slate-100 dark:border-slate-800 hover:border-rose-100 dark:hover:border-rose-950/50 text-rose-600 rounded-2xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <LogOut className="size-4" />
            <span>
              {language === "ID" ? "Keluar Akun Aktif" : "Log Out Active Account"}
            </span>
          </button>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && accessKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowQrModal(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl max-w-xs w-full p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-250">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full transition-all"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Access Key QR Code</h3>
            <p className="text-[11px] text-slate-400 mb-6">Scan QR untuk memindahkan key ke perangkat lain.</p>
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 flex items-center justify-center mb-6">
              <QRCodeSVG value={accessKey} size={160} level="M" includeMargin={false} />
            </div>
            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider bg-slate-50 dark:bg-slate-950 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
              {accessKey}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
