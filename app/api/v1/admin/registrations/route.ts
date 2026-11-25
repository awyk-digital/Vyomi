import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db, PayMethod } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const status = searchParams.get('status') || undefined;
  const packageId = searchParams.get('packageId') || undefined;
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const sort = searchParams.get('sort') || 'desc';

  const result = db.queryRegistrations({ q, status, packageId, from, to, page, pageSize, sort });
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { client, packageId, paymentMethod, startDate, notes, markPaid } = body;

    if (!client || !client.fullName || !client.phone || !packageId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name, phone, and package are required' } },
        { status: 400 }
      );
    }

    const { registration, client: savedClient, pkg } = db.createRegistration({
      clientData: {
        fullName: client.fullName.trim(),
        phone: client.phone.trim().replace(/\D/g, ''),
        email: (client.email || '').trim().toLowerCase() || `${client.phone}@walkin.vyomi.internal`,
        dateOfBirth: client.dateOfBirth || '1990-01-01',
        gender: client.gender || 'Prefer not to say',
        address: client.address || 'Vijayawada Walk-in',
        photoUrl: null,
        idProofType: client.idProofType || null,
        idProofNumber: client.idProofNumber || null,
        fitnessGoal: client.fitnessGoal || 'General Fitness',
        medicalNotes: client.medicalNotes || null,
        emergencyContactName: client.emergencyContactName || 'Self',
        emergencyContactPhone: client.emergencyContactPhone || client.phone,
        guardianName: null,
      },
      packageId,
      startDate: startDate || new Date().toISOString().split('T')[0],
      acceptedIp: 'admin-walkin',
    });

    registration.notes = notes || `Walk-in registration created by ${session.name}`;

    let memberCode: string | null = null;
    if (markPaid) {
      const confirmed = db.confirmPaymentAndRegistration({
        registrationRef: registration.reference,
        paymentId: `walkin_${Date.now()}`,
        method: (paymentMethod as PayMethod) || 'CASH',
      });
      memberCode = confirmed.memberCode;
    }

    db.logAudit({
      adminId: session.id,
      adminName: session.name,
      action: 'WALKIN_REGISTRATION_CREATED',
      entityType: 'REGISTRATION',
      entityId: registration.id,
      details: {
        reference: registration.reference,
        clientName: savedClient.fullName,
        package: pkg.name,
        markPaid: !!markPaid,
        method: paymentMethod || 'CASH',
      },
    });

    return NextResponse.json({
      success: true,
      registrationRef: registration.reference,
      memberCode,
      status: registration.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Walk-in registration failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
