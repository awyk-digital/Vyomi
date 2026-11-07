'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import Reveal from '@/components/Reveal';
import Pending from '@/components/Pending';
import SectionHeading from '@/components/SectionHeading';
import { site, whatsappLink } from '@/config/site';

type Status = 'idle' | 'sending' | 'sent' | 'failed';

const INTERESTS = [
  'Strength & conditioning',
  'HYROX',
  'Reformer Pilates',
  'Wellness & recovery',
  'Not sure yet',
] as const;

/**
 * Free two-day experience — a bold typographic invitation and one booking action.
 *
 * No pricing table and no membership prices, per the brief.
 *
 * Nothing here claims a booking is confirmed. The form submits a *request*, the
 * success state says so explicitly, and the WhatsApp alternative is labelled as
 * a request too. A slot is only ever confirmed by the club.
 */
export default function TrialSection() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    date: '',
    interest: INTERESTS[0] as string,
  });

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Today, in the visitor's own timezone, for the date floor.
  const todayISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    // Permissive on format, strict on having enough digits to be callable.
    if (form.phone.replace(/\D/g, '').length < 8) {
      setError('Please enter a phone number we can reach you on.');
      return;
    }
    if (!form.date) {
      setError('Please choose a preferred date.');
      return;
    }

    setError(null);
    setStatus('sending');

    try {
      const res = await fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, kind: 'two-day-trial' }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  const waRequest = whatsappLink(
    `Hello Vyomi — I would like to request the free two-day experience.\n\nName: ${form.name || '—'}\nPhone: ${form.phone || '—'}\nPreferred date: ${form.date || '—'}\nInterest: ${form.interest}`
  );

  return (
    <section
      id="trial"
      className="border-t border-hairline bg-ink px-pad-x py-section-y"
      aria-labelledby="trial-heading"
    >
      <div className="mx-auto max-w-shell">
        <SectionHeading
          id="trial-heading"
          className="t-hero uppercase text-heading"
        >
          {'Two days.\nExperience Vyomi.'}
        </SectionHeading>

        <Reveal delay={0.08} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <button type="button" className="btn-solid" onClick={() => setOpen(true)}>
            Request your two days
          </button>

          {site.trialTerms ? (
            <p className="t-small max-w-measure text-muted">{site.trialTerms.wording}</p>
          ) : (
            <Pending label="Trial wording & eligibility" />
          )}
        </Reveal>

        {site.trialTerms?.eligibility?.length ? (
          <ul className="mt-8 grid max-w-3xl grid-cols-1 gap-x-8 border-t border-hairline pt-5 sm:grid-cols-2">
            {site.trialTerms.eligibility.map((c) => (
              <li key={c} className="t-small border-b border-hairline py-3 text-muted">
                {c}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setStatus('idle');
          setError(null);
        }}
        title="Request your two days"
      >
        {status === 'sent' ? (
          <div>
            <p className="t-body text-heading">Request received.</p>
            <p className="t-small mt-3 text-muted">
              This is a request, not a confirmed booking. The club will contact you on{' '}
              <span className="nums text-heading">{form.phone}</span> to confirm your
              slot.
            </p>
            <button
              type="button"
              className="btn-line mt-6"
              onClick={() => {
                setOpen(false);
                setStatus('idle');
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-5">
            <div>
              <label htmlFor="trial-name" className="t-label mb-1.5 block text-muted">
                Name
              </label>
              <input
                id="trial-name"
                className="field"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set('name')(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="trial-phone" className="t-label mb-1.5 block text-muted">
                Phone
              </label>
              <input
                id="trial-phone"
                className="field nums"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set('phone')(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="trial-date" className="t-label mb-1.5 block text-muted">
                Preferred date
              </label>
              <input
                id="trial-date"
                className="field nums"
                type="date"
                min={todayISO}
                value={form.date}
                onChange={(e) => set('date')(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="trial-interest" className="t-label mb-1.5 block text-muted">
                Training interest
              </label>
              <select
                id="trial-interest"
                className="field"
                value={form.interest}
                onChange={(e) => set('interest')(e.target.value)}
              >
                {INTERESTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <p role="alert" aria-live="polite" className="t-small text-burgundy">
              {error}
              {status === 'failed' &&
                'That did not go through. Please try again, or send the request on WhatsApp.'}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="btn-solid" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send request'}
              </button>

              {waRequest ? (
                <a
                  href={waRequest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-line"
                >
                  Request on WhatsApp ↗
                </a>
              ) : (
                <Pending label="WhatsApp number" />
              )}
            </div>

            <p className="t-small text-faint">
              Sending this submits a request. The club confirms your slot separately.
            </p>
          </form>
        )}
      </Modal>
    </section>
  );
}
