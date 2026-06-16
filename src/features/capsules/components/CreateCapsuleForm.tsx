"use client";

import React, { useState } from "react";
import { X, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { createCapsuleAction } from "../actions";
import { CreateCapsuleSchema } from "../schemas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateCapsuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCapsuleForm({
  isOpen,
  onClose,
  onSuccess,
}: CreateCapsuleFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [unlockAt, setUnlockAt] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!isOpen) return null;

  // Mendapatkan tanggal besok dalam format YYYY-MM-DD untuk min date
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
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
      const res = await createCapsuleAction({
        targetName: validation.data.targetName,
        messageContent: validation.data.messageContent,
        unlockAt: validation.data.unlockAt,
        authorName: validation.data.authorName,
      });

      if (res.success) {
        toast.success("🔒 Kapsulmu berhasil dikunci!");
        setAuthorName("");
        setTargetName("");
        setMessageContent("");
        setUnlockAt("");
        onSuccess();
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

  const isFormValid =
    targetName.trim().length >= 1 &&
    messageContent.trim().length >= 10 &&
    unlockAt !== "";

  const formFieldsContent = (
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
            "w-full bg-slate-50 text-slate-900 placeholder:text-slate-400/80 px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 transition-all",
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
            "w-full bg-slate-50 text-slate-900 placeholder:text-slate-400/80 px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 transition-all",
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
          rows={4}
          placeholder="Tulis mimpi, harapan, dan manifestasimu di sini..."
          className={cn(
            "w-full bg-slate-50 text-slate-900 placeholder:text-slate-400/80 px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 transition-all resize-none",
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
          ) : (
            <div />
          )}
          <span className="text-[10px] text-slate-400 font-mono">
            {messageContent.length}/1000
          </span>
        </div>
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
              "w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 transition-all",
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

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold shadow-md shadow-blue-500/10 active:scale-95 transition-all",
            isFormValid && !isLoading
              ? "bg-blue-900 text-white hover:bg-blue-800"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
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
  );

  // Desktop Centered Modal
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-lg w-full rounded-3xl p-8 bg-white text-slate-900 border-none shadow-2xl relative" showCloseButton={true}>
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                Drop Your Capsule
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Bottom Sheet Drawer */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative w-full max-w-md bg-white rounded-t-[2.5rem] border-t border-slate-100 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] p-6 pb-8 z-10 flex flex-col pointer-events-auto"
      >
        {/* Drag Handle */}
        <div className="mx-auto w-12 h-1.5 bg-slate-200 rounded-full mb-6 cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Drop Your Capsule
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
            aria-label="Tutup form"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto max-h-[75vh]">
          {formFieldsContent}
        </form>
      </motion.div>
    </div>
  );
}
