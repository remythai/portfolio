import { ContactFormSection } from "@/components/sections/ContactFormSection";
import { HeroSection } from "@/components/sections/HeroSection"
import { EducationSection } from "@/components/sections/EducationSection";
import { ProjectGallerySection } from "@/components/sections/ProjectGallerySection";
import { SkillsAndExperienceSection } from "@/components/sections/SkillsAndExperienceSection";
import { Footer } from "@/components/sections/Footer";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { Navbar } from "@/components/layout/Navbar"; // ← AJOUTE

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <EducationSection />
      <SkillsAndExperienceSection />
      <ProjectGallerySection />
      <ContactFormSection />
      <Footer />
      {/* <FloatingNav /> */}
    </main>
  );
}
