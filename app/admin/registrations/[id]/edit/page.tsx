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
      <div className="py-16 text-center text-xs font-semibold text-[#64748B]">
        Loading member record for correction...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/admin/registrations"
              className="font-bold text-[#64748B] hover:text-[#0F172A]"
            >
              Registrations
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <Link
              href={`/admin/registrations/${id}`}
              className="font-bold text-[#64748B] hover:text-[#0F172A]"
            >
              {reference}
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider">
              Correction & Update
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-1 tracking-tight">
            Edit Member Dossier · {form.fullName || 'Client'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {memberCode && (
            <span className="text-xs font-mono font-extrabold text-[#D97706] px-2.5 py-1 rounded-md border border-[#FDE68A] bg-[#FEF3C7]">
              {memberCode}
            </span>
          )}
          <Link
            href={`/admin/registrations/${id}`}
            className="inline-flex items-center h-9 px-3.5 text-xs font-bold rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          >
            ← Cancel & Back to Dossier
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <span className="text-[11px] text-emerald-600">Redirecting to dossier...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 rounded-lg text-xs font-bold">
          ⚠ {errorMessage}
        </div>
      )}

      {/* Editing Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Identification */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 space-y-5 shadow-sm">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#D97706] border-b border-[#F1F5F9] pb-2.5">
            01. Personal Identity & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Mobile Number (+91) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                ID Document Verification
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.idProofType}
                  onChange={(e) => setForm({ ...form, idProofType: e.target.value })}
                  className="h-10 px-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
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
                  className="h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
              Residential Address
            </label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF] resize-none"
            />
          </div>
        </div>

        {/* Section 2: Emergency & Health Protocol */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 space-y-5 shadow-sm">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#D97706] border-b border-[#F1F5F9] pb-2.5">
            02. Emergency Contact & Medical Notes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Emergency Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Emergency Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={form.emergencyContactPhone}
                onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Primary Fitness Objective
              </label>
              <input
                type="text"
                value={form.fitnessGoal}
                onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Preferred Daily Time Slot
              </label>
              <select
                value={form.preferredSlot}
                onChange={(e) => setForm({ ...form, preferredSlot: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              >
                <option value="morning">Morning (06:00 – 11:00)</option>
                <option value="afternoon">Afternoon (11:00 – 16:00)</option>
                <option value="evening">Evening (16:00 – 22:00)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
              Medical History / Injuries / Restrictions
            </label>
            <textarea
              rows={2}
              value={form.medicalNotes}
              onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })}
              className="w-full p-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF] resize-none"
            />
          </div>
        </div>

        {/* Section 3: Membership Status & Concierge Operations */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 space-y-5 shadow-sm">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#D97706] border-b border-[#F1F5F9] pb-2.5">
            03. Operational Status & Concierge Audit Notes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Enrollment Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              >
                <option value="CONFIRMED">CONFIRMED (Active)</option>
                <option value="PENDING">PENDING (Awaiting Payment)</option>
                <option value="CANCELLED">CANCELLED (Terminated)</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
                End Date (Expiration)
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#475569] mb-1.5 uppercase tracking-wider font-bold text-[11px]">
              Staff Internal Notes & Corrections Log
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Corrected member phone number per WhatsApp verification on 24 Nov..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706] focus:bg-[#FFFFFF] resize-none"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
          <Link
            href={`/admin/registrations/${id}`}
            className="inline-flex items-center h-10 px-4 text-xs font-bold rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          >
            Discard Changes
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-extrabold tracking-wide uppercase shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving Corrections...' : 'Save Member Corrections →'}
          </button>
        </div>
      </form>
    </div>
  );
}
