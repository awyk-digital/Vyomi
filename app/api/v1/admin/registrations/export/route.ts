import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MANAGER')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const status = searchParams.get('status') || undefined;
  const packageId = searchParams.get('packageId') || undefined;
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;

  const result = db.queryRegistrations({ q, status, packageId, from, to, page: 1, pageSize: 5000 });

  db.logAudit({
    adminId: session.id,
    adminName: session.name,
    action: 'EXPORT_REGISTRATIONS_CSV',
    entityType: 'REGISTRATION',
    entityId: 'export',
    details: { count: result.items.length },
  });

  const headers = [
    'Reference',
    'Member Code',
    'Client Name',
    'Phone',
    'Email',
    'Package',
    'Amount (INR)',
    'Status',
    'Payment Status',
    'Payment Method',
    'Start Date',
    'End Date',
    'Created At',
  ];

  const escapeCsv = (val: unknown) => {
    const s = String(val ?? '');
    return `"${s.replace(/"/g, '""')}"`;
  };

  const rows = result.items.map((r) => [
    escapeCsv(r.reference),
    escapeCsv(r.client?.memberCode || 'N/A'),
    escapeCsv(r.client?.fullName || 'N/A'),
    escapeCsv(r.client?.phone || 'N/A'),
    escapeCsv(r.client?.email || 'N/A'),
    escapeCsv(r.package?.name || 'N/A'),
    escapeCsv((r.totalPaise / 100).toFixed(2)),
    escapeCsv(r.status),
    escapeCsv(r.payment?.status || 'N/A'),
    escapeCsv(r.payment?.method || 'N/A'),
    escapeCsv(r.startDate || 'N/A'),
    escapeCsv(r.endDate || 'N/A'),
    escapeCsv(r.createdAt),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vyomi_registrations_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
