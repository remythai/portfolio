// import { CompanyInfoSection } from "@/components/sections/CompanyInfoSection";
// import { ContactFormSection } from "@/components/sections/ContactFormSection";
import { IntroductionHeroSection } from "@/components/sections/IntroductionHeroSection"
// import { ProjectGallerySection } from "@/components/sections/ProjectGallerySection";
// import { SkillsAndExperienceSection } from "@/components/sections/SkillsAndExperienceSection";
// import { SocialMediaFooterSection } from "@/components/sections/SocialMediaFooterSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <IntroductionHeroSection />
      {/* <CompanyInfoSection /> */}
      {/* <SkillsAndExperienceSection />
      <ProjectGallerySection />
      <ContactFormSection />
      <SocialMediaFooterSection /> */}
    </main>
  );
}