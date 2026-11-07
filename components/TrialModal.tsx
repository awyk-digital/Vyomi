'use client';

import { useState } from 'react';
import Magnetic from '@/components/Magnetic';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrialModal({ isOpen, onClose }: TrialModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    goal: 'Strength',
  });
  const [dateWarning, setDateWarning] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleDateChange = (val: string) => {
    setFormData((prev) => ({ ...prev, date: val }));
    if (val && new Date(val) < new Date('2026-11-12')) {
      setDateWarning('Note: Exclusive pre-sale trials commence from 12 November 2026.');
    } else {
      setDateWarning('');
    }
  };

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

    const msg = `Hi Vyomi Fitness Club — I'd like to book my free 2-day trial.\nName: ${formData.name}\nPhone: ${formData.phone}\nPreferred Date: ${formData.date || 'Earliest'}\nGoal: ${formData.goal}`;
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(msg)}`, '_blank');

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--ink)]/90 backdrop-blur-md p-6">
      <div className="relative w-full max-w-lg border border-[var(--hairline)] bg-[var(--surface)] p-8 rounded-[2px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4 mb-6">
          <div>
            <span className="type-label text-[var(--champagne)] block mb-1">COMPLIMENTARY ACCESS</span>
            <h3 className="font-display text-2 font-semibold uppercase text-[var(--bone)]">
              Reserve Your 2 Days
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--bone-dim)] hover:text-[var(--bone)]"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <span className="type-label text-[var(--champagne)] block mb-3">RESERVATION OPENED</span>
            <p className="type-body text-bone text-1 mb-6">
              Your inquiry has been transferred to our WhatsApp concierge. We look forward to hosting you at Vyomi.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="border border-[var(--bone)] px-6 py-2.5 text-label text-[var(--bone)] hover:bg-[var(--bone)] hover:text-[var(--ink)]"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <div className="flex flex-col border-b border-[var(--hairline)] pb-2 focus-within:border-[var(--bone)]">
              <label className="type-label text-[0.65rem] text-[var(--bone-dim)] mb-1">NAME</label>
              <input
                type="text"
                required
                placeholder="Marcus Valerius"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent font-display text-1 text-[var(--bone)] focus:outline-none"
              />
            </div>

            <div className="flex flex-col border-b border-[var(--hairline)] pb-2 focus-within:border-[var(--bone)]">
              <label className="type-label text-[0.65rem] text-[var(--bone-dim)] mb-1">WHATSAPP NUMBER</label>
              <input
                type="tel"
                required
                placeholder="+91 99999 99999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-transparent font-display text-1 text-[var(--bone)] focus:outline-none"
              />
            </div>

            <div className="flex flex-col border-b border-[var(--hairline)] pb-2 focus-within:border-[var(--bone)]">
              <label className="type-label text-[0.65rem] text-[var(--bone-dim)] mb-1">PREFERRED TRIAL DATE</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-transparent font-mono text-[0.85rem] text-[var(--bone)] focus:outline-none"
              />
              {dateWarning && (
                <span className="type-label text-[0.62rem] text-[var(--panatta)] mt-2">
                  {dateWarning}
                </span>
              )}
            </div>

            <div className="flex flex-col border-b border-[var(--hairline)] pb-2 focus-within:border-[var(--bone)]">
              <label className="type-label text-[0.65rem] text-[var(--bone-dim)] mb-1">PRIMARY GOAL</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-transparent font-display text-1 text-[var(--bone)] focus:outline-none"
              >
                <option value="Strength" className="bg-[var(--ink)] text-[var(--bone)]">
                  Strength & Panatta Mechanics
                </option>
                <option value="HYROX" className="bg-[var(--ink)] text-[var(--bone)]">
                  HYROX Competition
                </option>
                <option value="Pilates" className="bg-[var(--ink)] text-[var(--bone)]">
                  Reformer Pilates
                </option>
                <option value="Recovery" className="bg-[var(--ink)] text-[var(--bone)]">
                  Recovery & Hydrothermal
                </option>
              </select>
            </div>

            <Magnetic className="w-full mt-4">
              <button
                type="submit"
                className="w-full rounded-[2px] border border-[var(--bone)] bg-[var(--bone)] py-3.5 text-center text-label text-[var(--ink)] font-semibold hover:bg-transparent hover:text-[var(--bone)] transition-all"
              >
                CONFIRM RESERVATION
              </button>
            </Magnetic>
          </form>
        )}
      </div>
    </div>
  );
}

