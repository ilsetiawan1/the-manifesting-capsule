// src/lib/nanoid.ts
import { customAlphabet } from 'nanoid';

// Alfabet hanya huruf kapital + angka, mudah dibaca manusia
const nanoidAlpha = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ', 4); // hindari I dan O (mirip 1 dan 0)
const nanoidNum   = customAlphabet('0123456789', 3);
const nanoidTail  = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ', 3);

export function generateAccessKey(): string {
  return `${nanoidAlpha()}-${nanoidNum()}-${nanoidTail()}`;
}
