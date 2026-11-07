'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CredentialMarquee from '@/components/CredentialMarquee';
import StatsSection from '@/components/StatsSection';
import PanattaSection from '@/components/PanattaSection';
import StudioEntryPoint from '@/components/StudioEntryPoint';
import CoachesSection from '@/components/CoachesSection';
import ClassesTimetable from '@/components/ClassesTimetable';
import WalkTheFloor from '@/components/WalkTheFloor';
import WellnessSection from '@/components/WellnessSection';
import BmiCalculator from '@/components/BmiCalculator';
import CommunitySection from '@/components/CommunitySection';
import FaqSection from '@/components/FaqSection';
import LocationSection from '@/components/LocationSection';
import Footer from '@/components/Footer';
import InquiryModal from '@/components/InquiryModal';

export default function Home() {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <Header onOpenInquiry={() => setInquiryModalOpen(true)} />

      {/* Main Page Flow */}
      <main className="relative w-full bg-[var(--ink)] text-[var(--bone)]">
        {/* Hero Section with Quiet Opening */}
        <Hero onOpenInquiry={() => setInquiryModalOpen(true)} />

        {/* Credential Marquee Strip */}
        <CredentialMarquee />

        {/* Stats Section with Restraint */}
        <StatsSection />

        {/* Facilities & Equipment (The Panatta Floor) */}
        <PanattaSection />

        {/* Studio Entry Point: 60vh band with Glass Bar linking to /studio */}
        <StudioEntryPoint />

        {/* Coaches Section: Rebuilt with Quiet Luxury Styling */}
        <CoachesSection />

        {/* Classes & Timetable */}
        <ClassesTimetable />

        {/* Walk the Floor: Architectural Layout */}
        <WalkTheFloor />

        {/* Wellness & Recovery */}
        <WellnessSection />

        {/* BMI Assessment Instrument */}
        <BmiCalculator />

        {/* Community Voices & Instagram Strip */}
        <CommunitySection />

        {/* FAQ Accordion */}
        <FaqSection />

        {/* Location & Map */}
        <LocationSection />
      </main>

      {/* Footer & Mobile Bottom Bar */}
      <Footer onOpenInquiry={() => setInquiryModalOpen(true)} />

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </>
  );
}
