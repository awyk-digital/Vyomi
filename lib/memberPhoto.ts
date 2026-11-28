import { supabaseAdmin } from './supabase';

export const PHOTO_BUCKET = 'member-photos';
const MAX_BYTES = 1.5 * 1024 * 1024;

/** Decode + validate a browser data URL. Checks the real file bytes, not just the label. */
export function parsePhotoDataUrl(dataUrl: unknown): { buf: Buffer; type: string; ext: string } | { error: string } | null {
  if (dataUrl === undefined || dataUrl === null || dataUrl === '') return null;
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl));
  if (!m) return { error: 'Photo must be a JPEG, PNG or WebP image.' };
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length < 1000) return { error: 'Photo looks empty. Please retake it.' };
  if (buf.length > MAX_BYTES) return { error: 'Photo is too large. Please retake it.' };
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
  if (isJpeg) return { buf, type: 'image/jpeg', ext: 'jpg' };
  if (isPng) return { buf, type: 'image/png', ext: 'png' };
  if (isWebp) return { buf, type: 'image/webp', ext: 'webp' };
  return { error: 'Photo file is not a valid image.' };
}

/** Upload to the private bucket. Returns the storage path, or null on failure. */
export async function uploadMemberPhoto(
  clientId: string,
  reference: string,
  photo: { buf: Buffer; type: string; ext: string }
): Promise<string | null> {
  const path = `${clientId}/${reference}.${photo.ext}`;
  const { error } = await supabaseAdmin.storage.from(PHOTO_BUCKET).upload(path, photo.buf, {
    contentType: photo.type,
    upsert: true,
    cacheControl: '31536000',
  });
  if (error) {
    console.warn('[PHOTO] upload failed:', error.message);
    return null;
  }
  return path;
}

/** Short-lived signed links for staff (private bucket). Missing paths map to null. */
export async function signedPhotoUrls(paths: Array<string | null | undefined>, seconds = 3600): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => !!p))];
  if (unique.length === 0) return {};
  const { data, error } = await supabaseAdmin.storage.from(PHOTO_BUCKET).createSignedUrls(unique, seconds);
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const row of data) {
    if (row.path && row.signedUrl) out[row.path] = row.signedUrl;
  }
  return out;
}
