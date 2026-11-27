import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const packages = db.getPackages(false);
  return NextResponse.json({ packages });
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MANAGER')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, pricePaise, durationDays, benefits, isActive, name } = body;

    if (!id) {
      return NextResponse.json({ error: { code: 'PACKAGE_ID_REQUIRED' } }, { status: 400 });
    }

    const updated = db.updatePackage(id, {
      ...(pricePaise !== undefined && { pricePaise }),
      ...(durationDays !== undefined && { durationDays }),
      ...(benefits !== undefined && { benefits }),
      ...(isActive !== undefined && { isActive }),
      ...(name !== undefined && { name }),
    });

    if (!updated) {
      return NextResponse.json({ error: { code: 'PACKAGE_NOT_FOUND' } }, { status: 404 });
    }

    db.logAudit({
      adminId: session.id,
      adminName: session.name,
      action: 'PACKAGE_UPDATED',
      entityType: 'PACKAGE',
      entityId: id,
      details: { updates: body },
    });

    return NextResponse.json({ success: true, package: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
