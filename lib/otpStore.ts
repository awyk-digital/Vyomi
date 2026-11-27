// Shared in-memory OTP cache for fallback
export const memoryOtpStore = new Map<string, { code: string; expiresAt: number }>();
export const memoryEmailOtpStore = new Map<string, { code: string; expiresAt: number }>();
