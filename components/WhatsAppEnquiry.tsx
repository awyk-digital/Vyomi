'use client';

import { useState } from 'react';
import Reveal from '@/components/Reveal';
import Pending from '@/components/Pending';
import SectionHeading from '@/components/SectionHeading';
import { whatsappLink } from '@/config/site';

const INTERESTS = [
  'Membership',
  'Strength & conditioning',
  'HYROX',
  'Reformer Pilates',
  'Wellness & recovery',
  'Personal training',
] as const;

/**
 * WhatsApp enquiry.
 *
 * Visually distinct from the trial invitation: a quiet two-column form on the
 * charcoal band rather than a full-width typographic statement.
 *
 * Submitting opens the official club WhatsApp number in a new tab with an
 * encoded, prefilled message. Nothing is sent silently — the visitor presses
 * send themselves inside WhatsApp. The number comes from config; when it is
 * not configured the control is disabled rather than pointing somewhere wrong.
 */
export default function WhatsAppEnquiry() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    interest: INTERESTS[0] as string,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const compose = () =>
    [
      'Hello Vyomi — I would like to enquire.',
      '',
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Interest: ${form.interest}`,
      ...(form.message.trim() ? ['', form.message.trim()] : []),
    ].join('\n');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (form.phone.replace(/\D/g, '').length < 8) {
      setError('Please enter a phone number we can reach you on.');
      return;
    }

    const href = whatsappLink(compose());
    if (!href) {
      setError('The club WhatsApp number is not configured yet.');
      return;
    }

    setError(null);
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const configured = whatsappLink('test') !== null;

  return (
    <section
      id="enquire"
      className="border-t border-hairline bg-ink px-pad-x py-section-y"
      aria-labelledby="enquire-heading"
    >
      <div className="mx-auto grid max-w-shell grid-cols-1 gap-10 md:grid-cols-12 md:gap-16">
        <Reveal className="md:col-span-5">
          <SectionHeading id="enquire-heading" className="t-h2 uppercase text-heading">
            {'Let’s talk.'}
          </SectionHeading>
          <p className="t-small mt-5 max-w-measure text-muted">
            Send us a note and we will reply on WhatsApp.
          </p>
          {!configured && (
            <p className="mt-5">
              <Pending label="Official WhatsApp number" />
            </p>
          )}
        </Reveal>

        <form onSubmit={onSubmit} noValidate className="md:col-span-7">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="eq-name" className="t-label mb-1.5 block text-muted">
                Name
              </label>
              <input
                id="eq-name"
                className="field"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set('name')(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="eq-phone" className="t-label mb-1.5 block text-muted">
                Phone
              </label>
              <input
                id="eq-phone"
                className="field nums"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set('phone')(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="eq-interest" className="t-label mb-1.5 block text-muted">
                Interest
              </label>
              <select
                id="eq-interest"
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

            <div className="sm:col-span-2">
              <label htmlFor="eq-message" className="t-label mb-1.5 block text-muted">
                Message <span className="text-faint">(optional)</span>
              </label>
              <textarea
                id="eq-message"
                className="field resize-y"
                rows={3}
                maxLength={500}
                value={form.message}
                onChange={(e) => set('message')(e.target.value)}
              />
            </div>
          </div>

          <p role="alert" aria-live="polite" className="t-small mt-4 text-burgundy">
            {error}
          </p>

          <button type="submit" className="btn-solid mt-5" disabled={!configured}>
            Enquire on WhatsApp ↗
          </button>

          <p className="t-small mt-4 text-faint">
            Opens WhatsApp with your message ready. You press send.
          </p>
        </form>
      </div>
    </section>
  );
}
