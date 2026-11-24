import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { id } = await params;
  const reg = db.findRegistrationByRef(id);
  if (!reg) {
    return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  return NextResponse.json({ registration: reg });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MANAGER')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  const { id } = await params;
  const reg = db.findRegistrationByRef(id);
  if (!reg) {
    return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      email,
      dateOfBirth,
      gender,
      address,
      idProofType,
      idProofNumber,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
      fitnessGoal,
      preferredSlot,
      notes,
      startDate,
      endDate,
      status,
    } = body;

    // Update Client Profile Details
    const client = db.findClientById(reg.clientId);
    if (client) {
      if (fullName) client.fullName = fullName.trim();
      if (phone) client.phone = phone.trim();
      if (email) client.email = email.trim();
      if (dateOfBirth) client.dateOfBirth = dateOfBirth;
      if (gender) client.gender = gender;
      if (address !== undefined) client.address = address;
      if (idProofType !== undefined) client.idProofType = idProofType;
      if (idProofNumber !== undefined) client.idProofNumber = idProofNumber;
      if (emergencyContactName) client.emergencyContactName = emergencyContactName.trim();
      if (emergencyContactPhone) client.emergencyContactPhone = emergencyContactPhone.trim();
      if (medicalNotes !== undefined) client.medicalNotes = medicalNotes;
      if (fitnessGoal) client.fitnessGoal = fitnessGoal;
    }

    if (notes !== undefined) reg.notes = notes;
    if (startDate) reg.startDate = startDate;
    if (endDate) reg.endDate = endDate;
    if (preferredSlot) reg.preferredSlot = preferredSlot;
    if (status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'].includes(status)) {
      reg.status = status;
    }
    reg.updatedAt = new Date().toISOString();

    db.save();

    db.logAudit({
      adminId: session.id,
      adminName: session.name,
      action: 'MEMBER_DETAILS_CORRECTED',
      entityType: 'REGISTRATION',
      entityId: reg.id,
      details: {
        registrationRef: reg.reference,
        clientName: client?.fullName,
        updates: body,
      },
    });

    const updated = db.findRegistrationByRef(id);
    return NextResponse.json({ success: true, registration: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
