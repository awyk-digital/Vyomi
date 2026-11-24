import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Super Admin access required' } }, { status: 403 });
  }

  const logs = db.getAuditLogs();
  return NextResponse.json({ logs });
}
