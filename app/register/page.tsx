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

  // Field validation error state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Vyomi Luxury In-App Payment Gateway Modal state
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentTab, setPaymentTab] = useState<'upi' | 'card' | 'netbanking' | 'sandbox'>('upi');
  const [createdRegistrationRef, setCreatedRegistrationRef] = useState<string>('');
  const [createdOrder, setCreatedOrder] = useState<{
    amount: number;
    currency: string;
    razorpayOrderId?: string;
    keyId?: string;
  } | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);

  // Interactive Card & UPI inputs
  const [cardNumber, setCardNumber] = useState<string>('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('777');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');

  const handleInputChange = (field: keyof ClientFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

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
    const errors: Record<string, string> = {};

    // Full Name: at least 2 words, letters, spaces, hyphens, apostrophes
    const nameTrimmed = formData.fullName.trim();
    if (!nameTrimmed) {
      errors.fullName = 'Full legal name is required.';
    } else if (nameTrimmed.length < 3) {
      errors.fullName = 'Name must be at least 3 characters.';
    } else if (!/^[a-zA-Z\s'.-]+$/.test(nameTrimmed)) {
      errors.fullName = 'Name should only contain letters and spaces.';
    } else if (nameTrimmed.split(/\s+/).filter(Boolean).length < 2) {
      errors.fullName = 'Please enter both first and last name.';
    }

    // Phone: Indian 10-digit mobile starting with 6, 7, 8, or 9
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Mobile phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    // Email: strict standard
    const emailTrimmed = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(emailTrimmed)) {
      errors.email = 'Please enter a valid, active email address.';
    }

    // Date of Birth
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.';
    } else {
      const dobDate = new Date(formData.dateOfBirth);
      const now = new Date();
      if (isNaN(dobDate.getTime()) || dobDate > now) {
        errors.dateOfBirth = 'Date of birth cannot be in the future.';
      } else if (clientAge !== null && clientAge < 16) {
        errors.dateOfBirth = 'Vyomi membership requires a minimum age of 16 years.';
      }
    }

    // Minor Guardian protocol
    if (clientAge !== null && clientAge < 18 && clientAge >= 16) {
      if (!formData.guardianName.trim() || formData.guardianName.trim().length < 3) {
        errors.guardianName = 'Parent or legal guardian name is mandatory for applicants under 18.';
      }
      if (!formData.guardianConsent) {
        errors.guardianConsent = 'Parent or legal guardian consent confirmation is required.';
      }
    }

    // ID proof validation if entered
    if (formData.idProofNumber.trim()) {
      const cleanId = formData.idProofNumber.trim();
      if (formData.idProofType === 'Aadhaar' && !/^\d{12}$/.test(cleanId.replace(/\s/g, ''))) {
        errors.idProofNumber = 'Aadhaar number must be exactly 12 digits.';
      } else if (formData.idProofType === 'PAN' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(cleanId)) {
        errors.idProofNumber = 'PAN must follow standard format (e.g. ABCDE1234F).';
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setGeneralError('Please correct the highlighted errors before continuing.');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    setGeneralError('');
    const errors: Record<string, string> = {};

    const cleanClientPhone = formData.phone.replace(/\D/g, '');
    const cleanEmergencyPhone = formData.emergencyContactPhone.replace(/\D/g, '');

    if (!formData.emergencyContactName.trim()) {
      errors.emergencyContactName = 'Emergency contact person is required.';
    } else if (formData.emergencyContactName.trim().toLowerCase() === formData.fullName.trim().toLowerCase()) {
      errors.emergencyContactName = 'Emergency contact person cannot be yourself.';
    }

    if (!cleanEmergencyPhone) {
      errors.emergencyContactPhone = 'Emergency contact phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanEmergencyPhone)) {
      errors.emergencyContactPhone = 'Enter a valid 10-digit Indian phone number.';
    } else if (cleanEmergencyPhone === cleanClientPhone) {
      errors.emergencyContactPhone = 'Emergency contact phone cannot be identical to your personal mobile number.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setGeneralError('Please correct the highlighted emergency contact fields.');
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
      setCreatedRegistrationRef(registrationRef);
      setCreatedOrder(order);
      setCardHolder(formData.fullName);

      // Open the bespoke in-app luxury payment modal
      setShowPaymentModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setGeneralError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const executePaymentVerification = async (options?: {
    simulateFailure?: boolean;
    failureReason?: string;
    simulatePending?: boolean;
  }) => {
    if (!createdRegistrationRef) return;
    setPaymentProcessing(true);

    try {
      const payload: Record<string, unknown> = {
        registrationRef: createdRegistrationRef,
        razorpay_payment_id: options?.simulateFailure
          ? `pay_failed_${Date.now()}`
          : `pay_vyomi_${Date.now()}`,
        razorpay_signature: options?.simulateFailure ? 'sig_failure' : 'sig_mock_verified',
        method: paymentTab === 'card' ? 'CARD' : paymentTab === 'upi' ? 'UPI' : 'NETBANKING',
      };

      if (options?.simulateFailure) {
        payload.simulateFailure = true;
        payload.failureReason = options.failureReason || 'Card declined by issuing bank';
      }
      if (options?.simulatePending) {
        payload.simulatePending = true;
      }

      const res = await fetch('/api/v1/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (options?.simulateFailure) {
        sessionStorage.removeItem('vyomi_reg_draft');
        setShowPaymentModal(false);
        router.push(`/register/failed?ref=${createdRegistrationRef}`);
        return;
      }

      if (options?.simulatePending || !res.ok) {
        sessionStorage.removeItem('vyomi_reg_draft');
        setShowPaymentModal(false);
        router.push(`/register/pending?ref=${createdRegistrationRef}`);
        return;
      }

      sessionStorage.removeItem('vyomi_reg_draft');
      setShowPaymentModal(false);
      router.push(`/register/success?ref=${createdRegistrationRef}`);
    } catch {
      router.push(`/register/failed?ref=${createdRegistrationRef}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const launchNativeRazorpay = () => {
    if (!createdOrder || !createdRegistrationRef) return;
    const RazorpayConstructor = (window as unknown as {
      Razorpay?: new (opts: Record<string, unknown>) => {
        open: () => void;
        on: (e: string, fn: () => void) => void;
      };
    }).Razorpay;

    if (typeof RazorpayConstructor !== 'function') {
      alert('Razorpay script is still loading. Please retry in a moment.');
      return;
    }

    try {
      const rzp = new RazorpayConstructor({
        key: createdOrder.keyId || 'rzp_test_vyomi2026',
        amount: createdOrder.amount,
        currency: 'INR',
        name: site.name,
        description: `${selectedPackage?.name ?? 'Gold'} Membership (${selectedPackage?.durationDays ?? 90} Days)`,
        order_id: createdOrder.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#080808' },
        handler: async (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
          await executePaymentVerification();
        },
        modal: {
          ondismiss: () => {
            setGeneralError('Razorpay checkout window was closed.');
          },
        },
      });
      rzp.on('payment.failed', () => {
        router.push(`/register/failed?ref=${createdRegistrationRef}`);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Could not launch Razorpay popup.');
    }
  };

  const handleSimulatedPayment = async (scenario: 'SUCCESS' | 'FAILURE' | 'PENDING') => {
    setGeneralError('');
    if (!formData.acceptedTerms || !formData.acceptedWaiver || !formData.acceptedPrivacy) {
      setGeneralError('Please accept the Terms & Conditions, Health Waiver, and Privacy Policy to execute this test case.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create client intake & server order
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

      const { registrationRef } = data;

      if (scenario === 'SUCCESS') {
        const vRes = await fetch('/api/v1/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationRef,
            razorpay_payment_id: `pay_test_${Date.now()}`,
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
      } else if (scenario === 'FAILURE') {
        await fetch('/api/v1/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationRef,
            simulateFailure: true,
            failureReason: 'Card declined by issuing bank (Simulated Razorpay Test Case)',
            razorpay_payment_id: `pay_declined_${Date.now()}`,
            razorpay_signature: 'sig_simulate_failure',
          }),
        });
        router.push(`/register/failed?ref=${registrationRef}`);
      } else if (scenario === 'PENDING') {
        await fetch('/api/v1/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationRef,
            simulatePending: true,
          }),
        });
        router.push(`/register/pending?ref=${registrationRef}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation error occurred';
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
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`light-input ${fieldErrors.fullName ? '!border-rose-500 focus:!border-rose-500 !bg-rose-500/5' : ''}`}
                    />
                    {fieldErrors.fullName && (
                      <p className="text-rose-400 text-[0.6875rem] mt-1 font-medium">{fieldErrors.fullName}</p>
                    )}
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
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                      className={`light-input ${fieldErrors.phone ? '!border-rose-500 focus:!border-rose-500 !bg-rose-500/5' : ''}`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-rose-400 text-[0.6875rem] mt-1 font-medium">{fieldErrors.phone}</p>
                    )}
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
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`light-input ${fieldErrors.email ? '!border-rose-500 focus:!border-rose-500 !bg-rose-500/5' : ''}`}
                    />
                    {fieldErrors.email && (
                      <p className="text-rose-400 text-[0.6875rem] mt-1 font-medium">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Date of Birth <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`light-input ${fieldErrors.dateOfBirth ? '!border-rose-500 focus:!border-rose-500 !bg-rose-500/5' : ''}`}
                    />
                    {fieldErrors.dateOfBirth && (
                      <p className="text-rose-400 text-[0.6875rem] mt-1 font-medium">{fieldErrors.dateOfBirth}</p>
                    )}
                    {clientAge !== null && !fieldErrors.dateOfBirth && (
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
                      onChange={(e) => handleInputChange('gender', e.target.value)}
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
                        onChange={(e) => handleInputChange('idProofType', e.target.value)}
                        className="light-input !text-xs"
                      >
                        <option value="Aadhaar">Aadhaar (12 digits)</option>
                        <option value="PAN">PAN Card</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Passport">Passport</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Document number"
                        value={formData.idProofNumber}
                        onChange={(e) => handleInputChange('idProofNumber', e.target.value)}
                        className={`light-input !text-xs ${fieldErrors.idProofNumber ? '!border-rose-500 !bg-rose-500/5' : ''}`}
                      />
                    </div>
                    {fieldErrors.idProofNumber && (
                      <p className="text-rose-400 text-[0.6875rem] mt-1 font-medium">{fieldErrors.idProofNumber}</p>
                    )}
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
                    onChange={(e) => handleInputChange('address', e.target.value)}
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
                        onChange={(e) => handleInputChange('guardianName', e.target.value)}
                        placeholder="Guardian full name"
                        className={`light-input ${fieldErrors.guardianName ? '!border-rose-500 !bg-rose-500/5' : ''}`}
                      />
                      {fieldErrors.guardianName && (
                        <p className="text-rose-400 text-[0.6875rem] mt-1 font-medium">{fieldErrors.guardianName}</p>
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text)]">
                      <input
                        type="checkbox"
                        checked={formData.guardianConsent}
                        onChange={(e) => handleInputChange('guardianConsent', e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--text-strong)]"
                      />
                      <span>I confirm that I am the legal guardian and consent to the minor’s membership enrollment.</span>
                    </label>
                    {fieldErrors.guardianConsent && (
                      <p className="text-rose-400 text-[0.6875rem] font-medium">{fieldErrors.guardianConsent}</p>
                    )}
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
                      onChange={(e) => handleInputChange('fitnessGoal', e.target.value)}
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
                      onChange={(e) => handleInputChange('preferredSlot', e.target.value)}
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
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="light-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      How Did You Discover Vyomi?
                    </label>
                    <select
                      value={formData.referralSource}
                      onChange={(e) => handleInputChange('referralSource', e.target.value)}
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
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      className={`light-input ${fieldErrors.emergencyContactName ? '!border-rose-500 focus:!border-rose-500 !bg-rose-500/5' : ''}`}
                    />
                    {fieldErrors.emergencyContactName && (
                      <p className="text-rose-400 text-[0.6875rem] mt-1 font-medium">{fieldErrors.emergencyContactName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-strong)] mb-1.5 uppercase tracking-wider">
                      Emergency Contact Number <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value.replace(/\D/g, ''))}
                      className={`light-input ${fieldErrors.emergencyContactPhone ? '!border-rose-500 focus:!border-rose-500 !bg-rose-500/5' : ''}`}
                    />
                    {fieldErrors.emergencyContactPhone && (
                      <p className="text-rose-400 text-[0.6875rem] mt-1 font-medium">{fieldErrors.emergencyContactPhone}</p>
                    )}
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
                    onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
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

                {/* Razorpay Gateway Test Scenarios & Sandbox Simulation Panel */}
                <div className="bg-[#111114] border border-[#D4AF37]/30 rounded-lg p-5 sm:p-6 space-y-4 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                      <span className="t-label text-[#D4AF37] font-bold tracking-wider uppercase text-[0.6875rem]">
                        Razorpay Gateway Test Cases & Sandbox
                      </span>
                    </div>
                    <span className="nums text-[0.625rem] font-mono text-white/50 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      SANDBOX KEY: rzp_test_vyomi2026
                    </span>
                  </div>

                  {/* Test credentials cheatsheet */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#161619] p-3 rounded border border-white/5">
                    <div>
                      <span className="text-[#10B981] font-semibold block text-[0.625rem] uppercase">
                        ✓ Success Test Credentials
                      </span>
                      <span className="font-mono text-[#F5F5F2] font-semibold">4111 1111 1111 1111</span>
                      <span className="text-[0.625rem] text-white/50 block">Exp: 12/30 · CVV: 123 · OTP: Any 6 digits</span>
                    </div>
                    <div>
                      <span className="text-[#8C2230] font-semibold block text-[0.625rem] uppercase">
                        ✕ Decline / Failed Test Card
                      </span>
                      <span className="font-mono text-[#8C2230] font-semibold">4000 0000 0000 0002</span>
                      <span className="text-[0.625rem] text-white/50 block">UPI: success@razorpay / failure@razorpay</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#A1A1AA]">
                    Click any simulated scenario below to test end-to-end gateway callbacks, membership activation, or failure error screens:
                  </p>

                  {/* 1-Click Test Scenarios Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSimulatedPayment('SUCCESS')}
                      className="flex flex-col items-start p-3 rounded border border-[#10B981]/40 bg-[#10B981]/10 hover:bg-[#10B981]/20 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
                        <span>✓</span>
                        <span>Case 1: Success</span>
                      </div>
                      <span className="text-[0.6875rem] text-white/70 mt-1">
                        Simulate 200 OK payment, activate membership & print receipt
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSimulatedPayment('FAILURE')}
                      className="flex flex-col items-start p-3 rounded border border-[#8C2230]/40 bg-[#8C2230]/10 hover:bg-[#8C2230]/20 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6B6B]">
                        <span>✕</span>
                        <span>Case 2: Decline</span>
                      </div>
                      <span className="text-[0.6875rem] text-white/70 mt-1">
                        Simulate bank card decline & test payment retry flow (/failed)
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSimulatedPayment('PENDING')}
                      className="flex flex-col items-start p-3 rounded border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37]">
                        <span>⏳</span>
                        <span>Case 3: Pending</span>
                      </div>
                      <span className="text-[0.6875rem] text-white/70 mt-1">
                        Simulate gateway delay & test live status polling (/pending)
                      </span>
                    </button>
                  </div>
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
                        Generating Secure Order...
                      </span>
                    ) : (
                      `Proceed to Payment · ${formatINR(pricing.total)} →`
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

      {/* VYOMI LUXURY IN-APP PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#0F0F12] border border-[#D4AF37]/40 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-[#F5F5F2]">
            {/* Top Gold Accent Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#8C2230] via-[#D4AF37] to-[#8C2230]" />

            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                  V
                </div>
                <div>
                  <span className="text-[0.625rem] text-[#D4AF37] uppercase tracking-widest font-bold block">
                    Vyomi Luxury Payment Gateway
                  </span>
                  <h3 className="text-base font-semibold text-white">
                    {selectedPackage?.name ?? 'Gold'} Tier · Admission Checkout
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all text-sm"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Amount Banner */}
            <div className="px-6 py-4 bg-[#141418] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[0.6875rem] text-[#A1A1AA] uppercase tracking-wider block">
                  Amount Due (Incl. 18% GST)
                </span>
                <span className="text-2xl font-bold nums text-[#D4AF37]">
                  {formatINR(pricing.total)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[0.625rem] text-white/40 uppercase block">Reference ID</span>
                <span className="text-xs font-mono font-semibold text-[#F5F5F2]">
                  {createdRegistrationRef || 'VY-2026-PENDING'}
                </span>
                <span className="text-[0.625rem] text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  256-Bit SSL Secured
                </span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex border-b border-white/10 bg-[#0C0C0E] text-xs">
              <button
                type="button"
                onClick={() => setPaymentTab('upi')}
                className={`flex-1 py-3 px-2 text-center font-semibold transition-all border-b-2 ${
                  paymentTab === 'upi'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.03]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                UPI / QR Code
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('card')}
                className={`flex-1 py-3 px-2 text-center font-semibold transition-all border-b-2 ${
                  paymentTab === 'card'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.03]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('netbanking')}
                className={`flex-1 py-3 px-2 text-center font-semibold transition-all border-b-2 ${
                  paymentTab === 'netbanking'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.03]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                NetBanking
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('sandbox')}
                className={`flex-1 py-3 px-2 text-center font-semibold transition-all border-b-2 ${
                  paymentTab === 'sandbox'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.03]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Test Cases ⚡
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {/* TAB 1: UPI */}
              {paymentTab === 'upi' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-[#141417] border border-white/10">
                    {/* High-res SVG QR Code */}
                    <div className="p-3 bg-white rounded-lg shadow-md flex flex-col items-center justify-center shrink-0">
                      <svg
                        className="w-32 h-32"
                        viewBox="0 0 100 100"
                        fill="black"
                      >
                        <rect x="0" y="0" width="30" height="30" fill="black" />
                        <rect x="5" y="5" width="20" height="20" fill="white" />
                        <rect x="10" y="10" width="10" height="10" fill="black" />
                        
                        <rect x="70" y="0" width="30" height="30" fill="black" />
                        <rect x="75" y="5" width="20" height="20" fill="white" />
                        <rect x="80" y="10" width="10" height="10" fill="black" />
                        
                        <rect x="0" y="70" width="30" height="30" fill="black" />
                        <rect x="5" y="75" width="20" height="20" fill="white" />
                        <rect x="10" y="80" width="10" height="10" fill="black" />
                        
                        <rect x="40" y="10" width="10" height="20" fill="black" />
                        <rect x="45" y="35" width="20" height="10" fill="black" />
                        <rect x="35" y="50" width="30" height="15" fill="black" />
                        <rect x="70" y="45" width="20" height="20" fill="black" />
                        <rect x="40" y="75" width="15" height="15" fill="black" />
                        <rect x="65" y="75" width="25" height="20" fill="black" />
                      </svg>
                      <span className="text-[0.625rem] text-black font-mono font-bold mt-1">
                        SCAN & PAY
                      </span>
                    </div>

                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2">
                        <UpiIconSvg className="w-5 h-5 text-[#D4AF37]" />
                        <span className="text-xs font-semibold text-white">Instant UPI Autopay</span>
                      </div>
                      <p className="text-xs text-white/60">
                        Scan the QR code with any UPI app on your phone, or enter your VPA / UPI ID below to receive a payment collect request.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[0.6875rem] text-[#D4AF37]">
                        <span>Google Pay</span> · <span>PhonePe</span> · <span>Paytm</span> · <span>BHIM</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1.5 uppercase tracking-wider">
                      Or Enter UPI ID / Virtual Payment Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. member@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="light-input !bg-[#141418] !border-white/15 !text-white flex-1"
                      />
                      <button
                        type="button"
                        disabled={paymentProcessing}
                        onClick={() => executePaymentVerification()}
                        className="btn-solid-light !h-11 !px-5 text-xs font-bold shrink-0"
                      >
                        {paymentProcessing ? 'Verifying...' : `Pay ${formatINR(pricing.total)}`}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {paymentTab === 'card' && (
                <div className="space-y-4">
                  {/* Luxury Card Preview */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#1C1C22] to-[#0A0A0C] border border-[#D4AF37]/30 shadow-lg text-[#F5F5F2] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[0.6875rem] uppercase tracking-widest text-[#D4AF37] font-semibold">
                        Vyomi VIP Titanium
                      </span>
                      <span className="text-xs font-mono font-bold text-white/60">VISA / MASTERCARD</span>
                    </div>
                    <div className="text-lg font-mono tracking-widest text-[#D4AF37]">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[0.625rem] text-white/40 uppercase block">Cardholder</span>
                        <span className="font-semibold text-white">{cardHolder || formData.fullName || 'MEMBER NAME'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[0.625rem] text-white/40 uppercase block">Expires</span>
                        <span className="font-semibold font-mono text-white">{cardExpiry || '12/28'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Test Card Helper */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('4111 1111 1111 1111');
                        setCardExpiry('12/28');
                        setCardCvv('777');
                        setCardHolder(formData.fullName || 'Aditya Varma');
                      }}
                      className="text-[0.6875rem] text-[#D4AF37] hover:underline cursor-pointer flex items-center gap-1 font-medium"
                    >
                      ⚡ Auto-fill Razorpay Test Card (4111 1111...)
                    </button>
                  </div>

                  {/* Card Inputs */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-white/80 mb-1 uppercase tracking-wider">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="16-digit card number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="light-input !bg-[#141418] !border-white/15 !text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1 uppercase tracking-wider">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="light-input !bg-[#141418] !border-white/15 !text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1 uppercase tracking-wider">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="3 or 4 digits"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="light-input !bg-[#141418] !border-white/15 !text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={paymentProcessing}
                    onClick={() => executePaymentVerification()}
                    className="w-full btn-solid-light !h-12 !text-xs font-bold tracking-wider mt-2"
                  >
                    {paymentProcessing ? 'Authorizing Transaction...' : `Authorize ${formatINR(pricing.total)} →`}
                  </button>
                </div>
              )}

              {/* TAB 3: NETBANKING */}
              {paymentTab === 'netbanking' && (
                <div className="space-y-4">
                  <span className="text-xs text-white/70 block">
                    Select your bank to proceed with direct net banking authorization:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded border text-left text-xs transition-all ${
                          selectedBank === bank
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-semibold'
                            : 'border-white/10 bg-[#141418] text-white/70 hover:border-white/20'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={paymentProcessing}
                    onClick={() => executePaymentVerification()}
                    className="w-full btn-solid-light !h-12 !text-xs font-bold tracking-wider mt-4"
                  >
                    {paymentProcessing ? 'Connecting Gateway...' : `Proceed to ${selectedBank} (${formatINR(pricing.total)}) →`}
                  </button>
                </div>
              )}

              {/* TAB 4: SANDBOX TEST CASES */}
              {paymentTab === 'sandbox' && (
                <div className="space-y-3">
                  <p className="text-xs text-white/70">
                    Direct integration diagnostics for Razorpay webhooks, status callbacks, and receipt generation:
                  </p>

                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      disabled={paymentProcessing}
                      onClick={() => executePaymentVerification()}
                      className="w-full p-3.5 rounded border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-all flex items-start gap-3"
                    >
                      <span className="text-emerald-400 font-bold text-base mt-0.5">✓</span>
                      <div>
                        <span className="text-xs font-semibold text-emerald-400 block">
                          Test Case 1: Verified Success (200 OK)
                        </span>
                        <span className="text-[0.6875rem] text-white/60">
                          Issues official Vyomi Membership ID, sends welcome confirmation, and redirects to VIP Welcome page.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={paymentProcessing}
                      onClick={() =>
                        executePaymentVerification({
                          simulateFailure: true,
                          failureReason: 'Card declined by issuing bank (Simulated Razorpay Test Case)',
                        })
                      }
                      className="w-full p-3.5 rounded border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-left transition-all flex items-start gap-3"
                    >
                      <span className="text-rose-400 font-bold text-base mt-0.5">✕</span>
                      <div>
                        <span className="text-xs font-semibold text-rose-400 block">
                          Test Case 2: Issuer Card Decline (402)
                        </span>
                        <span className="text-[0.6875rem] text-white/60">
                          Simulates bank decline / insufficient funds, logs audit record, and redirects to Payment Failed screen with retry options.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={paymentProcessing}
                      onClick={() =>
                        executePaymentVerification({
                          simulatePending: true,
                        })
                      }
                      className="w-full p-3.5 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-all flex items-start gap-3"
                    >
                      <span className="text-amber-400 font-bold text-base mt-0.5">⏳</span>
                      <div>
                        <span className="text-xs font-semibold text-amber-400 block">
                          Test Case 3: Gateway Delay / Pending (202)
                        </span>
                        <span className="text-[0.6875rem] text-white/60">
                          Simulates bank webhook reconciliation delay, and redirects to Payment Pending polling screen.
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[0.6875rem] text-white/40">Need live Razorpay popup?</span>
                    <button
                      type="button"
                      onClick={launchNativeRazorpay}
                      className="text-[0.6875rem] text-[#D4AF37] hover:underline"
                    >
                      Open Native Razorpay Popup →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0A0A0C] border-t border-white/10 flex items-center justify-between text-[0.6875rem] text-white/50">
              <div className="flex items-center gap-1.5">
                <SecurityLockBadge className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>PCI-DSS Level 1 · 256-Bit TLS Encryption</span>
              </div>
              <span>Vyomi Fitness Club, Vijayawada</span>
            </div>
          </div>
        </div>
      )}
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
