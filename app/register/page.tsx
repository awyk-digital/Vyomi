'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SUPPLIED } from '@/config/assets';
import { generateUpiString, generateQrDataUrl } from '@/lib/qr';
import { generatePdfReceipt } from '@/lib/pdfReceipt';
import {
  SilverTierBadge,
  GoldTierBadge,
  DiamondTierBadge,
  StepTierIcon,
  StepIdIcon,
  StepPaymentIcon,
  SecurityLockBadge,
  UpiIconSvg,
  VipMembershipCard,
} from '@/components/LuxuryIcons';

interface Package {
  id: string;
  name: string;
  slug: string;
  durationDays: number;
  pricePaise: number;
  originalPricePaise?: number;
  benefits: string[];
  isFeatured?: boolean;
}

const PACKAGES: Package[] = [
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
    benefits: [
      '1 Year Full Gym Access',
      'Limited Recovery & Wellness Suite',
      'Finnish Cedar Sauna & Steam Access',
      'Bi-monthly Body Composition Telemetry',
    ],
    isFeatured: true,
  },
  {
    id: 'pkg-vvip-1y',
    name: 'VVIP Membership',
    slug: 'vvip',
    durationDays: 365,
    pricePaise: 6000000, // ₹60,000
    benefits: [
      '1 Year Full Gym Access',
      'Unlimited Recovery & Wellness Suite',
      'Zumba & Group Fitness Unlimited',
      'Dedicated Locker & VIP Concierge',
    ],
  },
];

const TIME_SLOTS = [
  '06:00 AM – 09:00 AM (Morning Prime)',
  '09:00 AM – 12:00 PM (Midday)',
  '12:00 PM – 04:00 PM (Afternoon)',
  '04:00 PM – 07:00 PM (Evening Prime)',
  '07:00 PM – 10:00 PM (Night Rush)',
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

  // Wizard Steps (1: Plan, 2: Member Details & Gmail OTP, 3: Payment, 4: Confirmation)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Packages state (strictly 3 authentic packages)
  const [packages, setPackages] = useState<Package[]>(PACKAGES);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('pkg-vip-1y');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredSlot, setPreferredSlot] = useState(TIME_SLOTS[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [gender, setGender] = useState('Male');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Gmail OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  // Payment Options (Strictly 2 options: Dynamic UPI QR or Offline Cash)
  const [paymentOption, setPaymentOption] = useState<'UPI' | 'CASH'>('UPI');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [upiIntentUri, setUpiIntentUri] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Confirmation Record
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

  // PDF & Email Status
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  // Sync official packages from API
  useEffect(() => {
    fetch('/api/v1/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.packages && data.packages.length > 0) {
          const valid = data.packages.filter((p: Package) =>
            p.id === 'pkg-founding-1y' || p.id === 'pkg-vip-1y' || p.id === 'pkg-vvip-1y'
          );
          if (valid.length > 0) setPackages(valid);
        }
      })
      .catch(() => {});
  }, []);

  const selectedPackage = useMemo(() => {
    return packages.find((p) => p.id === selectedPkgId) || packages[0];
  }, [packages, selectedPkgId]);

  // Projected Membership Expiry Date (365 days from start)
  const projectedEndDate = useMemo(() => {
    const s = new Date(startDate || Date.now());
    s.setDate(s.getDate() + (selectedPackage?.durationDays || 365));
    return s.toISOString().split('T')[0];
  }, [startDate, selectedPackage]);

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Generate dynamic QR code whenever selected package or step changes
  useEffect(() => {
    if (currentStep === 3 && paymentOption === 'UPI' && selectedPackage) {
      const price = selectedPackage.pricePaise / 100;
      const upiUri = generateUpiString({
        vpa: '9666636563@axisbank',
        payeeName: 'VALLABHANENI',
        amountInr: price,
        transactionNote: `Vyomi ${selectedPackage.name}`,
      });
      setUpiIntentUri(upiUri);
      generateQrDataUrl(upiUri).then(setQrDataUrl);
    }
  }, [currentStep, paymentOption, selectedPackage]);

  // Send real-time OTP to user's Gmail
  const handleSendEmailOtp = async () => {
    setOtpError('');
    setOtpMessage('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormErrors((prev) => ({ ...prev, email: 'Please enter a valid email address first.' }));
      return;
    }

    setOtpSending(true);
    try {
      const res = await fetch('/api/v1/auth/email-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), clientName: fullName || 'Valued Member' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error?.message || 'Failed to send OTP to Gmail.');
      } else {
        setOtpSent(true);
        setOtpTimer(60);
        setOtpMessage(`Verification code sent to ${email}`);
      }
    } catch {
      setOtpError('Failed to dispatch OTP. Please check your internet connection.');
    } finally {
      setOtpSending(false);
    }
  };

  // Verify real-time OTP from Gmail
  const handleVerifyEmailOtp = async () => {
    setOtpError('');
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await fetch('/api/v1/auth/email-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error?.message || 'Invalid or expired OTP code.');
      } else {
        setEmailVerified(true);
        setOtpMessage('✓ Gmail address successfully verified!');
        setFormErrors((prev) => ({ ...prev, email: '', otp: '' }));
      }
    } catch {
      setOtpError('Failed to verify OTP code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Step 2 -> Step 3 Validation
  const handleContinueToPayment = () => {
    const errors: Record<string, string> = {};

    if (!fullName || fullName.trim().length < 3 || fullName.trim().split(/\s+/).length < 2) {
      errors.fullName = 'Full legal name requires first and last name (e.g. Rajesh Kumar).';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Valid 10-digit Indian mobile number required (starting with 6-9).';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email address required.';
    } else if (!emailVerified) {
      errors.email = 'Please verify your Gmail with the 6-digit OTP code before proceeding.';
    }

    if (!acceptedTerms) {
      errors.terms = 'You must accept the club code of conduct and health waiver.';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

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

  // Download PDF Payment Receipt Client-Side
  const handleDownloadPdf = () => {
    if (!confirmationData) return;
    const doc = generatePdfReceipt({
      receiptNumber: `REC-2026-${confirmationData.memberCode.slice(-5)}`,
      reference: confirmationData.reference,
      memberCode: confirmationData.memberCode,
      clientName: confirmationData.fullName,
      phone: confirmationData.phone,
      email: confirmationData.email,
      packageName: confirmationData.packageName,
      durationDays: confirmationData.durationDays,
      timeSlot: confirmationData.preferredSlot,
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between py-2 sm:py-3 px-3 sm:px-6">
      {/* Top Brand Bar - Prominently Enlarged Logo, Removed Top-Right Location Details */}
      <div className="max-w-7xl w-full mx-auto mb-2 flex items-center justify-center border-b border-[#E2E8F0] pb-2 shrink-0">
        <Link href="/register" className="flex items-center gap-3">
          <Image
            src={SUPPLIED.logo.src}
            alt="Vyomi Fitness Club"
            width={280}
            height={80}
            unoptimized
            priority
            className="h-14 sm:h-16 md:h-18 w-auto brightness-95 transition-all"
          />
        </Link>
      </div>

      {/* Main Container - High Contrast Luxury White Card with Generous Width for No-Scroll View */}
      <div className="max-w-7xl w-full mx-auto bg-white border border-[#CBD5E1] rounded-2xl shadow-sm p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-y-auto lg:overflow-visible">
        {/* Progress Step Header */}
        <div className="mb-3 shrink-0">
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
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D97706] to-[#FFB100] transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="mb-3 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-xs text-red-900 font-bold flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            <span>{generalError}</span>
          </div>
        )}

        {/* ================= STEP 1: SELECT PLAN (WIDE CARDS & NO-SCROLL) ================= */}
        {currentStep === 1 && (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="text-center shrink-0">
              <h1 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
                Select Your Annual Membership Tier
              </h1>
              <p className="text-xs font-semibold text-[#475569] mt-0.5">
                Authentic 1-year access privileges at Sonovision Plaza, Patamata
              </p>
            </div>

            {/* Generous Width 3-Column Plan Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-1">
              {packages.map((pkg) => {
                const isSelected = selectedPkgId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`relative cursor-pointer rounded-xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#D97706] bg-[#FFFBEB] ring-2 ring-[#D97706]/40 shadow-sm'
                        : 'border-[#CBD5E1] hover:border-[#D97706]/70 bg-white'
                    }`}
                  >
                    {pkg.isFeatured && (
                      <span className="absolute -top-3 right-4 bg-[#D97706] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                        Most Popular
                      </span>
                    )}

                    <div>
                      {/* Top Row: SVG Tier Emblem + Radio */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {pkg.slug === 'founding' && <SilverTierBadge className="w-6 h-6" />}
                          {pkg.slug === 'vip' && <GoldTierBadge className="w-6 h-6" />}
                          {pkg.slug === 'vvip' && <DiamondTierBadge className="w-6 h-6" />}
                          <span className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider">
                            1 Year Access
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-[#D97706] bg-[#D97706]'
                              : 'border-[#94A3B8]'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-[#0F172A] mt-2">
                        {pkg.name}
                      </h3>

                      <div className="mt-2">
                        <span className="text-2xl font-black text-[#0F172A]">
                          {formatINR(pkg.pricePaise)}
                        </span>
                        <span className="text-[11px] font-bold text-[#475569] block mt-0.5">
                          Annual All-Inclusive Fee
                        </span>
                      </div>

                      <ul className="mt-3 space-y-1.5 text-xs text-[#1E293B]">
                        {pkg.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#D97706] font-extrabold mt-0.5">✓</span>
                            <span className="font-semibold">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                      <button
                        type="button"
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition ${
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

            <div className="flex justify-end pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-lg transition flex items-center gap-2 shadow-md"
              >
                <span>Continue to Member Intake</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: MEMBER DETAILS & GMAIL OTP (SIDE-BY-SIDE NO-SCROLL) ================= */}
        {currentStep === 2 && (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
                  Personal & Membership Particulars
                </h2>
                <p className="text-xs font-bold text-[#475569]">
                  Tier Selected: <strong className="text-[#0F172A]">{selectedPackage.name}</strong> ({formatINR(selectedPackage.pricePaise)})
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

            {/* Side-by-Side Grid: Left VIP Card Preview, Right Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center py-1">
              {/* Left Column (5 cols): Live VIP Card Preview */}
              <div className="lg:col-span-5 space-y-2.5">
                <div className="text-center">
                  <span className="text-[10px] font-extrabold text-[#D97706] uppercase tracking-wider block">
                    Live VIP Membership Card Preview
                  </span>
                </div>
                <div className="max-w-sm mx-auto w-full">
                  <VipMembershipCard
                    clientName={fullName || 'VALUED MEMBER'}
                    packageName={selectedPackage.name}
                    durationDays={selectedPackage.durationDays}
                    memberCode="VYO · 2026 · VIP"
                    endDate={projectedEndDate}
                  />
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-center">
                  <span className="text-[11px] font-bold text-[#475569] block">Reserved Tier & Amount:</span>
                  <span className="text-xs font-black text-[#0F172A]">{selectedPackage.name} · {formatINR(selectedPackage.pricePaise)}</span>
                </div>
              </div>

              {/* Right Column (7 cols): Compact Input Fields */}
              <div className="lg:col-span-7 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Full Legal Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Full Legal Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      className={`w-full bg-white border-2 border-solid rounded-lg px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#D97706] ${
                        formErrors.fullName ? 'border-red-500 bg-red-50/20' : 'border-[#94A3B8]'
                      }`}
                    />
                    {formErrors.fullName && (
                      <span className="text-[10px] text-red-600 mt-0.5 block font-bold">{formErrors.fullName}</span>
                    )}
                  </div>

                  {/* Mobile Number with perfectly centered +91 prefix */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Mobile Number <span className="text-red-600">*</span>
                    </label>
                    <div
                      className={`flex items-center bg-white border-2 border-solid rounded-lg overflow-hidden transition focus-within:border-[#D97706] ${
                        formErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-[#94A3B8]'
                      }`}
                    >
                      <span className="flex items-center pl-3.5 pr-1.5 text-xs text-[#334155] font-bold select-none whitespace-nowrap">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, ''));
                          if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: '' }));
                        }}
                        className="w-full py-2 pr-3 pl-1 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] bg-transparent focus:outline-none"
                      />
                    </div>
                    {formErrors.phone && (
                      <span className="text-[10px] text-red-600 mt-0.5 block font-bold">{formErrors.phone}</span>
                    )}
                  </div>

                  {/* Email Address & Dynamic OTP Verification */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Email Address (Any Email / Gmail) <span className="text-red-600">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="email"
                        disabled={emailVerified}
                        placeholder="e.g. member.name@gmail.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        className={`flex-1 bg-white border-2 border-solid rounded-lg px-2.5 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#D97706] ${
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
                          className="bg-[#0F172A] hover:bg-[#1E293B] text-white text-[11px] font-bold px-2.5 py-2 rounded-lg disabled:opacity-50 transition whitespace-nowrap shadow-sm"
                        >
                          {otpSending ? 'Sending...' : otpTimer > 0 ? `(${otpTimer}s)` : 'Send OTP'}
                        </button>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-400 text-[11px] font-bold px-2 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    {formErrors.email && (
                      <span className="text-[10px] text-red-600 mt-0.5 block font-bold">{formErrors.email}</span>
                    )}
                  </div>

                  {/* OTP Input Box if Sent */}
                  {otpSent && !emailVerified && (
                    <div className="sm:col-span-2 p-2.5 bg-[#FFFBEB] border-2 border-[#D97706]/40 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-extrabold text-[#92400E] block">
                          Enter 6-digit code sent to {email}:
                        </span>
                        {otpError && <span className="text-[10px] text-red-600 font-bold">{otpError}</span>}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-28 tracking-widest text-center font-mono font-black bg-white border-2 border-solid border-[#94A3B8] rounded-lg px-2 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                        />
                        <button
                          type="button"
                          disabled={otpVerifying || otpCode.length !== 6}
                          onClick={handleVerifyEmailOtp}
                          className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50 transition shadow-sm"
                        >
                          {otpVerifying ? '...' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Time Slot & Start Date */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Preferred Training Window <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={preferredSlot}
                      onChange={(e) => setPreferredSlot(e.target.value)}
                      className="w-full bg-white border-2 border-solid border-[#94A3B8] rounded-lg px-2.5 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                    >
                      {TIME_SLOTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Membership Start Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border-2 border-solid border-[#94A3B8] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  {/* Gender and Terms in same row */}
                  <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E2E8F0]">
                    <div className="flex items-center gap-3 text-xs font-semibold text-[#1E293B]">
                      <span className="text-xs font-bold text-[#0F172A]">Gender:</span>
                      {['Male', 'Female', 'Prefer not to say'].map((g) => (
                        <label key={g} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === g}
                            onChange={() => setGender(g)}
                            className="accent-[#D97706] w-3.5 h-3.5"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#1E293B]">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="accent-[#D97706] w-4 h-4 rounded"
                      />
                      <span>I agree to club code of conduct & health waiver</span>
                    </label>
                  </div>
                  {formErrors.terms && (
                    <span className="sm:col-span-2 text-[10px] text-red-600 block font-bold">{formErrors.terms}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] shrink-0">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-[#334155] hover:text-[#0F172A] py-1.5 px-3 transition"
              >
                ← Back to Plans
              </button>
              <button
                type="button"
                onClick={handleContinueToPayment}
                className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-lg transition flex items-center gap-2 shadow-md"
              >
                <span>Proceed to Payment</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PAYMENT (STRICTLY 2 OPTIONS, NO-SCROLL) ================= */}
        {currentStep === 3 && (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
                  Select Settlement Channel
                </h2>
                <p className="text-xs font-bold text-[#475569]">
                  Total Annual Fee for {selectedPackage.name}:{' '}
                  <strong className="text-base font-black text-[#0F172A]">
                    {formatINR(selectedPackage.pricePaise)}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs text-[#D97706] font-bold hover:underline"
              >
                Edit Details
              </button>
            </div>

            {/* Payment Options Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentOption('UPI')}
                className={`p-3.5 rounded-xl border-2 border-solid text-left transition ${
                  paymentOption === 'UPI'
                    ? 'border-[#D97706] bg-[#FFFBEB] ring-2 ring-[#D97706]/30 shadow-sm'
                    : 'border-[#CBD5E1] bg-white hover:border-[#D97706]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <UpiIconSvg className="w-7 h-4" />
                    <span className="text-xs font-extrabold text-[#0F172A]">
                      Instant UPI Settlement (Dynamic QR)
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-1.5 py-0.5 rounded">
                    Instant
                  </span>
                </div>
                <p className="text-xs font-medium text-[#334155]">
                  Scan in PhonePe / GPay / Paytm. Amount locks automatically.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('CASH')}
                className={`p-3.5 rounded-xl border-2 border-solid text-left transition ${
                  paymentOption === 'CASH'
                    ? 'border-[#D97706] bg-[#FFFBEB] ring-2 ring-[#D97706]/30 shadow-sm'
                    : 'border-[#CBD5E1] bg-white hover:border-[#D97706]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-[#0F172A]">
                    Front Desk Settlement (Cash / Reception Desk)
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.5 rounded">
                    Counter Cash
                  </span>
                </div>
                <p className="text-xs font-medium text-[#334155]">
                  Reserve slot online and pay cash at Sonovision Plaza club counter.
                </p>
              </button>
            </div>

            {/* Dynamic Content for UPI or Cash */}
            {paymentOption === 'UPI' ? (
              <div className="p-3 bg-[#F8FAFC] border-2 border-solid border-[#CBD5E1] rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-5">
                {/* Dynamic QR Display */}
                <div className="p-2.5 bg-white border-2 border-solid border-[#CBD5E1] rounded-xl text-center shrink-0">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Vyomi UPI QR Code"
                      className="w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 mx-auto rounded-xl shadow-inner"
                    />
                  ) : (
                    <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 flex items-center justify-center text-xs text-[#0F172A] font-bold">
                      Generating Dynamic QR...
                    </div>
                  )}
                  <span className="text-[11px] font-black text-[#0F172A] block mt-1.5 bg-[#FFFBEB] py-0.5 px-2 rounded border border-[#FDE68A]">
                    Amount Locked: {formatINR(selectedPackage.pricePaise)}
                  </span>
                </div>

                {/* Instructions & UTR Input */}
                <div className="space-y-2.5 max-w-sm w-full text-xs text-[#1E293B]">
                  <div className="p-2.5 bg-white border border-[#CBD5E1] rounded-xl space-y-1">
                    <p className="font-extrabold text-[#0F172A]">Payee: VALLABHANENI (9666636563@axisbank)</p>
                    <p>1. Scan QR with PhonePe, Google Pay, or Paytm.</p>
                    <p>2. Enter the 12-digit UTR transaction reference below.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Enter 12-digit UPI / UTR Transaction ID <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 432109876543 (from PhonePe / GPay receipt)"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.trim())}
                      className="w-full bg-white border-2 border-solid border-[#94A3B8] rounded-lg px-3 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white border-2 border-solid border-[#CBD5E1] rounded-2xl space-y-2 text-xs text-[#1E293B]">
                <h4 className="font-extrabold text-sm text-[#0F172A]">
                  Front Desk Counter Cash Settlement
                </h4>
                <p className="font-medium text-[#334155]">
                  Your membership slot and preferred training hours will be reserved immediately.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 space-y-0.5">
                  <p className="font-extrabold">Reception Counter Protocol:</p>
                  <p className="font-medium">
                    Please pay <strong className="font-extrabold">{formatINR(selectedPackage.pricePaise)}</strong> in cash at the Vyomi Fitness Club counter (Sonovision Plaza, Patamata). The concierge will clear your membership and activate your digital card.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] shrink-0">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-bold text-[#334155] hover:text-[#0F172A] py-1.5 px-3 transition"
              >
                ← Back to Intake
              </button>
              <button
                type="button"
                disabled={submittingPayment}
                onClick={handleCompleteRegistration}
                className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-lg transition flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {submittingPayment ? (
                  <span>Processing Settlement...</span>
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

        {/* ================= STEP 4: CONFIRMATION (SIDE-BY-SIDE NO-SCROLL) ================= */}
        {currentStep === 4 && confirmationData && (
          <div className="flex-1 flex flex-col justify-between space-y-3 py-1 text-center">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-800 text-lg font-black mb-1">
                ✓
              </div>
              <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
                {confirmationData.paymentMethod === 'UPI' ? 'Enrollment Confirmed & Activated' : 'Reserved · Pending Front Desk Cash'}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] mt-0.5">
                Welcome to Vyomi Fitness Club
              </h2>
            </div>

            {/* Side-by-side VIP Card & Member Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center max-w-4xl mx-auto w-full">
              {/* VIP Card */}
              <div className="max-w-xs mx-auto w-full">
                <VipMembershipCard
                  clientName={confirmationData.fullName}
                  packageName={confirmationData.packageName}
                  durationDays={confirmationData.durationDays}
                  memberCode={confirmationData.memberCode}
                  endDate={confirmationData.endDate}
                />
              </div>

              {/* Member Details */}
              <div className="p-3.5 bg-white border-2 border-solid border-[#CBD5E1] rounded-2xl text-left space-y-2 shadow-sm text-xs">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
                  <span className="text-[11px] font-extrabold text-[#334155] uppercase">Official Member Code</span>
                  <span className="font-mono text-sm font-black text-[#0F172A]">{confirmationData.memberCode}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#475569] font-medium block">Member Name:</span>
                    <span className="font-bold text-[#0F172A]">{confirmationData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[#475569] font-medium block">Mobile Contact:</span>
                    <span className="font-bold text-[#0F172A]">+91 {confirmationData.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#475569] font-medium block">Membership Tier:</span>
                    <span className="font-bold text-[#0F172A]">{confirmationData.packageName}</span>
                  </div>
                  <div>
                    <span className="text-[#475569] font-medium block">Settlement Amount:</span>
                    <span className="font-black text-[#0F172A]">{formatINR(confirmationData.totalAmount * 100)}</span>
                  </div>
                  <div>
                    <span className="text-[#475569] font-medium block">Plan Validity:</span>
                    <span className="font-bold text-[#D97706]">365 Days (1 Year)</span>
                  </div>
                  <div>
                    <span className="text-[#475569] font-medium block">Training Window:</span>
                    <span className="font-bold text-[#0F172A]">{confirmationData.preferredSlot}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
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

              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-center">
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
                  className="w-full sm:w-auto px-6 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>← Back to Home</span>
                </button>
              </div>
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
