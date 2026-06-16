"use client";
import { useState, useEffect } from "react";

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstallable(false);
    setDeferredPrompt(null);
  };

  // Sembunyikan tombol jika sudah terinstall atau browser tidak support
  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstall}
      className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-sm font-medium transition-colors border border-blue-200"
    >
      📲 Tambahkan ke Layar Utama
    </button>
  );
}
