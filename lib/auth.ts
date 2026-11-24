import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db, AdminRole } from './db';

const AUTH_COOKIE = 'vyomi_admin_token';
const JWT_SECRET = process.env.JWT_SECRET || 'vyomi_luxury_jwt_secret_2026_super_secure';

interface TokenPayload {
  id: string;
  email: string;
  role: AdminRole;
  name: string;
  exp: number;
}

export function createSessionToken(payload: Omit<TokenPayload, 'exp'>): string {
  const exp = Date.now() + 8 * 60 * 60 * 1000; // 8 hours expiry
  const data = JSON.stringify({ ...payload, exp });
  const b64Data = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(b64Data).digest('base64url');
  return `${b64Data}.${signature}`;
}

export function verifySessionToken(token: string): TokenPayload | null {
  try {
    const [b64Data, signature] = token.split('.');
    if (!b64Data || !signature) return null;

    const expected = crypto.createHmac('sha256', JWT_SECRET).update(b64Data).digest('base64url');
    if (signature !== expected) return null;

    const raw = Buffer.from(b64Data, 'base64url').toString('utf-8');
    const parsed: TokenPayload = JSON.parse(raw);

    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  // Verify admin is still active in DB
  const admin = db.findAdminById(session.id);
  if (!admin || !admin.isActive) return null;

  return session;
}

export { AUTH_COOKIE };
