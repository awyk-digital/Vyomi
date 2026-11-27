import { NextResponse } from 'next/server';
import { getAdminSession, MANAGEMENT_ROLES } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { db, PayMethod } from '@/lib/db';
import { sendMembershipReceiptEmail } from '@/lib/email';
import { generatePdfReceipt } from '@/lib/pdfReceipt';
import { logActivity } from '@/lib/activity';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(MANAGEMENT_ROLES);
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MANAGER')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const method: PayMethod = body.method || 'CASH';

    // 1. Try updating in Supabase
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabaseAdmin
        .from('registrations')
        .select('*, client:clients(*), package:packages(*)');

      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.eq('reference', id);
      }

      const { data: reg, error: regLookupErr } = await query.maybeSingle();
      if (regLookupErr) {
        console.warn('Supabase reg lookup notice:', regLookupErr);
      }

      if (reg) {
        if (reg.status === 'CONFIRMED') {
          return NextResponse.json(
            { error: { code: 'ALREADY_PAID', message: 'This membership is already marked as paid.' } },
            { status: 400 }
          );
        }
        if (reg.status === 'CANCELLED') {
          return NextResponse.json(
            { error: { code: 'CANCELLED', message: 'This membership was cancelled.' } },
            { status: 400 }
          );
        }

        // Update registration status
        const { error: regUpdErr } = await supabaseAdmin
          .from('registrations')
          .update({
            status: 'CONFIRMED',
            updated_at: new Date().toISOString(),
          })
          .eq('id', reg.id);
        if (regUpdErr) {
          return NextResponse.json(
            { error: { code: 'DB_ERROR', message: `Could not mark as paid: ${regUpdErr.message}` } },
            { status: 500 }
          );
        }

        await logActivity({
          adminId: session.id,
          adminName: session.name,
          adminRole: session.role,
          action: 'CASH_COLLECTED',
          entityType: 'REGISTRATION',
          entityId: reg.reference,
          details: { amountInr: Number(reg.amount_inr || 0), method: method || 'CASH' },
        });

        // Update payment status
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'PAID',
            method: method || 'CASH',
            paid_at: new Date().toISOString(),
            notes: `Cash collected and verified by admin: ${session.name}`,
          })
          .eq('registration_id', reg.id);

        // Client and Package details
        const client = Array.isArray(reg.client) ? reg.client[0] : reg.client;
        const pkg = Array.isArray(reg.package) ? reg.package[0] : reg.package;
        const clientEmail = client?.email;
        const clientName = client?.full_name || 'Valued Member';
        const memberCode = client?.member_code || reg.member_code || `VYO-2026-${reg.reference.slice(-5)}`;
        const packageName = pkg?.name || reg.package_name || 'VIP Membership';
        const receiptNumber = `REC-2026-${reg.reference.replace(/\D/g, '').slice(-5) || Math.floor(10000 + Math.random() * 90000)}`;

        // Dispatch Digital VIP Card & PDF Receipt to user's Gmail
        if (clientEmail) {
          try {
            const pdfDoc = generatePdfReceipt({
              receiptNumber,
              reference: reg.reference,
              memberCode,
              clientName,
              phone: client?.phone || '',
              email: clientEmail,
              packageName,
              durationDays: pkg?.duration_days || 365,
              timeSlot: reg.preferred_slot || '06:00 – 09:00 AM',
              startDate: reg.start_date || new Date().toISOString().split('T')[0],
              endDate: reg.end_date || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
              amountInr: Number(reg.amount_inr || 0),
              paymentMethod: 'CASH',
              paymentStatus: 'PAID',
              paymentDate: new Date().toISOString().split('T')[0],
            });
            const pdfBase64 = Buffer.from(pdfDoc.output('arraybuffer')).toString('base64');

            sendMembershipReceiptEmail({
              toEmail: clientEmail,
              clientName,
              memberCode,
              receiptNumber,
              reference: reg.reference,
              packageName,
              amountInr: Number(reg.amount_inr || 0),
              timeSlot: reg.preferred_slot || '06:00 – 09:00 AM',
              startDate: reg.start_date,
              endDate: reg.end_date,
              paymentMethod: 'CASH',
              paymentStatus: 'PAID',
              pdfBase64,
            }).then((res) => {
              if (res.sent) {
                supabaseAdmin
                  .from('receipts')
                  .upsert({
                    registration_reference: reg.reference,
                    client_email: clientEmail,
                    receipt_number: receiptNumber,
                    is_emailed: true,
                    emailed_at: new Date().toISOString(),
                  }, { onConflict: 'receipt_number' })
                  .then();
              }
            }).catch(console.warn);
          } catch (pdfErr) {
            console.warn('PDF dispatch notice on mark-paid:', pdfErr);
          }
        }

        return NextResponse.json({
          success: true,
          memberCode,
          status: 'CONFIRMED',
          emailedTo: clientEmail,
        });
      }
    } catch (supErr) {
      console.warn('Supabase mark-paid error:', supErr);
    }

    // 2. Fallback to in-memory db
    const reg = db.findRegistrationByRef(id);
    if (!reg) {
      return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
    }

    const result = db.confirmPaymentAndRegistration({
      registrationRef: reg.reference,
      paymentId: `offline_${Date.now()}`,
      method,
    });

    db.logAudit({
      adminId: session.id,
      adminName: session.name,
      action: 'OFFLINE_PAYMENT_RECORDED',
      entityType: 'REGISTRATION',
      entityId: reg.id,
      details: { method, memberCode: result.memberCode, amount: reg.totalPaise / 100 },
    });

    return NextResponse.json({
      success: true,
      memberCode: result.memberCode,
      status: 'CONFIRMED',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Mark paid failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
