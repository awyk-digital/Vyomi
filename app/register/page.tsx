'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { SUPPLIED } from '@/config/assets';
import { site } from '@/config/site';
import {
  SilverTierBadge,
  GoldTierBadge,
  PlatinumTierBadge,
  DiamondTierBadge,
  VipMembershipCard,
  StepTierIcon,
  StepIdIcon,
  StepPulseIcon,
  StepPaymentIcon,
  SecurityLockBadge,
  UpiIconSvg,
  PanattaEmblemSvg,
} from '@/components/LuxuryIcons';

interface PackageItem {
  id: string;
  name: string;
  slug: string;
  durationDays: number;
  pricePaise: number;
  joiningFeePaise: number;
  benefits: string[];
  isFeatured?: boolean;
}

interface ClientFormData {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  idProofType: string;
  idProofNumber: string;
  guardianName: string;
  guardianConsent: boolean;
  fitnessGoal: string;
  medicalNotes: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  startDate: string;
  preferredSlot: string;
  referralSource: string;
  acceptedTerms: boolean;
  acceptedWaiver: boolean;
  acceptedPrivacy: boolean;
}

const DEFAULT_PACKAGES: PackageItem[] = [
  {
    id: 'pkg-silver-1m',
    name: 'Silver',
    slug: 'silver',
    durationDays: 30,
    pricePaise: 350000,
    joiningFeePaise: 0,
    benefits: [
      'Full gym floor & strength zone access',
      'Complimentary luxury day locker',
      '5 group fitness classes per month',
      'Initial movement & posture screen',
    ],
  },
  {
    id: 'pkg-gold-3m',
    name: 'Gold',
    slug: 'gold',
    durationDays: 90,
    pricePaise: 900000,
    joiningFeePaise: 0,
    isFeatured: true,
    benefits: [
      'All Silver membership privileges',
      '2 One-on-one personal trainer sessions',
      'Unlimited steam bath & cedar sauna access',
      'Bi-monthly body composition telemetry',
    ],
  },
  {
    id: 'pkg-platinum-6m',
    name: 'Platinum',
    slug: 'platinum',
    durationDays: 180,
    pricePaise: 1600000,
    joiningFeePaise: 0,
    benefits: [
      'All Gold membership privileges',
      '6 Dedicated personal training sessions',
      'Comprehensive clinical diet consultation',
      '4 Complimentary guest VIP day passes',
      'Priority studio & reformer slot reservations',
    ],
  },
  {
    id: 'pkg-diamond-12m',
    name: 'Diamond',
    slug: 'diamond',
    durationDays: 365,
    pricePaise: 2800000,
    joiningFeePaise: 0,
    benefits: [
      'All Platinum membership privileges',
      'Full-year tailored personal trainer blueprint',
      'Cold plunge hydrotherapy & recovery suite access',
      'Unlimited guest privileges & private locker',
      'Vyomi bespoke member welcome apparel kit',
    ],
  },
];

const INITIAL_FORM: ClientFormData = {
  fullName: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  gender: 'Prefer not to say',
  address: '',
  idProofType: 'Aadhaar',
  idProofNumber: '',
  guardianName: '',
  guardianConsent: false,
  fitnessGoal: 'Hypertrophy & Muscle Gain',
  medicalNotes: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  startDate: '2026-12-01',
  preferredSlot: 'morning',
  referralSource: 'Instagram',
  acceptedTerms: false,
  acceptedWaiver: false,
  acceptedPrivacy: false,
};

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function istTime(): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
}

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPkgSlug = searchParams.get('package') || 'gold';

  const [step, setStep] = useState<number>(1);
  const [packages, setPackages] = useState<PackageItem[]>(DEFAULT_PACKAGES);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('pkg-gold-3m');
  const [formData, setFormData] = useState<ClientFormData>(INITIAL_FORM);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPaise: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');
  const [clock, setClock] = useState<string>('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Keep clock updated
  useEffect(() => {
    setClock(istTime());
    const timer = setInterval(() => setClock(istTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch packages
  useEffect(() => {
    fetch('/api/v1/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.packages && data.packages.length > 0) {
          setPackages(data.packages);
          const found = data.packages.find((p: PackageItem) => p.slug === initialPkgSlug) || data.packages[1] || data.packages[0];
          setSelectedPkgId(found.id);
        }
      })
      .catch((err) => console.error('Failed to load packages:', err));
  }, [initialPkgSlug]);

  // Restore draft from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('vyomi_reg_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.selectedPkgId) setSelectedPkgId(parsed.selectedPkgId);
        if (parsed.step && parsed.step > 1) setStep(parsed.step);
      }
    } catch {}
  }, []);

  // Save draft
  useEffect(() => {
    try {
      sessionStorage.setItem(
        'vyomi_reg_draft',
        JSON.stringify({ formData, selectedPkgId, step })
      );
    } catch {}
  }, [formData, selectedPkgId, step]);

  const selectedPackage = useMemo(() => {
    return packages.find((p) => p.id === selectedPkgId) || packages[0];
  }, [packages, selectedPkgId]);

  // Calculate pricing breakdown
  const pricing = useMemo(() => {
    if (!selectedPackage) {
      return { basePrice: 0, joiningFee: 0, discount: 0, taxable: 0, gst: 0, total: 0 };
    }
    const basePrice = selectedPackage.pricePaise;
    const joiningFee = selectedPackage.joiningFeePaise || 0;
    const discount = appliedCoupon ? appliedCoupon.discountPaise : 0;
    const taxable = Math.max(0, basePrice + joiningFee - discount);
    const gst = Math.round(taxable * 0.18);
    const total = taxable + gst;
    return { basePrice, joiningFee, discount, taxable, gst, total };
  }, [selectedPackage, appliedCoupon]);

  // Age calculation
  const clientAge = useMemo(() => {
    if (!formData.dateOfBirth) return null;
    const dob = new Date(formData.dateOfBirth);
    const diff = Date.now() - dob.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }, [formData.dateOfBirth]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          packageId: selectedPackage.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error?.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discountPaise: data.discountPaise,
        });
      }
    } catch {
      setCouponError('Could not validate coupon.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const validateStep2 = (): boolean => {
    setGeneralError('');
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setGeneralError('Please enter your full name (at least 2 characters).');
      return false;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setGeneralError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setGeneralError('Please enter a valid email address.');
      return false;
    }
    if (!formData.dateOfBirth) {
      setGeneralError('Please enter your date of birth.');
      return false;
    }
    if (clientAge !== null && clientAge < 16) {
      setGeneralError('Members must be at least 16 years of age.');
      return false;
    }
    if (clientAge !== null && clientAge < 18) {
      if (!formData.guardianName.trim() || !formData.guardianConsent) {
        setGeneralError('Guardian name and consent are required for applicants under 18.');
        return false;
      }
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    setGeneralError('');
    if (!formData.emergencyContactName.trim()) {
      setGeneralError('Please provide an emergency contact person.');
      return false;
    }
    if (!formData.emergencyContactPhone.trim()) {
      setGeneralError('Please provide an emergency contact phone number.');
      return false;
    }
    return true;
  };

  const handlePayAndRegister = async () => {
    setGeneralError('');
    if (!formData.acceptedTerms || !formData.acceptedWaiver || !formData.acceptedPrivacy) {
      setGeneralError('Please accept the Terms & Conditions, Health Waiver, and Privacy Policy to proceed.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create registration & server order
      const res = await fetch('/api/v1/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          couponCode: appliedCoupon?.code,
          client: formData,
          startDate: formData.startDate,
          preferredSlot: formData.preferredSlot,
          referralSource: formData.referralSource,
          acceptedTerms: formData.acceptedTerms,
          acceptedWaiver: formData.acceptedWaiver,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.error?.message || 'Registration could not be created.');
        setSubmitting(false);
        return;
      }

      const { registrationRef, order } = data;

      // Check if window.Razorpay is available
      const RazorpayConstructor = (window as unknown as { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, fn: () => void) => void } }).Razorpay;

      if (typeof RazorpayConstructor === 'function') {
        const rzp = new RazorpayConstructor({
          key: order.keyId,
          amount: order.amount,
          currency: 'INR',
          name: site.name,
          description: `${selectedPackage?.name ?? 'Gold'} Membership (${selectedPackage?.durationDays ?? 90} Days)`,
          order_id: order.razorpayOrderId,
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone,
          },
          theme: { color: '#080808' },
          handler: async (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
            const vRes = await fetch('/api/v1/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                registrationRef,
                ...response,
              }),
            });
            if (vRes.ok) {
              sessionStorage.removeItem('vyomi_reg_draft');
              router.push(`/register/success?ref=${registrationRef}`);
            } else {
              router.push(`/register/pending?ref=${registrationRef}`);
            }
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              setGeneralError('Payment was cancelled. Your details are saved — you can retry anytime.');
            },
          },
        });
        rzp.on('payment.failed', () => {
          router.push(`/register/failed?ref=${registrationRef}`);
        });
        rzp.open();
      } else {
        // Fallback or Test Mode Direct Verification
        const vRes = await fetch('/api/v1/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationRef,
            razorpay_payment_id: `sim_pay_${Date.now()}`,
            razorpay_signature: 'sig_mock_verified',
            method: 'RAZORPAY',
          }),
        });
        if (vRes.ok) {
          sessionStorage.removeItem('vyomi_reg_draft');
          router.push(`/register/success?ref=${registrationRef}`);
        } else {
          router.push(`/register/pending?ref=${registrationRef}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setGeneralError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div data-theme="light" className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0C0C0E]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src={SUPPLIED.logo.src}
              alt="Vyomi Fitness Club"
              width={72}
              height={36}
              unoptimized
              className="h-9 w-auto opacity-95 group-hover:opacity-100 transition-opacity"
            />
            <span className="hidden sm:inline-block text-xs font-semibold tracking-widest text-[#D4AF37] uppercase border-l border-white/15 pl-3">
              Membership Portal
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:flex items-center gap-2 text-white/50">
              <span>{site.city}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block shadow-[0_0_8px_#10B981]" />
              <span className="nums font-medium text-[#F5F5F2]">{clock} IST</span>
            </div>
            <Link
              href="/"
              className="btn-line-light !h-9 !px-3.5 !text-xs !tracking-wider"
            >
              Exit to Club ↗
            </Link>
          </div>
        </div>

        {/* Stepper progress bar with gold shimmer */}
        <div className="w-full bg-white/5 h-1 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] via-[#B08D57] to-[#10B981] transition-all duration-500 ease-[var(--ease-editorial)]"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Step indicator header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="t-label text-[#D4AF37] flex items-center gap-2">
              <span className="nums font-bold tracking-wider">STEP 0{step} / 04</span>
              <span>┃</span>
              <span className="text-white/40 uppercase tracking-wider text-[0.6875rem]">
                {step === 1 && 'Select Premium Tier'}
                {step === 2 && 'Personal Identification'}
                {step === 3 && 'Fitness & Safety Protocol'}
                {step === 4 && 'Review & Activation'}
              </span>
            </div>
            <h1 className="t-h2 text-[#F5F5F2] mt-2 font-medium tracking-tight">
              {step === 1 && 'Choose Your Membership.'}
              {step === 2 && 'Personal Details.'}
              {step === 3 && 'Health & Emergency Contact.'}
              {step === 4 && 'Review & Complete Enrollment.'}
            </h1>
          </div>

          {/* Stepper pill buttons with Luxury SVGs */}
          <div className="flex items-center gap-1.5 text-xs bg-[#111113] p-1.5 rounded-md border border-white/10">
            {[
              { s: 1, label: 'Tier', icon: StepTierIcon },
              { s: 2, label: 'Identity', icon: StepIdIcon },
              { s: 3, label: 'Safety', icon: StepPulseIcon },
              { s: 4, label: 'Activation', icon: StepPaymentIcon },
            ].map(({ s, label, icon: Icon }) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (s < step) setStep(s);
                }}
                disabled={s > step}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all font-medium ${
                  s === step
                    ? 'bg-[#1C1C20] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                    : s < step
                    ? 'text-[#F5F5F2] hover:text-[#D4AF37] cursor-pointer'
                    : 'text-white/30 cursor-not-allowed'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="nums">0{s}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {generalError && (
          <div className="mb-8 p-4 bg-[var(--burgundy-wash)] border border-[var(--burgundy)] text-[var(--burgundy)] rounded flex items-center gap-3 text-sm animate-in fade-in">
            <span className="font-bold text-base">⚠</span>
            <span>{generalError}</span>
          </div>
        )}

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Interactive Form Steps */}
          <div className="lg:col-span-8">
            {/* STEP 1: PACKAGE SELECTION */}
            {step === 1 && (
              <div className="space-y-6">
                <p className="t-body text-[#A1A1AA]">
                  All memberships provide unrestricted access to the complete Panatta biomechanical equipment suite, executive locker rooms, and wellness thermal bays.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  {packages.map((pkg) => {
                    const isSelected = pkg.id === selectedPkgId;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`relative p-6 sm:p-7 rounded-lg transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#18181C] to-[#111113] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.18)] ring-1 ring-[#D4AF37]'
                            : 'bg-[#111113] border-white/10 hover:border-white/20 hover:bg-[#151518] hover:-translate-y-0.5'
                        }`}
                      >
                        {pkg.isFeatured && (
                          <span className="absolute -top-3 right-5 px-3 py-0.5 text-[0.625rem] font-bold tracking-widest uppercase rounded-full bg-[#8C2230] text-white shadow-md">
                            Most Chosen
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {pkg.slug === 'silver' && <SilverTierBadge className="w-9 h-9" />}
                              {pkg.slug === 'gold' && <GoldTierBadge className="w-9 h-9" />}
                              {pkg.slug === 'platinum' && <PlatinumTierBadge className="w-9 h-9" />}
                              {pkg.slug === 'diamond' && <DiamondTierBadge className="w-9 h-9" />}
                              <div>
                                <span className="t-label text-white/40 block text-[0.6875rem]">
                                  {pkg.durationDays} Days Commitment
                                </span>
                                <h3 className="t-h3 text-[#F5F5F2] font-semibold">
                                  {pkg.name} Tier
                                </h3>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="t-micro px-2.5 py-1 bg-[#D4AF37] text-black font-bold tracking-wider rounded uppercase text-[0.625rem]">
                                Selected
                              </span>
                            )}
                          </div>

                          <div className="mt-4 flex items-baseline gap-1">
                            <span className="nums t-h2 text-[#F5F5F2] font-semibold">
                              {formatINR(pkg.pricePaise)}
                            </span>
                            <span className="t-small text-white/40">
                              / {pkg.durationDays >= 365 ? 'yr' : `${pkg.durationDays / 30} mo`}
                            </span>
                          </div>

                          <div className="h-px w-full bg-white/10 my-5" />

                          <ul className="space-y-3">
                            {pkg.benefits.map((b, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs text-[#C4C4C0]">
                                <span className="text-[#D4AF37] font-bold mt-0.5">✓</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          className={`mt-6 w-full text-xs font-semibold py-3 uppercase tracking-wider rounded transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B08D57] text-black font-bold shadow-md'
                              : 'bg-[#18181B] text-[#F5F5F2] border border-white/10 hover:border-white/20'
                          }`}
                        >
                          {isSelected ? 'Tier Selected' : 'Select Package'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-6 border-t border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-solid-light"
                  >
                    Continue to Personal Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PERSONAL DETAILS */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Full Legal Name <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditya Varma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="light-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Mobile Number (+91) <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="light-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Email Address <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="aditya@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="light-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Date of Birth <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="light-input"
                    />
                    {clientAge !== null && (
                      <span className="text-[0.6875rem] text-[var(--text-faint)] mt-1 block">
                        Age: {clientAge} years {clientAge < 18 ? '(Guardian consent required)' : ''}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="light-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      ID Proof Verification (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formData.idProofType}
                        onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
                        className="light-input !text-xs"
                      >
                        <option value="Aadhaar">Aadhaar</option>
                        <option value="PAN">PAN</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Passport">Passport</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Document number"
                        value={formData.idProofNumber}
                        onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                        className="light-input !text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                    Residential Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Street, locality, Vijayawada"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="light-input !h-auto py-2.5 resize-none"
                  />
                </div>

                {/* Under 18 Guardian Section */}
                {clientAge !== null && clientAge < 18 && (
                  <div className="p-4 bg-[var(--surface-2)] border border-[var(--line-2)] rounded space-y-3">
                    <span className="t-label text-[var(--burgundy)] font-bold block">
                      Under 18 Guardian Protocol
                    </span>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-strong)] mb-1">
                        Parent or Legal Guardian Full Name <span className="text-[var(--burgundy)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.guardianName}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        placeholder="Guardian full name"
                        className="light-input"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text)]">
                      <input
                        type="checkbox"
                        checked={formData.guardianConsent}
                        onChange={(e) => setFormData({ ...formData, guardianConsent: e.target.checked })}
                        className="w-4 h-4 rounded text-[var(--text-strong)]"
                      />
                      <span>I confirm that I am the legal guardian and consent to the minor’s membership enrollment.</span>
                    </label>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-line-light"
                  >
                    ← Back to Packages
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) setStep(3);
                    }}
                    className="btn-solid-light"
                  >
                    Continue to Health Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: FITNESS & EMERGENCY */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Primary Fitness Objective <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <select
                      value={formData.fitnessGoal}
                      onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                      className="light-input"
                    >
                      <option value="Hypertrophy & Muscle Gain">Hypertrophy & Muscle Gain</option>
                      <option value="Athletic Conditioning & HYROX">Athletic Conditioning & HYROX</option>
                      <option value="Reformer Pilates & Mobility">Reformer Pilates & Mobility</option>
                      <option value="Fat Loss & Caloric Expenditure">Fat Loss & Caloric Expenditure</option>
                      <option value="Cardiovascular Health & Longevity">Cardiovascular Health & Longevity</option>
                      <option value="Post-Rehab & Joint Recovery">Post-Rehab & Joint Recovery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Preferred Daily Time Slot
                    </label>
                    <select
                      value={formData.preferredSlot}
                      onChange={(e) => setFormData({ ...formData, preferredSlot: e.target.value })}
                      className="light-input"
                    >
                      <option value="morning">Morning (06:00 – 11:00)</option>
                      <option value="afternoon">Afternoon (11:00 – 16:00)</option>
                      <option value="evening">Evening (16:00 – 22:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Membership Start Date <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="light-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      How Did You Discover Vyomi?
                    </label>
                    <select
                      value={formData.referralSource}
                      onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                      className="light-input"
                    >
                      <option value="Instagram">Instagram / Social Media</option>
                      <option value="Friend or Member">Member Recommendation</option>
                      <option value="Walking By">Direct Club Visit</option>
                      <option value="Google Search">Google Search</option>
                      <option value="Billboard">Outdoor Billboard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Emergency Contact Person <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Spouse, Parent, Sibling"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="light-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Emergency Contact Number <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="light-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                    Medical History / Prior Orthopedic Injuries (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="List any past surgeries, disc herniations, cardiovascular conditions, or chronic joint issues our fitness coaches should be briefed on..."
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    className="light-input !h-auto py-2.5 resize-none text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-line-light"
                  >
                    ← Back to Personal Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep3()) setStep(4);
                    }}
                    className="btn-solid-light"
                  >
                    Review & Payment →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW, TERMS & PAYMENT */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-[var(--surface)] border border-[var(--line)] p-6 rounded-[2px] space-y-4">
                  <h3 className="t-h3 text-[var(--text-strong)] border-b border-[var(--line)] pb-3 font-medium">
                    Enrolling Client Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[var(--text-faint)] block uppercase">Full Name</span>
                      <span className="font-semibold text-[var(--text-strong)]">{formData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-faint)] block uppercase">Mobile</span>
                      <span className="font-semibold text-[var(--text-strong)]">+91 {formData.phone}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-faint)] block uppercase">Email</span>
                      <span className="font-semibold text-[var(--text-strong)]">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-faint)] block uppercase">Membership Tier</span>
                      <span className="font-semibold text-[var(--bronze-text)]">
                        {selectedPackage?.name ?? 'Gold'} ({selectedPackage?.durationDays ?? 90} Days)
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-faint)] block uppercase">Activation Date</span>
                      <span className="font-semibold text-[var(--text-strong)]">{formData.startDate}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-faint)] block uppercase">Emergency Contact</span>
                      <span className="font-semibold text-[var(--text-strong)]">{formData.emergencyContactName} ({formData.emergencyContactPhone})</span>
                    </div>
                  </div>
                </div>

                {/* Terms and Waivers Checkboxes */}
                <div className="bg-[var(--surface-2)] border border-[var(--line-2)] p-5 rounded space-y-3.5">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-[var(--text-strong)]">
                    <input
                      type="checkbox"
                      checked={formData.acceptedTerms}
                      onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-[var(--text-strong)]"
                    />
                    <span>
                      I agree to the <strong>Vyomi Fitness Club Rules & Code of Conduct</strong>, acknowledging access privileges, locker regulations, and standard cancellation policies.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer text-xs text-[var(--text-strong)]">
                    <input
                      type="checkbox"
                      checked={formData.acceptedWaiver}
                      onChange={(e) => setFormData({ ...formData, acceptedWaiver: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-[var(--text-strong)]"
                    />
                    <span>
                      I voluntarily assume all physical risks associated with strenuous athletic training, sauna/cold hydrotherapy protocols, and release Vyomi and its staff from injury liability (<strong>Health Waiver</strong>).
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer text-xs text-[var(--text-strong)]">
                    <input
                      type="checkbox"
                      checked={formData.acceptedPrivacy}
                      onChange={(e) => setFormData({ ...formData, acceptedPrivacy: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-[var(--text-strong)]"
                    />
                    <span>
                      I consent to the collection and confidential processing of my personal details and emergency contacts in accordance with the <strong>Digital Personal Data Protection (DPDP) Act</strong>.
                    </span>
                  </label>
                </div>

                {/* Final Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={submitting}
                    className="btn-line-light"
                  >
                    ← Back to Health Details
                  </button>

                  <button
                    type="button"
                    disabled={submitting || !formData.acceptedTerms || !formData.acceptedWaiver || !formData.acceptedPrivacy}
                    onClick={handlePayAndRegister}
                    className="btn-solid-light !h-12 !px-8 text-sm"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--live)] animate-ping" />
                        Initiating Payment Gateway...
                      </span>
                    ) : (
                      `Pay ${formatINR(pricing.total)} & Activate Membership →`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Order Summary Card */}
          <div className="lg:col-span-4 sticky top-28 space-y-5">
            {/* Live Interactive VIP Digital Card Preview */}
            <VipMembershipCard
              clientName={formData.fullName}
              packageName={selectedPackage?.name ?? 'Gold'}
              durationDays={selectedPackage?.durationDays ?? 90}
            />

            <div className="bg-[#111113] border border-white/10 rounded-lg p-6 shadow-[var(--shadow-card)] space-y-5">
              <div className="border-b border-white/10 pb-4">
                <span className="t-label text-[#D4AF37] tracking-widest uppercase text-[0.6875rem] font-bold">
                  Order Summary
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="t-h3 text-[#F5F5F2] font-semibold">
                    {selectedPackage?.name ?? 'Gold'} Tier
                  </h3>
                  <span className="nums t-small text-[#D4AF37] font-medium">
                    {selectedPackage?.durationDays ?? 90} Days Access
                  </span>
                </div>
              </div>

              {/* Price rows */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Base Membership Fee</span>
                  <span className="nums font-medium text-[#F5F5F2]">
                    {formatINR(pricing.basePrice)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">One-Time Admission Fee</span>
                  <span className="nums text-[#10B981] font-medium">
                    {pricing.joiningFee === 0 ? 'Complimentary' : formatINR(pricing.joiningFee)}
                  </span>
                </div>

                {pricing.discount > 0 && (
                  <div className="flex justify-between text-[#10B981]">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span className="nums font-medium">−{formatINR(pricing.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-white/40">
                  <span>Goods & Services Tax (GST 18%)</span>
                  <span className="nums font-medium text-[#A1A1AA]">
                    {formatINR(pricing.gst)}
                  </span>
                </div>

                <div className="h-px w-full bg-white/10 my-3" />

                <div className="flex items-baseline justify-between pt-1">
                  <span className="t-body font-semibold text-[#F5F5F2]">Total Payable</span>
                  <span className="nums t-h3 font-bold text-[#D4AF37]">
                    {formatINR(pricing.total)}
                  </span>
                </div>
              </div>

              {/* Coupon Code input */}
              <div className="pt-2">
                <label className="block text-[0.6875rem] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                  Promotional Voucher Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. NEWYEAR10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="light-input !h-9 text-xs uppercase"
                  />
                  <button
                    type="button"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    onClick={handleApplyCoupon}
                    className="btn-line-light !h-9 !px-3.5 text-xs"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <span className="text-[0.6875rem] text-[var(--burgundy)] mt-1 block">
                    {couponError}
                  </span>
                )}
                {appliedCoupon && (
                  <span className="text-[0.6875rem] text-[#10B981] mt-1 block font-medium">
                    ✓ Voucher {appliedCoupon.code} applied successfully!
                  </span>
                )}
              </div>

              {/* Security info & Payment SVGs */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex items-center gap-2.5 text-[0.6875rem] text-white/50">
                  <SecurityLockBadge className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>
                    Bank-grade 256-bit TLS encrypted session via Razorpay.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[0.625rem] text-white/40">
                  <div className="flex items-center gap-2">
                    <UpiIconSvg className="h-4 w-auto" />
                    <span>Cards & NetBanking</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8C2230] font-semibold">
                    <PanattaEmblemSvg className="w-3.5 h-3.5" />
                    <span>Panatta Studio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Floating Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 light-glass-bar z-30 p-4 flex items-center justify-between">
        <div>
          <span className="text-[0.6875rem] text-[var(--text-faint)] block uppercase">Total Payable</span>
          <span className="nums text-base font-bold text-[var(--text-strong)]">{formatINR(pricing.total)}</span>
        </div>
        <div className="flex items-center gap-2">
          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1) setStep(2);
                else if (step === 2 && validateStep2()) setStep(3);
                else if (step === 3 && validateStep3()) setStep(4);
              }}
              className="btn-solid-light !h-10 !px-4 !text-xs"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !formData.acceptedTerms || !formData.acceptedWaiver || !formData.acceptedPrivacy}
              onClick={handlePayAndRegister}
              className="btn-solid-light !h-10 !px-4 !text-xs"
            >
              {submitting ? 'Processing...' : 'Pay Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-xs text-neutral-400">
          Loading membership portal...
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
