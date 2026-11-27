// In-memory OTP stores. Kept on globalThis so codes survive dev hot-reloads
// (a plain module-level Map is recreated on every rebuild, which made valid
// codes fail with "Invalid or expired").
type OtpEntry = { code: string; expiresAt: number };
const g = globalThis as unknown as {
  __vyomiOtp?: Map<string, OtpEntry>;
  __vyomiEmailOtp?: Map<string, OtpEntry>;
};

export const memoryOtpStore = (g.__vyomiOtp ??= new Map<string, OtpEntry>());
export const memoryEmailOtpStore = (g.__vyomiEmailOtp ??= new Map<string, OtpEntry>());
