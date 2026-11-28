'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Live member photo for front desk registration.
 * - Camera starts only when staff tap "Take photo" (nothing loads before that).
 * - Photo is resized in the browser to max 800px and saved as JPEG (~60-100 KB).
 * - Falls back to the device camera/file picker when live camera isn't available.
 */
const MAX_SIDE = 800;
const QUALITY = 0.86;

function toJpeg(source: CanvasImageSource, w: number, h: number, mirror: boolean): string {
  // Centre-crop to 4:5 portrait, then scale down
  const targetRatio = 4 / 5;
  let sw = w;
  let sh = h;
  if (w / h > targetRatio) sw = Math.round(h * targetRatio);
  else sh = Math.round(w / targetRatio);
  const sx = Math.round((w - sw) / 2);
  const sy = Math.round((h - sh) / 2);
  const scale = Math.min(1, MAX_SIDE / Math.max(sw, sh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', QUALITY);
}

export default function PhotoCapture({
  value,
  onChange,
  error,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  error?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'idle' | 'starting' | 'live'>('idle');
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [camError, setCamError] = useState('');

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMode('idle');
  }, []);

  useEffect(() => stop, [stop]);

  const start = async (face: 'user' | 'environment' = facing) => {
    setCamError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      fileRef.current?.click();
      return;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setMode('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: face, width: { ideal: 960 }, height: { ideal: 1200 } },
        audio: false,
      });
      streamRef.current = stream;
      setFacing(face);
      setMode('live');
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => null);
        }
      });
    } catch (e) {
      setMode('idle');
      const name = (e as DOMException)?.name;
      setCamError(
        name === 'NotAllowedError'
          ? 'Camera permission was blocked. Allow the camera in the browser, or use "Upload photo".'
          : 'Camera not available on this device. Use "Upload photo" instead.'
      );
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    // Saved photo is the true (un-mirrored) view, like an ID photo
    const data = toJpeg(v, v.videoWidth, v.videoHeight, false);
    if (data) onChange(data);
    stop();
  };

  const onFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const data = toJpeg(img, img.naturalWidth, img.naturalHeight, false);
      URL.revokeObjectURL(url);
      if (data) onChange(data);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setCamError('That file could not be read. Please try another photo.');
    };
    img.src = url;
  };

  return (
    <div>
      <div className="flex items-start gap-4">
        <div
          className={`relative w-[104px] h-[130px] shrink-0 rounded-xl overflow-hidden border bg-[#F4F6FB] ${
            error ? 'border-red-400' : 'border-[#E3E8F2]'
          }`}
        >
          {mode !== 'idle' ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${facing === 'user' ? '-scale-x-100' : ''}`}
            />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Member photo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8]">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a7 7 0 0114 0v1" /></svg>
              <span className="text-[11px] mt-1">No photo</span>
            </div>
          )}
          {mode === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs text-[#64748B]">Starting…</div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {mode === 'live' ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={capture}
                className="h-10 px-4 rounded-xl text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] transition"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={() => start(facing === 'user' ? 'environment' : 'user')}
                className="h-10 px-3 rounded-xl text-sm text-[#1E3A8A] border border-[#C7D4F5] bg-white hover:border-[#1E3A8A] transition"
              >
                Switch camera
              </button>
              <button type="button" onClick={stop} className="h-10 px-3 rounded-xl text-sm text-[#64748B] hover:text-[#0F172A] transition">
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => start()}
                disabled={mode === 'starting'}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] disabled:opacity-60 transition"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
                {value ? 'Retake' : 'Take photo'}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-10 px-3 rounded-xl text-sm text-[#1E3A8A] border border-[#C7D4F5] bg-white hover:border-[#1E3A8A] transition"
              >
                Upload photo
              </button>
              {value && (
                <button type="button" onClick={() => onChange(null)} className="h-10 px-2 text-sm text-[#64748B] hover:text-red-700 transition">
                  Remove
                </button>
              )}
            </div>
          )}
          <p className="text-xs text-[#94A3B8]">Face the camera, good light, no cap or sunglasses.</p>
          {(camError || error) && <p className="text-[11px] text-red-600 font-medium">{camError || error}</p>}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
