'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EditFormData {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  idProofType: string;
  idProofNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalNotes: string;
  fitnessGoal: string;
  preferredSlot: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string;
}

export default function EditRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState('');
  const [memberCode, setMemberCode] = useState<string | null>(null);
  const [packageName, setPackageName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState<EditFormData>({
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'Prefer not to say',
    address: '',
    idProofType: 'Aadhaar',
    idProofNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalNotes: '',
    fitnessGoal: '',
    preferredSlot: 'morning',
    startDate: '',
    endDate: '',
    status: 'CONFIRMED',
    notes: '',
  });

  useEffect(() => {
    fetch(`/api/v1/admin/registrations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.registration) {
          const r = data.registration;
          setReference(r.reference);
          setPackageName(r.package?.name || 'Standard');
          setMemberCode(r.client?.memberCode || null);

          setForm({
            fullName: r.client?.fullName || '',
            phone: r.client?.phone || '',
            email: r.client?.email || '',
            dateOfBirth: r.client?.dateOfBirth || '',
            gender: r.client?.gender || 'Prefer not to say',
            address: r.client?.address || '',
            idProofType: r.client?.idProofType || 'Aadhaar',
            idProofNumber: r.client?.idProofNumber || '',
            emergencyContactName: r.client?.emergencyContactName || '',
            emergencyContactPhone: r.client?.emergencyContactPhone || '',
            medicalNotes: r.client?.medicalNotes || '',
            fitnessGoal: r.client?.fitnessGoal || '',
            preferredSlot: r.preferredSlot || 'morning',
            startDate: r.startDate || '',
            endDate: r.endDate || '',
            status: r.status || 'CONFIRMED',
            notes: r.notes || '',
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }
    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Mobile phone must be exactly 10 digits.');
      return;
    }
    if (!form.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (form.emergencyContactPhone && form.emergencyContactPhone.replace(/\D/g, '').length !== 10) {
      setErrorMessage('Emergency contact number must be 10 digits.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error?.message || 'Failed to update member record.');
      } else {
        setSuccessMessage('Member details successfully corrected and audit-logged.');
        setTimeout(() => {
          router.push(`/admin/registrations/${id}`);
        }, 1500);
      }
    } catch {
      setErrorMessage('An unexpected error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-white/50">
        Loading member record for correction...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/admin/registrations"
              className="text-white/50 hover:text-white"
            >
              Registrations
            </Link>
            <span className="text-white/20">/</span>
            <Link
              href={`/admin/registrations/${id}`}
              className="text-white/50 hover:text-white"
            >
              {reference}
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-[#D4AF37] uppercase font-semibold">
              Correction & Update
            </span>
          </div>
          <h1 className="t-h2 text-white font-semibold mt-1">
            Edit Member Dossier · {form.fullName || 'Client'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {memberCode && (
            <span className="nums text-xs font-mono font-bold text-[#D4AF37] px-2.5 py-1 rounded border border-[#D4AF37]/30 bg-[#D4AF37]/10">
              {memberCode}
            </span>
          )}
          <Link
            href={`/admin/registrations/${id}`}
            className="btn-line-light !h-9 !px-3.5 !text-xs"
          >
            ← Cancel & Back to Dossier
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-[#10B981]/15 border border-[#10B981] text-[#10B981] rounded text-xs flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <span className="text-[0.6875rem] text-white/70">Redirecting to dossier...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-[var(--burgundy-wash)] border border-[var(--burgundy)] text-[var(--burgundy)] rounded text-xs">
          ⚠ {errorMessage}
        </div>
      )}

      {/* Editing Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Identification */}
        <div className="bg-[#111114] border border-white/10 rounded-lg p-6 space-y-5 shadow-lg">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37] border-b border-white/10 pb-2.5">
            01. Personal Identity & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Full Legal Name <span className="text-[#8C2230]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Mobile Number (+91) <span className="text-[#8C2230]">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Email Address <span className="text-[#8C2230]">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="light-input"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                ID Document Verification
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.idProofType}
                  onChange={(e) => setForm({ ...form, idProofType: e.target.value })}
                  className="light-input !text-xs"
                >
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
                <input
                  type="text"
                  placeholder="ID Number"
                  value={form.idProofNumber}
                  onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })}
                  className="light-input !text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium text-xs">
              Residential Address
            </label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="light-input !h-auto py-2.5 resize-none text-xs"
            />
          </div>
        </div>

        {/* Section 2: Emergency & Health Protocol */}
        <div className="bg-[#111114] border border-white/10 rounded-lg p-6 space-y-5 shadow-lg">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37] border-b border-white/10 pb-2.5">
            02. Emergency Contact & Medical Notes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Emergency Contact Person <span className="text-[#8C2230]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Emergency Contact Number <span className="text-[#8C2230]">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={form.emergencyContactPhone}
                onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Primary Fitness Objective
              </label>
              <input
                type="text"
                value={form.fitnessGoal}
                onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Preferred Daily Time Slot
              </label>
              <select
                value={form.preferredSlot}
                onChange={(e) => setForm({ ...form, preferredSlot: e.target.value })}
                className="light-input"
              >
                <option value="morning">Morning (06:00 – 11:00)</option>
                <option value="afternoon">Afternoon (11:00 – 16:00)</option>
                <option value="evening">Evening (16:00 – 22:00)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium text-xs">
              Medical History / Injuries / Restrictions
            </label>
            <textarea
              rows={2}
              value={form.medicalNotes}
              onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })}
              className="light-input !h-auto py-2.5 resize-none text-xs"
            />
          </div>
        </div>

        {/* Section 3: Membership Status & Concierge Operations */}
        <div className="bg-[#111114] border border-white/10 rounded-lg p-6 space-y-5 shadow-lg">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37] border-b border-white/10 pb-2.5">
            03. Operational Status & Concierge Audit Notes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Enrollment Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="light-input"
              >
                <option value="CONFIRMED">CONFIRMED (Active)</option>
                <option value="PENDING">PENDING (Awaiting Payment)</option>
                <option value="CANCELLED">CANCELLED (Terminated)</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>

            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium">
                End Date (Expiration)
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="light-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 mb-1.5 uppercase tracking-wider font-medium text-xs">
              Staff Internal Notes & Corrections Log
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Corrected member phone number per WhatsApp verification on 24 Nov..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="light-input !h-auto py-2.5 resize-none text-xs"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <Link
            href={`/admin/registrations/${id}`}
            className="btn-line-light"
          >
            Discard Changes
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="btn-solid-light !h-12 !px-8 text-sm"
          >
            {submitting ? 'Saving Corrections...' : 'Save Member Corrections →'}
          </button>
        </div>
      </form>
    </div>
  );
}
