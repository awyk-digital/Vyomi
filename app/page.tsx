import Hero from '@/components/Hero';
import EditorialStatement from '@/components/EditorialStatement';
import ExploreGallery from '@/components/ExploreGallery';
import EquipmentSection from '@/components/EquipmentSection';
import TrainersSection from '@/components/TrainersSection';
import ClassesSection from '@/components/ClassesSection';
import WellnessSection from '@/components/WellnessSection';
import BmiCalculator from '@/components/BmiCalculator';
import TrialSection from '@/components/TrialSection';
import WhatsAppEnquiry from '@/components/WhatsAppEnquiry';
import LocationSection from '@/components/LocationSection';
import Footer from '@/components/Footer';

/**
 * Homepage, in the order set by the brief.
 *
 * A server component: every section owns its own interactive state, so no
 * client boundary is needed at the page level.
 *
 * No FAQ section and no membership pricing anywhere, by instruction.
 */
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <EditorialStatement />
        <ExploreGallery />
        <EquipmentSection />
        <TrainersSection />
        <ClassesSection />
        <WellnessSection />
        <BmiCalculator />
        <TrialSection />
        <WhatsAppEnquiry />
        <LocationSection />
      </main>
      <Footer />
    </>
  );
}
