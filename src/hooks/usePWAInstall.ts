"use client";

import { useState, useEffect } from "react";

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined") {
      // Check if currently running in PWA standalone mode
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      
      // Check if previously flagged as installed
      const wasInstalled = localStorage.getItem("the_manifest_capsule_installed") === "true";
      setIsAlreadyInstalled(wasInstalled);

      if (isStandalone) {
        localStorage.setItem("the_manifest_capsule_installed", "true");
        setIsAlreadyInstalled(true);
        setShowInstallButton(false);
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install UI
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      localStorage.setItem("the_manifest_capsule_installed", "true");
      setIsAlreadyInstalled(true);
      setDeferredPrompt(null);
      setShowInstallButton(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("the_manifest_capsule_installed", "true");
      setIsAlreadyInstalled(true);
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const isStandalone = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;
  const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
  
  // Jika sedang di dalam mode standalone, matikan paksa tombol meskipun di localhost
  const finalShowButton = !isMounted ? false : (isStandalone ? false : (showInstallButton || isLocalhost));
  const finalIsAlreadyInstalled = !isMounted ? false : isAlreadyInstalled;
  const finalIsStandalone = !isMounted ? false : isStandalone;

  return { 
    showInstallButton: finalShowButton, 
    isAlreadyInstalled: finalIsAlreadyInstalled, 
    isStandalone: finalIsStandalone, 
    handleInstallClick 
  };
}
