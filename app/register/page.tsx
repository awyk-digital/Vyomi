'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SUPPLIED } from '@/config/assets';
import { generateUpiString, generateQrDataUrl } from '@/lib/qr';
import { generatePdfReceipt } from '@/lib/pdfReceipt';
import { useBackGuard } from '@/lib/useBackGuard';
import {
  SilverTierBadge,
  GoldTierBadge,
  DiamondTierBadge,
  VipMembershipCard,
  StepTierIcon,
  StepIdIcon,
  StepPaymentIcon,
  SecurityLockBadge,
  UpiIconSvg,
} from '@/components/LuxuryIcons';

interface PackageItem {
  id: string;
  name: string;
  slug: string;
  durationDays: number;
  pricePaise: number;
  originalPricePaise?: number;
  benefits: string[];
  isFeatured?: boolean;
}

const OFFICIAL_PACKAGES: PackageItem[] = [
  {
    id: 'pkg-founding-1y',
    name: 'Founding Membership',
    slug: 'founding',
    durationDays: 365,
    pricePaise: 2500000, // ₹25,000
    benefits: [
      '1 Year Full Gym Access',
      'Italian Panatta Bio-strength Zone',
      'Complimentary Member Locker & Showers',
      'Dedicated Onboarding & Movement Screen',
    ],
  },
  {
    id: 'pkg-vip-1y',
    name: 'VIP Membership',
    slug: 'vip',
    durationDays: 365,
    pricePaise: 5000000, // ₹50,000
    originalPricePaise: 6000000, // ₹60,000
    isFeatured: true,
    benefits: [
      '1 Year Full Gym Access',
      'Limited Recovery & Wellness Suite',
      'Finnish Cedar Sauna & Steam Access',
      'Bi-monthly Body Composition Telemetry',
      'Priority Trainer Consultation',
    ],
  },
  {
    id: 'pkg-vvip-1y',
    name: 'VVIP Membership',
    slug: 'vvip',
    durationDays: 365,
    pricePaise: 6000000, // ₹60,000
    originalPricePaise: 8000000, // ₹80,000
    benefits: [
      '1 Year Full Gym Access',
      'Unlimited Recovery & Wellness Suite',
      'Zumba & Group Fitness Unlimited',
      'Official HYROX Training Zone Access',
      'Hydrotherapy Cold Plunge & Cedar Sauna',
      'VIP Locker & Welcome Kit',
    ],
  },
];

const TIME_SLOTS = [
  '06:00 AM – 09:00 AM (Morning Prime)',
  '09:00 AM – 12:00 PM (Midday)',
  '12:00 PM – 04:00 PM (Afternoon Quiet)',
  '04:00 PM – 08:00 PM (Evening Prime)',
  '08:00 PM – 10:30 PM (Night Sessions)',
];

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPkg = searchParams.get('package') || 'vip';

  // Step 1: Select Plan | Step 2: Member Details & Gmail OTP | Step 3: Payment | Step 4: Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Front desk gate: registration is staff-operated. No session -> staff login.
  const [staff, setStaff] = useState<{ name: string; role: string } | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/admin/auth/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.admin) setStaff({ name: d.admin.name, role: d.admin.role });
        else window.location.replace('/admin/login?next=/register');
      })
      .catch(() => {
        if (!cancelled) window.location.replace('/admin/login?next=/register');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lockSession = async () => {
    await fetch('/api/v1/admin/auth/logout', { method: 'POST' }).catch(() => null);
    window.location.replace('/admin/login?next=/register');
  };

  // Browser Back stays inside registration: steps 2–3 go back one step,
  // steps 1 and 4 do nothing. Members cannot leave to the public site.
  useBackGuard({
    onBack: () => setCurrentStep((s) => (s === 2 || s === 3 ? ((s - 1) as 1 | 2) : s)),
  });

  // Package state
  const [packages, setPackages] = useState<PackageItem[]>(OFFICIAL_PACKAGES);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('pkg-vip-1y');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [preferredSlot, setPreferredSlot] = useState(TIME_SLOTS[0]);
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Real-Time Gmail OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // Payment Options (Strictly 2 options: Dynamic UPI QR or Offline Cash)
  const [paymentOption, setPaymentOption] = useState<'UPI' | 'CASH'>('UPI');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [upiIntentUri, setUpiIntentUri] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Errors & General UI
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  // Confirmed Registration Details
  const [confirmationData, setConfirmationData] = useState<{
    reference: string;
    memberCode: string;
    fullName: string;
    phone: string;
    email: string;
    packageName: string;
    durationDays: number;
    preferredSlot: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    paymentMethod: 'UPI' | 'CASH';
    paymentStatus: string;
    utrNumber?: string;
  } | null>(null);

  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  // Calculate projected End Date (1 year / 365 days)
  const projectedEndDate = useMemo(() => {
    try {
      const d = new Date(startDate || Date.now());
      d.setDate(d.getDate() + 365);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '365 Days From Intake';
    }
  }, [startDate]);

  // Load packages
  useEffect(() => {
    fetch('/api/v1/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.packages && data.packages.length > 0) {
          setPackages(data.packages);
          const found = data.packages.find((p: PackageItem) => p.slug === urlPkg);
          if (found) setSelectedPkgId(found.id);
        }
      })
      .catch(() => {});
  }, [urlPkg]);

  // Selected package lookup
  const selectedPackage = useMemo(() => {
    return packages.find((p) => p.id === selectedPkgId) || packages[1] || packages[0];
  }, [packages, selectedPkgId]);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Generate dynamic QR code whenever selected package or step changes
  useEffect(() => {
    if (currentStep === 3 && paymentOption === 'UPI' && selectedPackage) {
      const amountInr = selectedPackage.pricePaise / 100;
      const upiUri = generateUpiString({
        vpa: '9666636563@axisbank',
        payeeName: 'VALLABHANENI',
        amountInr,
        transactionNote: `Vyomi ${selectedPackage.name}`,
      });
      setUpiIntentUri(upiUri);
      generateQrDataUrl(upiUri).then(setQrDataUrl);
    }
  }, [currentStep, paymentOption, selectedPackage]);

  // Handle Real-Time Gmail OTP Send
  const handleSendEmailOtp = async () => {
    setOtpError('');
    setOtpMessage('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormErrors((prev) => ({ ...prev, email: 'Enter a valid email address first.' }));
      setOtpError('Please provide a valid Gmail/Email address to receive the verification code.');
      return;
    }

    setOtpSending(true);
    try {
      const res = await fetch('/api/v1/auth/email-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, fullName: fullName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error?.message || 'Failed to dispatch verification code to Gmail.');
      } else {
        setOtpSent(true);
        setOtpTimer(60);
        setOtpMessage(`6-digit verification code sent to ${cleanEmail}. Please check your inbox.`);
        setFormErrors((prev) => ({ ...prev, email: '', otp: '' }));
      }
    } catch {
      setOtpError('Network error while requesting verification code.');
    } finally {
      setOtpSending(false);
    }
  };

  // Handle Real-Time Gmail OTP Verify
  const handleVerifyEmailOtp = async () => {
    setOtpError('');
    setOtpMessage('');
    const cleanEmail = email.trim().toLowerCase();

    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code sent to your Gmail.');
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await fetch('/api/v1/auth/email-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error?.message || 'Invalid or expired verification code.');
      } else {
        setEmailVerified(true);
        setOtpMessage('Email verified successfully! You can now proceed.');
        setFormErrors((prev) => ({ ...prev, otp: '', email: '' }));
      }
    } catch {
      setOtpError('Verification failed. Please retry.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Validate Step 2 (Member Details)
  const handleContinueToPayment = () => {
    setGeneralError('');
    const errors: Record<string, string> = {};

    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 3) {
      errors.fullName = 'Full legal name is required.';
    } else if (cleanName.split(/\s+/).length < 2) {
      errors.fullName = 'Please enter both first and last name (e.g. Aditya Varma).';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Valid 10-digit mobile number required starting with 6, 7, 8, or 9.';
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Valid email address is required for receipts and records.';
    } else if (!emailVerified) {
      errors.otp = 'Please verify your Gmail address with the 6-digit verification code.';
    }

    if (!acceptedTerms) {
      errors.terms = 'You must agree to the club membership terms.';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setGeneralError('Please correct the highlighted fields and verify your email address.');
      return;
    }

    setCurrentStep(3);
  };

  // Handle Final Submission (Only 2 options: Online UPI QR or Offline Cash)
  const handleCompleteRegistration = async () => {
    setGeneralError('');
    if (paymentOption === 'UPI' && (!utrNumber || utrNumber.trim().length < 6)) {
      setGeneralError('Please enter the 12-digit UPI / UTR transaction reference after completing payment in PhonePe/GPay.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await fetch('/api/v1/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          fullName: fullName.trim(),
          phone: phone.replace(/\D/g, ''),
          email: email.trim().toLowerCase(),
          preferredSlot,
          fitnessGoal: 'Vyomi Annual Membership',
          startDate,
          gender,
          paymentMethod: paymentOption,
          utrNumber: paymentOption === 'UPI' ? utrNumber.trim() : undefined,
          acceptedTerms: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.error?.message || 'Registration failed. Please retry.');
        setSubmittingPayment(false);
        return;
      }

      const conf = {
        reference: data.reference || data.registrationRef,
        memberCode: data.memberCode,
        fullName: fullName.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        packageName: selectedPackage.name,
        durationDays: selectedPackage.durationDays,
        preferredSlot,
        startDate,
        endDate: data.endDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        totalAmount: selectedPackage.pricePaise / 100,
        paymentMethod: paymentOption,
        paymentStatus: paymentOption === 'UPI' ? 'PAID' : 'PENDING_CASH_COLLECTION',
        utrNumber: paymentOption === 'UPI' ? utrNumber.trim() : undefined,
      };

      setConfirmationData(conf);
      setCurrentStep(4);
    } catch {
      setGeneralError('An unexpected server error occurred.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    if (!confirmationData) return;
    const doc = generatePdfReceipt({
      receiptNumber: `REC-2026-${confirmationData.reference.slice(-5)}`,
      reference: confirmationData.reference,
      memberCode: confirmationData.memberCode,
      clientName: confirmationData.fullName,
      phone: confirmationData.phone,
      email: confirmationData.email,
      packageName: confirmationData.packageName,
      durationDays: confirmationData.durationDays,
      timeSlot: confirmationData.preferredSlot,
      fitnessGoal: 'Vyomi Membership',
      startDate: confirmationData.startDate,
      endDate: confirmationData.endDate,
      amountInr: confirmationData.totalAmount,
      paymentMethod: confirmationData.paymentMethod,
      paymentStatus: confirmationData.paymentStatus as 'PAID' | 'PENDING_CASH_COLLECTION',
      utrNumber: confirmationData.utrNumber,
      paymentDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    });
    doc.save(`Vyomi_Receipt_${confirmationData.memberCode}.pdf`);
  };

  // Send Email Receipt directly via Gmail
  const handleSendEmailReceipt = async () => {
    if (!confirmationData) return;
    setEmailSending(true);
    setEmailStatus('');
    try {
      const res = await fetch(`/api/v1/registrations/${confirmationData.reference}/send-receipt`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setEmailStatus(`Official Digital VIP Card & PDF receipt sent to ${confirmationData.email}`);
      } else {
        setEmailStatus(data.error?.message || 'Receipt recorded in club records.');
      }
    } catch {
      setEmailStatus('Receipt recorded in club records.');
    } finally {
      setEmailSending(false);
    }
  };

  if (!staff) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center text-sm text-[#64748B]">
        Checking front desk sign-in…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#0F172A] py-3 sm:py-4 px-3 sm:px-6 flex flex-col gap-3">
      {/* Top Brand Bar - Clean Standalone Portal */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3 select-none">
          <div className="relative w-8 h-9 sm:w-9 sm:h-10 flex-shrink-0">
            <Image
              src={SUPPLIED.logo.src}
              alt="Vyomi Fitness Club"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-[15px] font-semibold tracking-[0.28em] text-[#0F172A] uppercase leading-none">
              Vyomi
            </span>
            <span className="text-[10px] font-medium tracking-[0.32em] text-[#1E3A8A] uppercase mt-1 leading-none">
              Fitness Club
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-medium tracking-[0.18em] text-[#1E3A8A] uppercase block">
              Patamata, Vijayawada
            </span>
            <span className="text-xs text-[#64748B]">
              {staff ? `Front desk · ${staff.name}` : 'Membership registration'}
            </span>
          </div>
          {staff && (
            <button
              type="button"
              onClick={lockSession}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium text-[#1E3A8A] bg-white border border-[#C7D4F5] hover:border-[#1E3A8A] transition"
            >
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="9" width="12" height="8" rx="2" /><path d="M7 9V6.5a3 3 0 016 0V9" /></svg>
              Lock
            </button>
          )}
        </div>
      </div>

      {/* Main Container - High Contrast Luxury White Card on Slate Foundation */}
      <div className="max-w-5xl mx-auto w-full mt-1 sm:mt-3 lg:my-auto bg-white border border-[#E3E8F2] rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)] p-4 sm:p-6">
        {/* Progress Step Header */}
        <div className="mb-3 sm:mb-4">
          {/* Mobile Step Badge */}
          <div className="flex sm:hidden items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#0F172A]">
              Step {currentStep} of 4: {['Choose plan', 'Your details', 'Payment', 'Confirmation'][currentStep - 1]}
            </span>
            <span className="text-[#1E3A8A] font-mono font-bold">
              {Math.round((currentStep / 4) * 100)}%
            </span>
          </div>

          {/* Desktop step labels with SVGs */}
          <div className="hidden sm:flex items-center justify-between text-xs font-medium text-[#475569] mb-2.5">
            <span className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
              <StepTierIcon className="w-4 h-4" />
              <span>1 · Choose plan</span>
            </span>
            <span className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
              <StepIdIcon className="w-4 h-4" />
              <span>2 · Your details</span>
            </span>
            <span className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
              <StepPaymentIcon className="w-4 h-4" />
              <span>3 · Payment</span>
            </span>
            <span className={`flex items-center gap-1.5 ${currentStep === 4 ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
              <SecurityLockBadge className="w-4 h-4" />
              <span>4 · Confirmation</span>
            </span>
          </div>
          <div className="w-full h-1 bg-[#E6EBF5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1E3A8A] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-300 rounded-xl text-xs text-red-800 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            <span>{generalError}</span>
          </div>
        )}

        {/* ================= STEP 1: SELECT PLAN ================= */}
        {currentStep === 1 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <h1 className="text-lg sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
                Choose your membership
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 mx-auto">
                One year, all-inclusive · Sonovision Plaza, Patamata
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-3 pt-2 md:pt-1">
              {packages.map((pkg) => {
                const isSelected = selectedPkgId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`relative cursor-pointer rounded-xl p-3.5 sm:p-5 border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#1E3A8A] bg-[#F5F8FF] ring-1 ring-[#1E3A8A] shadow-[0_10px_28px_-14px_rgba(30,58,138,0.45)]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#93A8E0] hover:-translate-y-0.5'
                    }`}
                  >
                    {pkg.isFeatured && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-[0.14em] whitespace-nowrap">
                        Most Popular
                      </span>
                    )}

                    <div>
                      {/* Top Row: SVG Tier Emblem + Radio */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {pkg.slug === 'founding' && <SilverTierBadge className="w-5 h-5" />}
                          {pkg.slug === 'vip' && <GoldTierBadge className="w-5 h-5" />}
                          {pkg.slug === 'vvip' && <DiamondTierBadge className="w-5 h-5" />}
                          <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-[0.14em]">
                            1 Year
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#1E3A8A] bg-[#1E3A8A]'
                              : 'border-[#CBD5E1]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>

                      <h3 className="text-base font-semibold text-[#0F172A] mt-2 md:mt-3">
                        {pkg.name}
                      </h3>

                      <div className="mt-1.5">
                        <span className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[#0F172A]">
                          {formatINR(pkg.pricePaise)}
                        </span>
                        {pkg.originalPricePaise && (
                          <span className="text-sm text-[#94A3B8] line-through ml-2">
                            {formatINR(pkg.originalPricePaise)}
                          </span>
                        )}
                        {pkg.originalPricePaise && pkg.originalPricePaise > pkg.pricePaise && (
                          <span className="block w-fit mt-1.5 text-[11px] font-medium text-[#1E3A8A] bg-[#EEF2FF] border border-[#C7D4F5] px-1.5 py-0.5 rounded">
                            Save {formatINR(pkg.originalPricePaise - pkg.pricePaise)}
                          </span>
                        )}
                        <span className="text-xs text-[#94A3B8] block mt-0.5">
                          per year, all-inclusive
                        </span>
                      </div>

                      <ul className={`mt-4 space-y-1.5 text-xs text-[#334155] ${isSelected ? '' : 'hidden md:block'}`}>
                        {pkg.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#1E3A8A] text-[11px] mt-px">✓</span>
                            <span className="text-xs leading-snug">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 hidden md:block">
                      <button
                        type="button"
                        className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition ${
                          isSelected
                            ? 'bg-[#1E3A8A] text-white'
                            : 'bg-white text-[#0F172A] border border-[#CBD5E1] hover:border-[#0F172A]'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Select plan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-0 sm:pt-3 bg-white/95 backdrop-blur sm:bg-transparent sm:static flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-white bg-gradient-to-b from-[#2A4FC4] to-[#1E3A8A] hover:to-[#172F73] shadow-[0_8px_20px_-8px_rgba(30,58,138,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-px w-full sm:w-auto justify-center text-sm font-medium py-3 sm:py-2.5 px-6 rounded-xl transition flex items-center gap-2"
              >
                <span>Continue</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: MEMBER DETAILS & GMAIL OTP (2-COLUMN NO-SCROLL LAYOUT) ================= */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 7 Columns: Form Input Fields */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] leading-tight">
                    Your details
                  </h2>
                  <p className="text-[11px] font-bold text-[#475569]">
                    Plan: <strong className="text-[#0F172A]">{selectedPackage.name}</strong> ({formatINR(selectedPackage.pricePaise)})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#1E3A8A] font-bold hover:underline"
                >
                  Change Plan
                </button>
              </div>

              {/* Full name */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Full name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aditya Varma"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formErrors.fullName) {
                      setFormErrors((prev) => ({ ...prev, fullName: '' }));
                    }
                  }}
                  className={`w-full bg-white border border-solid rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition ${
                    formErrors.fullName ? 'border-red-500 bg-red-50/20' : 'border-[#CBD5E1]'
                  }`}
                />
                {formErrors.fullName && (
                  <span className="text-[11px] text-red-600 mt-0.5 block font-bold">{formErrors.fullName}</span>
                )}
              </div>

              {/* Mobile Number with Flexbox-Centered +91 (100% Centered Vertically) */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Mobile number <span className="text-red-600">*</span>
                </label>
                <div
                  className={`flex items-center rounded-lg border border-solid bg-white overflow-hidden transition ${
                    formErrors.phone
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-[#CBD5E1] focus-within:border-[#1E3A8A] focus-within:ring-2 focus-within:ring-[#1E3A8A]/20'
                  }`}
                >
                  <div className="flex items-center justify-center px-3.5 py-2 bg-[#F8FAFC] border-r border-[#CBD5E1] text-xs sm:text-sm font-bold text-[#1E293B] select-none flex-shrink-0">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''));
                      if (formErrors.phone) {
                        setFormErrors((prev) => ({ ...prev, phone: '' }));
                      }
                    }}
                    className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none"
                  />
                </div>
                {formErrors.phone && (
                  <span className="text-[11px] text-red-600 mt-0.5 block font-bold">{formErrors.phone}</span>
                )}
              </div>

              {/* Email Address with Real-Time Gmail OTP Verification */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Email address <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    disabled={emailVerified}
                    placeholder="e.g. aditya@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) {
                        setFormErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`flex-1 bg-white border border-solid rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition ${
                      emailVerified
                        ? 'border-[#1E3A8A] bg-[#F5F8FF] text-[#0F172A]'
                        : formErrors.email
                        ? 'border-red-500 bg-red-50/20'
                        : 'border-[#CBD5E1]'
                    }`}
                  />
                  {!emailVerified ? (
                    <button
                      type="button"
                      disabled={otpSending || otpTimer > 0}
                      onClick={handleSendEmailOtp}
                      className="text-white bg-gradient-to-b from-[#2A4FC4] to-[#1E3A8A] hover:to-[#172F73] shadow-[0_8px_20px_-8px_rgba(30,58,138,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-px text-xs font-medium px-3.5 py-2 rounded-xl disabled:opacity-50 transition whitespace-nowrap"
                    >
                      {otpSending ? 'Sending...' : otpTimer > 0 ? `Resend (${otpTimer}s)` : otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  ) : (
                    <span className="bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D4F5] text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap">
                      <span>✓</span> Gmail Verified
                    </span>
                  )}
                </div>

                {formErrors.email && (
                  <span className="text-[11px] text-red-600 mt-0.5 block font-bold">{formErrors.email}</span>
                )}

                {/* OTP Input Block */}
                {otpSent && !emailVerified && (
                  <div className="mt-2 p-2.5 bg-[#F5F8FF] border border-[#1E3A8A]/40 rounded-lg">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-semibold text-[#1E3A8A]">
                        Enter the 6-digit code sent to {email}
                      </span>
                      {otpMessage && (
                        <span className="text-[#172F73] font-bold">{otpMessage}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-32 tracking-widest text-center font-mono font-semibold bg-white border border-solid border-[#CBD5E1] rounded-lg px-2 py-1.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
                      />
                      <button
                        type="button"
                        disabled={otpVerifying || otpCode.length !== 6}
                        onClick={handleVerifyEmailOtp}
                        className="text-white bg-gradient-to-b from-[#2A4FC4] to-[#1E3A8A] hover:to-[#172F73] shadow-[0_8px_20px_-8px_rgba(30,58,138,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-px text-xs font-medium px-3.5 py-1.5 rounded-xl disabled:opacity-50 transition"
                      >
                        {otpVerifying ? 'Verifying...' : 'Verify Gmail'}
                      </button>
                    </div>
                    {otpError && (
                      <span className="text-[11px] text-red-600 mt-1 block font-bold">{otpError}</span>
                    )}
                  </div>
                )}
                {formErrors.otp && (
                  <span className="text-[11px] text-red-600 mt-0.5 block font-bold">{formErrors.otp}</span>
                )}
              </div>

              {/* Preferred Slot & Start Date Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Preferred Time Slot <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value)}
                    className="w-full bg-white border border-solid border-[#CBD5E1] rounded-lg px-2.5 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#1E3A8A] transition"
                  >
                    {TIME_SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-solid border-[#CBD5E1] rounded-lg px-2.5 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#1E3A8A] transition"
                  />
                </div>
              </div>

              {/* Gender Preference & Terms Agreement */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                    Gender Preference
                  </label>
                  <div className="flex gap-3 text-xs font-semibold text-[#1E293B]">
                    {['Male', 'Female', 'Prefer not to say'].map((g) => (
                      <label key={g} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === g}
                          onChange={() => setGender(g)}
                          className="accent-[#1E3A8A] w-3.5 h-3.5"
                        />
                        <span className="text-[11px]">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-[11px] font-medium text-[#1E293B]">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 accent-[#1E3A8A] w-3.5 h-3.5 rounded flex-shrink-0"
                  />
                  <span>
                    I agree to the Vyomi Fitness Club membership code of conduct, health waiver, and biometric entry rules.
                  </span>
                </label>
                {formErrors.terms && (
                  <span className="text-[11px] text-red-600 mt-0.5 block font-bold">{formErrors.terms}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-[#475569] hover:text-[#0F172A] py-1.5 px-2 transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  className="text-white bg-gradient-to-b from-[#2A4FC4] to-[#1E3A8A] hover:to-[#172F73] shadow-[0_8px_20px_-8px_rgba(30,58,138,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-px text-xs sm:text-sm font-medium py-2 px-5 rounded-xl transition flex items-center gap-1.5"
                >
                  <span>Proceed to Payment</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Right 5 Columns: Live Interactive VIP Membership Card Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-[#F4F6FB] rounded-2xl p-3 border border-[#E3E8F2]">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-[0.14em]">
                    Card preview
                  </span>
                  
                </div>
                <VipMembershipCard
                  clientName={fullName || 'VALUED MEMBER'}
                  packageName={selectedPackage.name}
                  durationDays={selectedPackage.durationDays}
                  memberCode="VYO · 2026 · VIP"
                  endDate={projectedEndDate}
                />
                <div className="mt-3 p-3 bg-white border border-[#E3E8F2] rounded-xl text-[11px] text-[#64748B] space-y-1">
                  <div className="flex justify-between font-semibold text-sm text-[#0F172A]">
                    <span>{selectedPackage.name}</span>
                    <span className="text-[#0F172A]">{formatINR(selectedPackage.pricePaise)}</span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Biometric access at Sonovision Plaza, Patamata. 365 Days validity from start date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PAYMENT (STRICTLY 2 OPTIONS) ================= */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] leading-tight">
                  Select Payment Option
                </h2>
                <p className="text-[11px] font-bold text-[#475569]">
                  Payable for {selectedPackage.name}:{' '}
                  <strong className="text-sm font-semibold text-[#0F172A]">
                    {formatINR(selectedPackage.pricePaise)}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs text-[#1E3A8A] font-bold hover:underline"
              >
                Edit Info
              </button>
            </div>

            {/* Strictly Two Payment Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentOption('UPI')}
                className={`p-3 rounded-xl border border-solid text-left transition ${
                  paymentOption === 'UPI'
                    ? 'border-[#1E3A8A] bg-[#F5F8FF] ring-2 ring-[#1E3A8A]/30 shadow-sm'
                    : 'border-[#CBD5E1] bg-white hover:border-[#1E3A8A]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <UpiIconSvg className="w-6 h-3.5" />
                    <span className="text-xs font-semibold text-[#0F172A]">
                      Online Payment (UPI QR)
                    </span>
                  </div>
                  <span className="text-[11px] bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D4F5] font-medium px-1.5 py-0.5 rounded">
                    Instant
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#475569]">
                  Scan in PhonePe / GPay / Paytm. Amount locks automatically.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('CASH')}
                className={`p-3 rounded-xl border border-solid text-left transition ${
                  paymentOption === 'CASH'
                    ? 'border-[#1E3A8A] bg-[#F5F8FF] ring-2 ring-[#1E3A8A]/30 shadow-sm'
                    : 'border-[#CBD5E1] bg-white hover:border-[#1E3A8A]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Offline Cash (Front Desk)
                  </span>
                  <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-1.5 py-0.5 rounded">
                    Front Desk
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#475569]">
                  Reserve slot now and pay cash at Sonovision Plaza club desk.
                </p>
              </button>
            </div>

            {/* OPTION 1 CONTENT: Dynamic QR Code */}
            {paymentOption === 'UPI' && (
              <div className="p-3.5 sm:p-4 bg-[#F8FAFC] border border-solid border-[#CBD5E1] rounded-xl space-y-3">
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-[#1E3A8A] uppercase tracking-wider block">
                    Official Merchant Dynamic QR Code
                  </span>
                  <p className="text-[11px] font-bold text-[#475569]">
                    Payee: <strong className="text-[#0F172A]">VALLABHANENI</strong> (9666636563@axisbank)
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1">
                  {/* Dynamic QR Display */}
                  <div className="p-3 bg-white border border-solid border-[#CBD5E1] rounded-xl shadow-sm text-center flex-shrink-0">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Vyomi UPI QR Code"
                        className="w-40 h-40 sm:w-44 sm:h-44 mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center text-xs text-[#64748B] font-semibold">
                        Generating Dynamic QR...
                      </div>
                    )}
                    <span className="text-[11px] font-semibold text-[#0F172A] block mt-1.5 bg-[#F5F8FF] py-0.5 px-2 rounded border border-[#C7D4F5]">
                      Amount Locked: {formatINR(selectedPackage.pricePaise)}
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2 max-w-sm text-xs text-[#1E293B]">
                    <div className="p-3 bg-white border border-solid border-[#CBD5E1] rounded-xl space-y-1">
                      <p className="font-semibold text-[#0F172A] text-xs">How to pay:</p>
                      <p className="text-[11px]">1. Open PhonePe, Google Pay, or Paytm.</p>
                      <p className="text-[11px]">2. Scan this QR code.</p>
                      <p className="text-[#1E3A8A] font-bold text-[11px]">
                        3. The amount of {formatINR(selectedPackage.pricePaise)} locks automatically in your UPI app.
                      </p>
                      <p className="text-[11px]">4. Complete payment and enter the 12-digit UTR reference below.</p>
                    </div>

                    {upiIntentUri && (
                      <a
                        href={upiIntentUri}
                        className="sm:hidden block w-full py-2 bg-[#0F172A] text-white text-center rounded-lg font-bold text-xs shadow-sm"
                      >
                        Tap to Pay directly via UPI App
                      </a>
                    )}
                  </div>
                </div>

                {/* UTR Input */}
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Enter 12-digit UPI / UTR Transaction ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 432109876543 (from PhonePe / GPay receipt)"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.trim())}
                    className="w-full bg-white border border-solid border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-bold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E3A8A]"
                  />
                  <span className="text-[11px] font-medium text-[#475569] mt-0.5 block">
                    Your enrollment will be verified against this transaction reference.
                  </span>
                </div>
              </div>
            )}

            {/* OPTION 2 CONTENT: Offline Cash */}
            {paymentOption === 'CASH' && (
              <div className="p-4 bg-white border border-solid border-[#CBD5E1] rounded-xl space-y-2.5 text-xs text-[#1E293B]">
                <h4 className="font-semibold text-sm text-[#0F172A]">
                  Pay Cash at Club Front Desk
                </h4>
                <p className="font-medium text-[#475569]">
                  You can register now to reserve your membership slot and preferred training hours.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 space-y-1">
                  <p className="font-semibold text-xs">Desk Payment Note:</p>
                  <p className="font-medium text-[11px]">
                    Amount of <strong className="font-semibold">{formatINR(selectedPackage.pricePaise)}</strong> will be collected in cash at the Vyomi Fitness Club front desk (Sonovision Plaza, Patamata) prior to collecting your biometric wristband.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-bold text-[#475569] hover:text-[#0F172A] py-1.5 px-2 transition"
              >
                ← Back to Intake
              </button>
              <button
                type="button"
                disabled={submittingPayment}
                onClick={handleCompleteRegistration}
                className="text-white bg-gradient-to-b from-[#2A4FC4] to-[#1E3A8A] hover:to-[#172F73] shadow-[0_8px_20px_-8px_rgba(30,58,138,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-px text-xs sm:text-sm font-medium py-2 px-6 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {submittingPayment ? (
                  <span>Processing Enrollment...</span>
                ) : (
                  <>
                    <span>
                      {paymentOption === 'UPI' ? 'Verify & Confirm Enrollment' : 'Confirm Cash Enrollment'}
                    </span>
                    <span>✓</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: CONFIRMATION & PDF RECEIPT ================= */}
        {currentStep === 4 && confirmationData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center py-1">
            {/* Card */}
            <div className="order-2 lg:order-1 w-full max-w-md mx-auto">
              <VipMembershipCard
                clientName={confirmationData.fullName}
                packageName={confirmationData.packageName}
                durationDays={confirmationData.durationDays}
                memberCode={confirmationData.memberCode}
                endDate={confirmationData.endDate}
              />
            </div>

            {/* Details + actions */}
            <div className="order-1 lg:order-2 space-y-5 text-center lg:text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#1E3A8A] bg-[#EEF2FF] border border-[#C7D4F5] px-2.5 py-1 rounded-full">
                  <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
                  {confirmationData.paymentMethod === 'UPI' ? 'Membership active' : 'Reserved · pay at front desk'}
                </span>
                <h2 className="text-2xl sm:text-[28px] font-semibold text-[#0F172A] mt-3 tracking-tight">
                  Welcome to Vyomi, {String(confirmationData.fullName || '').split(' ')[0]}.
                </h2>
                <p className="text-sm text-[#64748B] mt-1.5 max-w-md mx-auto lg:mx-0">
                  {confirmationData.paymentMethod === 'UPI'
                    ? 'Your membership is confirmed. Show your member ID at the front desk to collect your access band.'
                    : `Your spot is reserved. Pay ${formatINR(confirmationData.totalAmount * 100)} in cash at the front desk to activate it.`}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-left rounded-2xl border border-[#E3E8F2] bg-[#F8FAFE] p-4 sm:p-5">
                {[
                  ['Member ID', confirmationData.memberCode, true],
                  ['Plan', confirmationData.packageName, false],
                  ['Amount', formatINR(confirmationData.totalAmount * 100), false],
                  ['Valid until', confirmationData.endDate || '1 year from start', false],
                  ['Phone', `+91 ${confirmationData.phone}`, false],
                  ['Time slot', confirmationData.preferredSlot, false],
                ].map(([label, value, mono]) => (
                  <div key={String(label)} className="min-w-0">
                    <dt className="text-[11px] text-[#64748B]">{label}</dt>
                    <dd className={`text-sm text-[#0F172A] font-medium mt-0.5 truncate ${mono ? 'font-mono tracking-wide text-[#1E3A8A]' : ''}`}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col sm:flex-row gap-2.5 justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-medium transition text-white bg-gradient-to-b from-[#2A4FC4] to-[#1E3A8A] hover:to-[#172F73] shadow-[0_8px_20px_-8px_rgba(30,58,138,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-px"
                >
                  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3v10m0 0l-4-4m4 4l4-4M4 16h12" /></svg>
                  Download receipt
                </button>
                <button
                  type="button"
                  disabled={emailSending}
                  onClick={handleSendEmailReceipt}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-medium text-[#1E3A8A] bg-white border border-[#C7D4F5] hover:border-[#1E3A8A] hover:bg-[#F5F8FF] transition disabled:opacity-60"
                >
                  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="14" height="10" rx="2" /><path d="M3.5 6l6.5 5 6.5-5" /></svg>
                  {emailSending ? 'Sending…' : 'Email receipt'}
                </button>
              </div>

              {emailStatus && <p className="text-xs text-[#475569]">{emailStatus}</p>}

              <button
                type="button"
                onClick={() => {
                  setConfirmationData(null);
                  setFullName('');
                  setPhone('');
                  setEmail('');
                  setEmailVerified(false);
                  setOtpSent(false);
                  setOtpCode('');
                  setUtrNumber('');
                  setAcceptedTerms(false);
                  setPaymentOption('UPI');
                  setEmailStatus('');
                  setCurrentStep(1);
                }}
                className="text-sm text-[#64748B] hover:text-[#1E3A8A] transition"
              >
                ← Back to Membership Registration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-bold text-[#334155]">
          Loading Vyomi Membership Intake...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
