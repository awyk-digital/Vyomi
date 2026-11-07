import { NextResponse } from 'next/server';

/**
 * Trial / enquiry request intake.
 *
 * NOT YET WIRED TO A DESTINATION. This endpoint validates the payload and
 * returns success, but the lead currently only reaches the server log — it is
 * not emailed, stored, or pushed to a CRM. A delivery target is required before
 * launch; see the outstanding-items report.
 *
 * The response deliberately describes the submission as a *request*. A slot is
 * only ever confirmed by the club, never by this endpoint.
 */

interface TrialRequest {
  name: string;
  phone: string;
  date: string;
  interest: string;
  kind?: string;
}

function validate(body: unknown): { ok: true; data: TrialRequest } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Expected a JSON object.' };
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const phone = typeof b.phone === 'string' ? b.phone.trim() : '';
  const date = typeof b.date === 'string' ? b.date.trim() : '';
  const interest = typeof b.interest === 'string' ? b.interest.trim() : '';

  if (name.length < 2 || name.length > 120) return { ok: false, error: 'Invalid name.' };
  if (phone.replace(/\D/g, '').length < 8) return { ok: false, error: 'Invalid phone number.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: 'Invalid date.' };
  if (interest.length > 120) return { ok: false, error: 'Invalid interest.' };

  return {
    ok: true,
    data: { name, phone, date, interest, kind: typeof b.kind === 'string' ? b.kind : 'enquiry' },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Malformed JSON payload.' },
      { status: 400 }
    );
  }

  const result = validate(body);
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  // TODO(launch): deliver the lead. Until then it exists only in this log line.
  console.log('[Vyomi] trial request received', {
    ...result.data,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    status: 'request_received',
    message: 'Request received. The club will confirm separately.',
  });
}
