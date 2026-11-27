import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generatePdfReceipt, receiptNumberFor } from '@/lib/pdfReceipt';
import { RECEIPT_LOGO_JPEG } from '@/lib/receiptLogo';
import { sendMembershipReceiptEmail } from '@/lib/email';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ reference: string }> }
) {

  const staff = await getAdminSession();
  if (!staff) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Front desk sign-in required.' } },
      { status: 401 }
    );
  }
  try {
    const { reference } = await params;

    if (!reference) {
      return NextResponse.json(
        { error: { code: 'MISSING_REF', message: 'Registration reference is required.' } },
        { status: 400 }
      );
    }

    // 1. Fetch registration from Supabase
    let reg: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('registrations')
        .select('*, client:clients(*), package:packages(*), payment:payments(*)')
        .eq('reference', reference)
        .single();
      reg = data;
    } catch {
      reg = null;
    }

    // Fallback: local registration mirror (same reference) when Supabase has no row
    if (!reg) {
      const local = db.findRegistrationByRef(reference);
      if (local) {
        const end = new Date(local.startDate);
        end.setDate(end.getDate() + (local.package?.durationDays || 365));
        reg = {
          reference: local.reference,
          status: local.status,
          amount_inr: Math.round((local.package?.pricePaise ?? local.pricePaise) / 100),
          preferred_slot: local.preferredSlot,
          start_date: local.startDate,
          end_date: local.endDate || end.toISOString().split('T')[0],
          created_at: local.createdAt,
          notes: local.notes,
          client: local.client && {
            email: local.client.email,
            full_name: local.client.fullName,
            member_code: local.client.memberCode,
            phone: local.client.phone,
            fitness_goal: local.client.fitnessGoal,
          },
          package: local.package && { name: local.package.name, duration_days: local.package.durationDays, price_inr: Math.round(local.package.pricePaise / 100) },
          payment: local.payment && { method: local.payment.method, status: local.payment.status },
        };
      }
    }

    if (!reg) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Registration record not found.' } },
        { status: 404 }
      );
    }

    const client = Array.isArray(reg.client) ? reg.client[0] : reg.client;
    const pkg = Array.isArray(reg.package) ? reg.package[0] : reg.package;
    const payment = Array.isArray(reg.payment) ? reg.payment[0] : reg.payment;
    const clientEmail = client?.email || 'member@vyomifitness.com';
    const clientName = client?.full_name || 'Valued Member';
    const memberCode = client?.member_code || 'VYO-2026-MEMBER';
    const packageName = pkg?.name || reg.package_name || 'Vyomi Membership';
    const receiptNum = receiptNumberFor(reference);

    // 2. Generate PDF Base64 Attachment
    let pdfBase64: string | undefined = undefined;
    try {
      const pdfDoc = generatePdfReceipt({
            logoDataUrl: RECEIPT_LOGO_JPEG,
            planPriceInr: Number(pkg?.price_inr || 0) || undefined,
        receiptNumber: receiptNum,
        reference: reg.reference,
        memberCode,
        clientName,
        phone: client?.phone || '',
        email: clientEmail,
        packageName,
        durationDays: pkg?.duration_days || 365,
        timeSlot: reg.preferred_slot || '06:00 – 09:00 AM (Morning Prime)',
        fitnessGoal: client?.fitness_goal || (reg.notes?.startsWith('Goal:') ? reg.notes.replace('Goal:', '').trim() : 'General Fitness'),
        startDate: reg.start_date || new Date().toISOString().split('T')[0],
        endDate: reg.end_date || new Date(Date.now() + 365*86400000).toISOString().split('T')[0],
        amountInr: Number(reg.amount_inr || 0),
        paymentMethod: payment?.method === 'CASH' ? 'CASH' : 'UPI',
        paymentStatus: reg.status === 'CONFIRMED' ? 'PAID' : 'PENDING_CASH_COLLECTION',
        utrNumber: payment?.utr_number || undefined,
        paymentDate: reg.created_at ? new Date(reg.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
      pdfBase64 = Buffer.from(pdfDoc.output('arraybuffer')).toString('base64');
    } catch (pdfErr) {
      console.warn('PDF generation notice:', pdfErr);
    }

    // 3. Dispatch Email via Resend
    const emailResult = await sendMembershipReceiptEmail({
      toEmail: clientEmail,
      planPriceInr: Number(pkg?.price_inr || 0) || undefined,
      clientName,
      memberCode,
      receiptNumber: receiptNum,
      reference: reg.reference,
      packageName,
      amountInr: Number(reg.amount_inr || 0),
      timeSlot: reg.preferred_slot || '06:00 – 09:00 AM',
      fitnessGoal: client?.fitness_goal || undefined,
      startDate: reg.start_date,
      endDate: reg.end_date,
      paymentMethod: payment?.method || 'UPI',
      paymentStatus: reg.status === 'CONFIRMED' ? 'PAID' : 'PENDING_CASH_COLLECTION',
      utrNumber: payment?.utr_number || undefined,
      pdfBase64,
    });

    // 4. Record / Update receipts audit in Supabase
    await Promise.resolve(supabaseAdmin
      .from('receipts')
      .upsert(
        {
          registration_reference: reference,
          client_email: clientEmail,
          receipt_number: receiptNum,
          payload: {
            memberCode,
            clientName,
            amountInr: reg.amount_inr,
            status: reg.status,
            preferredSlot: reg.preferred_slot,
            emailedTo: clientEmail,
            provider: emailResult.provider,
            dispatched: emailResult.sent,
          },
          is_emailed: emailResult.sent,
          emailed_at: emailResult.sent ? new Date().toISOString() : null,
        },
        { onConflict: 'receipt_number' }
      )).catch(() => null);

    return NextResponse.json({
      success: true,
      message: emailResult.sent
        ? `Official PDF receipt & Digital VIP Card successfully dispatched to ${clientEmail}`
        : `Receipt recorded for ${clientEmail}.`,
      receiptNumber: receiptNum,
      emailedTo: clientEmail,
      dispatched: emailResult.sent,
      provider: emailResult.provider,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Receipt dispatch failed';
    return NextResponse.json({ error: { code: 'DISPATCH_ERROR', message } }, { status: 500 });
  }
}
