'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SUPPLIED } from '@/config/assets';
import { generateUpiString, generateQrDataUrl } from '@/lib/qr';
import { generatePdfReceipt } from '@/lib/pdfReceipt';
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

  // Package state
  const [packages, setPackages] = useState<PackageItem[]>(OFFICIAL_PACKAGES);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('pkg-vip-1y');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [preferredSlot, setPreferredSlot] = useState(TIME_SLOTS[0]);
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [acceptedTerms, setAcceptedTerms] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] py-2 sm:py-3 px-3 sm:px-6 flex flex-col justify-between">
      {/* Top Brand Bar - Clean Standalone Portal */}
      <div className="max-w-5xl mx-auto w-full mb-2 sm:mb-2.5 flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
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
            <span className="text-sm sm:text-base font-black tracking-[0.22em] text-[#0F172A] uppercase leading-none">
              Vyomi
            </span>
            <span className="text-[8px] sm:text-[9px] font-extrabold tracking-[0.3em] text-[#D97706] uppercase mt-1 leading-none">
              Fitness Club
            </span>
          </div>
        </Link>
        <div className="text-right">
          <span className="text-[10px] font-extrabold tracking-widest text-[#D97706] uppercase block">
            Patamata, Vijayawada
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-[#334155]">Official Membership Intake</span>
        </div>
      </div>

      {/* Main Container - High Contrast Luxury White Card on Slate Foundation */}
      <div className="max-w-5xl mx-auto w-full bg-white border border-[#CBD5E1] rounded-2xl shadow-sm p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
        {/* Progress Step Header */}
        <div className="mb-3 sm:mb-4">
          {/* Mobile Step Badge */}
          <div className="flex sm:hidden items-center justify-between text-xs mb-1.5">
            <span className="font-extrabold text-[#0F172A]">
              Step {currentStep} of 4: {['Select Plan', 'Member Intake & Email OTP', 'Payment (2 Options)', 'Confirmation'][currentStep - 1]}
            </span>
            <span className="text-[#D97706] font-mono font-bold">
              {Math.round((currentStep / 4) * 100)}%
            </span>
          </div>

          {/* Desktop step labels with SVGs */}
          <div className="hidden sm:flex items-center justify-between text-xs font-bold text-[#475569] mb-2">
            <span className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-[#D97706]' : 'text-[#64748B]'}`}>
              <StepTierIcon className="w-4 h-4" />
              <span>1. Select Plan</span>
            </span>
            <span className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-[#D97706]' : 'text-[#64748B]'}`}>
              <StepIdIcon className="w-4 h-4" />
              <span>2. Member Intake & Gmail OTP</span>
            </span>
            <span className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-[#D97706]' : 'text-[#64748B]'}`}>
              <StepPaymentIcon className="w-4 h-4" />
              <span>3. Payment (2 Options)</span>
            </span>
            <span className={`flex items-center gap-1.5 ${currentStep === 4 ? 'text-[#D97706]' : 'text-[#64748B]'}`}>
              <SecurityLockBadge className="w-4 h-4" />
              <span>4. Confirmation</span>
            </span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D97706] to-[#FFB100] transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="mb-3 p-2.5 bg-red-50 border-2 border-red-300 rounded-xl text-xs text-red-900 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            <span>{generalError}</span>
          </div>
        )}

        {/* ================= STEP 1: SELECT PLAN ================= */}
        {currentStep === 1 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <h1 className="text-base sm:text-xl font-black text-[#0F172A] tracking-tight">
                Select Your Membership Plan
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-[#475569] mt-0.5">
                Authentic 1-year access privileges at Sonovision Plaza, Patamata, Vijayawada
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {packages.map((pkg) => {
                const isSelected = selectedPkgId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`relative cursor-pointer rounded-xl p-3.5 sm:p-4 border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#D97706] bg-[#FFFBEB] ring-2 ring-[#D97706]/40 shadow-sm'
                        : 'border-[#CBD5E1] hover:border-[#D97706]/70 bg-white'
                    }`}
                  >
                    {pkg.isFeatured && (
                      <span className="absolute -top-2.5 right-3 bg-[#D97706] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
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
                          <span className="text-[10px] font-extrabold text-[#475569] uppercase tracking-wider">
                            1 Year
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-[#D97706] bg-[#D97706]'
                              : 'border-[#94A3B8]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] mt-2">
                        {pkg.name}
                      </h3>

                      <div className="mt-1.5">
                        <span className="text-xl sm:text-2xl font-black text-[#0F172A]">
                          {formatINR(pkg.pricePaise)}
                        </span>
                        {pkg.originalPricePaise && (
                          <span className="text-xs text-[#64748B] line-through ml-1.5 font-bold">
                            {formatINR(pkg.originalPricePaise)}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-[#64748B] block mt-0.5">
                          Annual All-Inclusive Fee
                        </span>
                      </div>

                      <ul className="mt-2.5 space-y-1 text-xs text-[#1E293B]">
                        {pkg.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#D97706] font-extrabold text-[11px] mt-0.5">✓</span>
                            <span className="font-semibold text-[11px] sm:text-xs leading-tight">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#E2E8F0]">
                      <button
                        type="button"
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                          isSelected
                            ? 'bg-[#0F172A] text-white shadow-sm'
                            : 'bg-[#F1F5F9] text-[#1E293B] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        {isSelected ? 'Selected Plan' : 'Choose Plan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 sm:pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-bold py-2 px-6 rounded-lg transition flex items-center gap-2 shadow-md"
              >
                <span>Continue to Member Intake</span>
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
                  <h2 className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">
                    Personal & Membership Particulars
                  </h2>
                  <p className="text-[11px] font-bold text-[#475569]">
                    Plan: <strong className="text-[#0F172A]">{selectedPackage.name}</strong> ({formatINR(selectedPackage.pricePaise)})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#D97706] font-bold hover:underline"
                >
                  Change Plan
                </button>
              </div>

              {/* Full Legal Name */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Full Legal Name <span className="text-red-600">*</span>
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
                  className={`w-full bg-white border-2 border-solid rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition ${
                    formErrors.fullName ? 'border-red-500 bg-red-50/20' : 'border-[#94A3B8]'
                  }`}
                />
                {formErrors.fullName && (
                  <span className="text-[10px] text-red-600 mt-0.5 block font-bold">{formErrors.fullName}</span>
                )}
              </div>

              {/* Mobile Number with Flexbox-Centered +91 (100% Centered Vertically) */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Mobile Number (Contact & Biometrics) <span className="text-red-600">*</span>
                </label>
                <div
                  className={`flex items-center rounded-lg border-2 border-solid bg-white overflow-hidden transition ${
                    formErrors.phone
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-[#94A3B8] focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-[#D97706]/20'
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
                  <span className="text-[10px] text-red-600 mt-0.5 block font-bold">{formErrors.phone}</span>
                )}
              </div>

              {/* Email Address with Real-Time Gmail OTP Verification */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Gmail / Email Address (Real-Time OTP Verification) <span className="text-red-600">*</span>
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
                    className={`flex-1 bg-white border-2 border-solid rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition ${
                      emailVerified
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-bold'
                        : formErrors.email
                        ? 'border-red-500 bg-red-50/20'
                        : 'border-[#94A3B8]'
                    }`}
                  />
                  {!emailVerified ? (
                    <button
                      type="button"
                      disabled={otpSending || otpTimer > 0}
                      onClick={handleSendEmailOtp}
                      className="bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold px-3.5 py-2 rounded-lg disabled:opacity-50 transition whitespace-nowrap shadow-sm"
                    >
                      {otpSending ? 'Sending...' : otpTimer > 0 ? `Resend (${otpTimer}s)` : otpSent ? 'Resend' : 'Send Gmail OTP'}
                    </button>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap">
                      <span>✓</span> Gmail Verified
                    </span>
                  )}
                </div>

                {formErrors.email && (
                  <span className="text-[10px] text-red-600 mt-0.5 block font-bold">{formErrors.email}</span>
                )}

                {/* OTP Input Block */}
                {otpSent && !emailVerified && (
                  <div className="mt-2 p-2.5 bg-[#FFFBEB] border border-[#D97706]/40 rounded-lg">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-extrabold text-[#92400E]">
                        Enter 6-digit code sent to Gmail:
                      </span>
                      {otpMessage && (
                        <span className="text-[#B45309] font-bold">{otpMessage}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-32 tracking-widest text-center font-mono font-black bg-white border-2 border-solid border-[#94A3B8] rounded-lg px-2 py-1.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                      />
                      <button
                        type="button"
                        disabled={otpVerifying || otpCode.length !== 6}
                        onClick={handleVerifyEmailOtp}
                        className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg disabled:opacity-50 transition shadow-sm"
                      >
                        {otpVerifying ? 'Verifying...' : 'Verify Gmail'}
                      </button>
                    </div>
                    {otpError && (
                      <span className="text-[10px] text-red-600 mt-1 block font-bold">{otpError}</span>
                    )}
                  </div>
                )}
                {formErrors.otp && (
                  <span className="text-[10px] text-red-600 mt-0.5 block font-bold">{formErrors.otp}</span>
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
                    className="w-full bg-white border-2 border-solid border-[#94A3B8] rounded-lg px-2.5 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706] transition"
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
                    className="w-full bg-white border-2 border-solid border-[#94A3B8] rounded-lg px-2.5 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706] transition"
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
                          className="accent-[#D97706] w-3.5 h-3.5"
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
                    className="mt-0.5 accent-[#D97706] w-3.5 h-3.5 rounded flex-shrink-0"
                  />
                  <span>
                    I agree to the Vyomi Fitness Club membership code of conduct, health waiver, and biometric entry rules.
                  </span>
                </label>
                {formErrors.terms && (
                  <span className="text-[10px] text-red-600 mt-0.5 block font-bold">{formErrors.terms}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-[#475569] hover:text-[#0F172A] py-1.5 px-2 transition"
                >
                  ← Back to Plans
                </button>
                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-bold py-2 px-5 rounded-lg transition flex items-center gap-1.5 shadow-md"
                >
                  <span>Proceed to Payment</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Right 5 Columns: Live Interactive VIP Membership Card Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-[#0F172A] rounded-2xl p-3 border border-[#CBD5E1] shadow-md">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    Live Membership Card
                  </span>
                  <span className="text-[9px] text-white/60 font-mono">Updates in Real-Time</span>
                </div>
                <VipMembershipCard
                  clientName={fullName || 'VALUED MEMBER'}
                  packageName={selectedPackage.name}
                  durationDays={selectedPackage.durationDays}
                  memberCode="VYO · 2026 · VIP"
                  endDate={projectedEndDate}
                />
                <div className="mt-3 p-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] text-white/80 space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>{selectedPackage.name}</span>
                    <span className="text-[#F59E0B] font-mono">{formatINR(selectedPackage.pricePaise)}</span>
                  </div>
                  <p className="text-[10px] text-white/60">
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
                <h2 className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">
                  Select Payment Option
                </h2>
                <p className="text-[11px] font-bold text-[#475569]">
                  Payable for {selectedPackage.name}:{' '}
                  <strong className="text-sm font-black text-[#0F172A]">
                    {formatINR(selectedPackage.pricePaise)}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs text-[#D97706] font-bold hover:underline"
              >
                Edit Info
              </button>
            </div>

            {/* Strictly Two Payment Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentOption('UPI')}
                className={`p-3 rounded-xl border-2 border-solid text-left transition ${
                  paymentOption === 'UPI'
                    ? 'border-[#D97706] bg-[#FFFBEB] ring-2 ring-[#D97706]/30 shadow-sm'
                    : 'border-[#CBD5E1] bg-white hover:border-[#D97706]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <UpiIconSvg className="w-6 h-3.5" />
                    <span className="text-xs font-extrabold text-[#0F172A]">
                      Online Payment (UPI QR)
                    </span>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-1.5 py-0.5 rounded">
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
                className={`p-3 rounded-xl border-2 border-solid text-left transition ${
                  paymentOption === 'CASH'
                    ? 'border-[#D97706] bg-[#FFFBEB] ring-2 ring-[#D97706]/30 shadow-sm'
                    : 'border-[#CBD5E1] bg-white hover:border-[#D97706]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-[#0F172A]">
                    Offline Cash (Front Desk)
                  </span>
                  <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.5 rounded">
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
              <div className="p-3.5 sm:p-4 bg-[#F8FAFC] border-2 border-solid border-[#CBD5E1] rounded-xl space-y-3">
                <div className="text-center">
                  <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
                    Official Merchant Dynamic QR Code
                  </span>
                  <p className="text-[11px] font-bold text-[#475569]">
                    Payee: <strong className="text-[#0F172A]">VALLABHANENI</strong> (9666636563@axisbank)
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1">
                  {/* Dynamic QR Display */}
                  <div className="p-3 bg-white border-2 border-solid border-[#CBD5E1] rounded-xl shadow-sm text-center flex-shrink-0">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Vyomi UPI QR Code"
                        className="w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-xs text-[#64748B] font-semibold">
                        Generating Dynamic QR...
                      </div>
                    )}
                    <span className="text-[11px] font-black text-[#0F172A] block mt-1.5 bg-[#FFFBEB] py-0.5 px-2 rounded border border-[#FDE68A]">
                      Amount Locked: {formatINR(selectedPackage.pricePaise)}
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2 max-w-sm text-xs text-[#1E293B]">
                    <div className="p-3 bg-white border-2 border-solid border-[#CBD5E1] rounded-xl space-y-1">
                      <p className="font-extrabold text-[#0F172A] text-xs">How to pay:</p>
                      <p className="text-[11px]">1. Open PhonePe, Google Pay, or Paytm.</p>
                      <p className="text-[11px]">2. Scan this QR code.</p>
                      <p className="text-[#D97706] font-bold text-[11px]">
                        3. The amount of {formatINR(selectedPackage.pricePaise)} locks automatically in your UPI app.
                      </p>
                      <p className="text-[11px]">4. Complete payment and enter the 12-digit UTR reference below.</p>
                    </div>

                    {upiIntentUri && (
                      <a
                        href={upiIntentUri}
                        className="sm:hidden block w-full py-2 bg-[#0F172A] text-white text-center rounded-lg font-bold text-xs shadow-md"
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
                    className="w-full bg-white border-2 border-solid border-[#94A3B8] rounded-lg px-3 py-2 text-xs font-bold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D97706]"
                  />
                  <span className="text-[10px] font-medium text-[#475569] mt-0.5 block">
                    Your enrollment will be verified against this transaction reference.
                  </span>
                </div>
              </div>
            )}

            {/* OPTION 2 CONTENT: Offline Cash */}
            {paymentOption === 'CASH' && (
              <div className="p-4 bg-white border-2 border-solid border-[#CBD5E1] rounded-xl space-y-2.5 text-xs text-[#1E293B]">
                <h4 className="font-extrabold text-sm text-[#0F172A]">
                  Pay Cash at Club Front Desk
                </h4>
                <p className="font-medium text-[#475569]">
                  You can register now to reserve your membership slot and preferred training hours.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 space-y-1">
                  <p className="font-extrabold text-xs">Desk Payment Note:</p>
                  <p className="font-medium text-[11px]">
                    Amount of <strong className="font-extrabold">{formatINR(selectedPackage.pricePaise)}</strong> will be collected in cash at the Vyomi Fitness Club front desk (Sonovision Plaza, Patamata) prior to collecting your biometric wristband.
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
                className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-bold py-2 px-6 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50 shadow-md"
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
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-800 text-xl font-black">
              ✓
            </div>

            <div>
              <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
                {confirmationData.paymentMethod === 'UPI' ? 'Enrollment Confirmed & Activated' : 'Reserved · Pending Front Desk Cash'}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] mt-0.5">
                Welcome to Vyomi Fitness Club
              </h2>
              <p className="text-[11px] font-bold text-[#475569] mt-0.5">
                Your luxury club membership records have been committed to Supabase.
              </p>
            </div>

            {/* Official VIP Card Display */}
            <div className="my-2 max-w-sm mx-auto">
              <VipMembershipCard
                clientName={confirmationData.fullName}
                packageName={confirmationData.packageName}
                durationDays={confirmationData.durationDays}
                memberCode={confirmationData.memberCode}
                endDate={confirmationData.endDate}
              />
            </div>

            {/* Member Identification Card */}
            <div className="max-w-md mx-auto p-4 bg-white border-2 border-solid border-[#CBD5E1] rounded-xl text-left space-y-2 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
                <span className="text-[10px] font-extrabold text-[#475569] uppercase">
                  Official Member Code
                </span>
                <span className="font-mono text-sm font-black text-[#0F172A]">
                  {confirmationData.memberCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div>
                  <span className="text-[#64748B] text-[10px] font-medium block">Member Name:</span>
                  <span className="font-bold text-[#0F172A]">{confirmationData.fullName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] font-medium block">Phone:</span>
                  <span className="font-bold text-[#0F172A]">+91 {confirmationData.phone}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] font-medium block">Tier:</span>
                  <span className="font-bold text-[#0F172A]">{confirmationData.packageName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] font-medium block">Total Amount:</span>
                  <span className="font-black text-[#0F172A]">{formatINR(confirmationData.totalAmount * 100)}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] font-medium block">Plan Validity:</span>
                  <span className="font-bold text-[#D97706]">365 Days (1 Year)</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] font-medium block">Time Slot:</span>
                  <span className="font-bold text-[#0F172A]">{confirmationData.preferredSlot}</span>
                </div>
              </div>
            </div>

            {/* PDF Receipt & Email Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold py-2 px-5 rounded-lg transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>📥 Download PDF Payment Receipt</span>
              </button>

              <button
                type="button"
                disabled={emailSending}
                onClick={handleSendEmailReceipt}
                className="w-full sm:w-auto bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>✉️ {emailSending ? 'Sending to Gmail...' : 'Email Receipt to Gmail'}</span>
              </button>
            </div>

            {emailStatus && (
              <p className="text-xs text-[#D97706] font-bold">{emailStatus}</p>
            )}

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setConfirmationData(null);
                  setCurrentStep(1);
                  setFullName('');
                  setPhone('');
                  setEmail('');
                  setEmailVerified(false);
                  setOtpSent(false);
                  setOtpCode('');
                  setUtrNumber('');
                  setPaymentOption('UPI');
                  router.push('/register');
                }}
                className="w-full sm:w-auto px-6 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>← Back to Home</span>
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
