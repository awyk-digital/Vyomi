'use client';

import { useState } from 'react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryModal({ isOpen, onClose }: InquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    focus: 'Strength & Biomechanics',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    try {
      fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {}

    const msg = `Hi Vyomi — I'd like to inquire about accessing the sanctuary.\nName: ${formData.name}\nPhone: ${formData.phone}\nFocus: ${formData.focus}`;
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(msg)}`, '_blank');

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--ink)]/90 backdrop-blur-md p-6">
      <div className="relative w-full max-w-md border border-[var(--hairline)] bg-[var(--surface)] p-8 rounded-[2px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4 mb-6">
          <div>
            <span className="type-label text-[var(--champagne)] block mb-1">Sanctuary access</span>
            <h3 className="font-display text-2 font-light text-[var(--bone)]">
              Inquire
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--bone-dim)] hover:text-[var(--bone)] text-[0.9rem]"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center">
            <span className="type-label text-[var(--champagne)] block mb-2">Message opened</span>
            <p className="type-body text-0 text-[var(--bone-dim)] mb-6">
              Our concierge has opened your WhatsApp message. We look forward to receiving you.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="border border-[var(--hairline)] px-6 py-2 text-label text-[var(--bone)]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <div className="flex flex-col border-b border-[var(--hairline)] pb-2 focus-within:border-[var(--bone)]">
              <label className="type-label text-[0.62rem] text-[var(--bone-dim)] mb-1">Name</label>
              <input
                type="text"
                required
                placeholder="Marcus Valerius"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent font-display text-1 text-[var(--bone)] font-light focus:outline-none"
              />
            </div>

            <div className="flex flex-col border-b border-[var(--hairline)] pb-2 focus-within:border-[var(--bone)]">
              <label className="type-label text-[0.62rem] text-[var(--bone-dim)] mb-1">Phone</label>
              <input
                type="tel"
                required
                placeholder="+91 99999 99999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-transparent font-display text-1 text-[var(--bone)] font-light focus:outline-none"
              />
            </div>

            <div className="flex flex-col border-b border-[var(--hairline)] pb-2 focus-within:border-[var(--bone)]">
              <label className="type-label text-[0.62rem] text-[var(--bone-dim)] mb-1">Primary area of interest</label>
              <select
                value={formData.focus}
                onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                className="w-full bg-transparent font-display text-0 text-[var(--bone)] font-light focus:outline-none"
              >
                <option value="Strength & Biomechanics" className="bg-[var(--ink)] text-[var(--bone)]">
                  Strength & Panatta floor
                </option>
                <option value="Reformer Pilates" className="bg-[var(--ink)] text-[var(--bone)]">
                  Reformer Pilates studio
                </option>
                <option value="Recovery & Wellness" className="bg-[var(--ink)] text-[var(--bone)]">
                  Cold plunge & Salt therapy
                </option>
                <option value="Hyrox" className="bg-[var(--ink)] text-[var(--bone)]">
                  Hyrox conditioning
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full border border-[var(--hairline)] py-3 text-center text-label text-[var(--bone)] hover:border-[var(--bone-dim)] hover:bg-[rgba(244,240,234,0.06)] transition-all mt-4"
            >
              Send inquiry ↗
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

