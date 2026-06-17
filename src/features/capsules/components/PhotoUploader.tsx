'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export function PhotoUploader({
  photoFile,
  preview,
  onPhotoSelected,
}: {
  photoFile: File | null;
  preview: string | null;
  onPhotoSelected: (file: File | null, previewUrl: string | null) => void;
}) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Auto compress
    const imageCompression = (await import('browser-image-compression')).default;
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,       // max 500KB
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    });

    const previewUrl = URL.createObjectURL(compressed);
    onPhotoSelected(compressed as File, previewUrl);
  }, [onPhotoSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative group">
          <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-xl animate-fade-in" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPhotoSelected(null, null);
            }}
            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm transition-all"
          >
            Hapus
          </button>
        </div>
      ) : (
        <div className="text-slate-400 text-sm py-4">
          <p>📷 Upload foto (opsional)</p>
          <p className="text-xs mt-1">Drag & drop, ambil dari kamera, atau pilih dari galeri</p>
        </div>
      )}
    </div>
  );
}
