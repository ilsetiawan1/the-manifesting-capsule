import { put } from '@vercel/blob';

export async function uploadCapsulePhoto(
  file: File,
  accessKey: string
): Promise<string> {
  const filename = `capsules/${accessKey}/${Date.now()}-${file.name}`;
  const blob = await put(filename, file, {
    access: 'public',
    contentType: file.type,
  });
  return blob.url;
}
