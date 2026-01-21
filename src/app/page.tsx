import { ContactFormSection } from "@/components/sections/ContactFormSection";
import { IntroductionHeroSection } from "@/components/sections/IntroductionHeroSection"
import { EducationSection } from "@/components/sections/EducationSection";
import { ProjectGallerySection } from "@/components/sections/ProjectGallerySection";
import { SkillsAndExperienceSection } from "@/components/sections/SkillsAndExperienceSection";
import { SocialMediaFooterSection } from "@/components/sections/SocialMediaFooterSection";
import { FloatingNav } from "@/components/layout/FloatingNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <IntroductionHeroSection />
      <EducationSection />
      <SkillsAndExperienceSection />
      <ProjectGallerySection />
      <ContactFormSection />
      <SocialMediaFooterSection />
      <FloatingNav />
    </main>
  );
}
