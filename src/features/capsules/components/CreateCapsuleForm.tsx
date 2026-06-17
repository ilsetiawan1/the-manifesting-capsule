"use client";

import React, { useState } from "react";
import { X, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createCapsuleAction } from "../actions";
import { CreateCapsuleSchema } from "../schemas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { PhotoUploader } from "./PhotoUploader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateCapsuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accessKey?: string) => void;
}

export default function CreateCapsuleForm({
  isOpen,
  onClose,
  onSuccess,
}: CreateCapsuleFormProps) {
  const [step, setStep] = useState(1);
  const [authorName, setAuthorName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [unlockAt, setUnlockAt] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [ifNotAchieved, setIfNotAchieved] = useState("");
  const [ifAchieved, setIfAchieved] = useState("");
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!isOpen) return null;

  // Mendapatkan tanggal besok dalam format YYYY-MM-DD untuk min date
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handleCloseAttempt = () => {
    const hasInput =
      authorName.trim() !== "" ||
      targetName.trim() !== "" ||
      messageContent.trim() !== "" ||
      unlockAt !== "" ||
      photoFile !== null ||
      ifNotAchieved.trim() !== "" ||
      ifAchieved.trim() !== "";

    if (hasInput) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const onConfirmClose = () => {
    setShowConfirm(false);
    // Reset form states
    setAuthorName("");
    setTargetName("");
    setMessageContent("");
    setUnlockAt("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setIfNotAchieved("");
    setIfAchieved("");
    setStep(1);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const inputData = {
      targetName,
      messageContent,
      unlockAt: unlockAt ? new Date(unlockAt) : new Date(NaN),
      authorName,
      ifNotAchieved: ifNotAchieved || null,
      ifAchieved: ifAchieved || null,
    };

    // Validasi client-side menggunakan Zod
    const validation = CreateCapsuleSchema.safeParse(inputData);
    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      toast.error("Periksa kembali input form Anda.");
      return;
    }

    try {
      // Build FormData for file upload support
      const formData = new FormData();
      formData.append("targetName", validation.data.targetName);
      formData.append("messageContent", validation.data.messageContent);
      formData.append("unlockAt", validation.data.unlockAt.toISOString());
      if (validation.data.authorName) formData.append("authorName", validation.data.authorName);
      if (photoFile) formData.append("photo", photoFile);
      if (validation.data.ifNotAchieved) formData.append("ifNotAchieved", validation.data.ifNotAchieved);
      if (validation.data.ifAchieved) formData.append("ifAchieved", validation.data.ifAchieved);

      const res = await createCapsuleAction(formData);

      if (res.success) {
        toast.success("🔒 Kapsulmu berhasil dikunci!");
        
        // Simpan key agar bisa memunculkan SaveKeyModal (untuk Task 5)
        if (res.data?.accessKey) {
          localStorage.setItem("latest_created_key", res.data.accessKey);
        }

        setAuthorName("");
        setTargetName("");
        setMessageContent("");
        setUnlockAt("");
        setPhotoFile(null);
        setIfNotAchieved("");
        setIfAchieved("");
        setStep(1);
        onSuccess(res.data?.accessKey);
        onClose();
      } else {
        toast.error(res.error || "Gagal membuat kapsul.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid =
    targetName.trim().length >= 1 &&
    messageContent.trim().length >= 10 &&
    unlockAt !== "";

  const formFieldsContent = (
    <div className="space-y-4">
      {step === 1 ? (
        <>
          {/* Author Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nama Kamu (opsional)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Anonim"
              className={cn(
                "w-full bg-slate-50 text-slate-900 placeholder:text-slate-400/80 px-4 py-3 rounded-2xl text-base lg:text-sm border focus:outline-none focus:ring-2 transition-all",
                errors.authorName
                  ? "border-rose-300 focus:ring-rose-500/20"
                  : "border-slate-100 focus:border-slate-200 focus:ring-blue-500/20"
              )}
            />
            {errors.authorName && (
              <p className="text-rose-500 text-[10px] font-semibold mt-1 animate-in fade-in duration-200">
                {errors.authorName}
              </p>
            )}
          </div>

          {/* Target Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nama Target
            </label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Untuk siapa manifestasi ini? (e.g. Diriku)"
              className={cn(
                "w-full bg-slate-50 text-slate-900 placeholder:text-slate-400/80 px-4 py-3 rounded-2xl text-base lg:text-sm border focus:outline-none focus:ring-2 transition-all",
                errors.targetName
                  ? "border-rose-300 focus:ring-rose-500/20"
                  : "border-slate-100 focus:border-slate-200 focus:ring-blue-500/20"
              )}
            />
            {errors.targetName && (
              <p className="text-rose-500 text-[10px] font-semibold mt-1 animate-in fade-in duration-200">
                {errors.targetName}
              </p>
            )}
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Isi Manifestasimu
            </label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={3}
              placeholder="Tulis mimpi, harapan, dan manifestasimu di sini..."
              className={cn(
                "w-full bg-slate-50 text-slate-900 placeholder:text-slate-400/80 px-4 py-3 rounded-2xl text-base lg:text-sm border focus:outline-none focus:ring-2 transition-all resize-none",
                errors.messageContent
                  ? "border-rose-300 focus:ring-rose-500/20"
                  : "border-slate-100 focus:border-slate-200 focus:ring-blue-500/20"
              )}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.messageContent ? (
                <p className="text-rose-500 text-[10px] font-semibold animate-in fade-in duration-200">
                  {errors.messageContent}
                </p>
              ) : messageContent.length > 0 && messageContent.length < 10 ? (
                <p className="text-rose-500 text-[10px] font-medium animate-in fade-in duration-200">
                  Minimal 10 karakter
                </p>
              ) : (
                <div />
              )}
              <span className={cn(
                "text-[10px] font-mono transition-colors",
                messageContent.length > 0 && messageContent.length < 10 ? "text-rose-500 font-bold" : "text-slate-400"
              )}>
                {messageContent.length}/1000
              </span>
            </div>
          </div>

          {/* Photo Uploader */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Upload Foto (opsional)
            </label>
            <PhotoUploader
              photoFile={photoFile}
              preview={photoPreview}
              onPhotoSelected={(file, previewUrl) => {
                setPhotoFile(file);
                setPhotoPreview(previewUrl);
              }}
            />
          </div>

          {/* Unlock Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Gembok Sampai
            </label>
            <div className="relative">
              <input
                type="date"
                value={unlockAt}
                min={getTomorrowDateString()}
                onChange={(e) => setUnlockAt(e.target.value)}
                className={cn(
                  "w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-2xl text-base lg:text-sm border focus:outline-none focus:ring-2 transition-all",
                  errors.unlockAt
                    ? "border-rose-300 focus:ring-rose-500/20"
                    : "border-slate-100 focus:border-slate-200 focus:ring-blue-500/20"
                )}
              />
            </div>
            {errors.unlockAt && (
              <p className="text-rose-500 text-[10px] font-semibold mt-1 animate-in fade-in duration-200">
                {errors.unlockAt}
              </p>
            )}
          </div>

          {/* Next Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold shadow-md shadow-blue-500/10 active:scale-95 transition-all",
                isStep1Valid
                  ? "bg-blue-900 text-white hover:bg-blue-800"
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
              )}
            >
              <span>Berikutnya</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* If Not Achieved */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Jika belum tercapai...
            </label>
            <textarea
              value={ifNotAchieved}
              onChange={(e) => setIfNotAchieved(e.target.value)}
              rows={3}
              placeholder="Apa yang akan kamu lakukan jika impian ini belum terwujud?"
              className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400/80 px-4 py-3 rounded-2xl text-base lg:text-sm border border-slate-100 focus:border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none transition-all"
            />
          </div>

          {/* If Achieved */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Jika sudah tercapai...
            </label>
            <textarea
              value={ifAchieved}
              onChange={(e) => setIfAchieved(e.target.value)}
              rows={3}
              placeholder="Apa yang ingin kamu rayakan jika impian ini berhasil?"
              className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400/80 px-4 py-3 rounded-2xl text-base lg:text-sm border border-slate-100 focus:border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none transition-all"
            />
          </div>

          {/* Button Row */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <ArrowLeft className="size-4" />
              <span>Kembali</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold shadow-md shadow-blue-500/10 active:scale-95 transition-all bg-blue-900 text-white hover:bg-blue-800",
                isLoading && "opacity-80 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <Lock className="size-4" />
                  <span>Drop Capsule</span>
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Confirm Close Overlay inside the relative wrapper */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl flex items-end pb-8 px-6 z-50"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full bg-white rounded-2xl p-6 space-y-3 shadow-2xl"
            >
              <p className="font-semibold text-slate-900 text-center">Tutup form ini?</p>
              <p className="text-sm text-slate-400 text-center">Semua yang sudah kamu tulis akan hilang.</p>
              <button
                type="button"
                onClick={onConfirmClose}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-medium transition-all"
              >
                Ya, Tutup
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-medium transition-all"
              >
                Lanjut Nulis
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Desktop Centered Modal
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleCloseAttempt(); }}>
        <DialogContent className="max-w-lg w-full rounded-3xl p-8 bg-white text-slate-900 border-none shadow-2xl relative overflow-hidden" showCloseButton={true}>
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                Drop Your Capsule {step === 2 && "- Langkah 2"}
              </DialogTitle>
            </div>
          </DialogHeader>
 
          <form onSubmit={handleSubmit}>
            {formFieldsContent}
          </form>
        </DialogContent>
      </Dialog>
    );
  }
 
  // Mobile Bottom Sheet
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCloseAttempt}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
 
      {/* Bottom Sheet Drawer */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.8 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 120) handleCloseAttempt();
        }}
        className="relative w-full max-w-md bg-white rounded-t-[2.5rem] border-t border-slate-100 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] p-6 pb-8 z-10 flex flex-col pointer-events-auto overflow-hidden"
      >
        {/* Drag Handle */}
        <div className="mx-auto w-12 h-1.5 bg-slate-200 rounded-full mb-6 cursor-pointer" onClick={handleCloseAttempt} />
 
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Drop Your Capsule {step === 2 && "- Langkah 2"}
            </h2>
          </div>
          <button
            onClick={handleCloseAttempt}
            className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
            aria-label="Tutup form"
          >
            <X className="size-4" />
          </button>
        </div>
 
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[75vh] pb-8 pr-1">
          {formFieldsContent}
        </form>
      </motion.div>
    </div>
  );
}

