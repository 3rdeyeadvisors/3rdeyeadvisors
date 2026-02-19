import SEO from "@/components/SEO";
import NewsletterSignup from "@/components/NewsletterSignup";
import OrionChat from "@/components/orion/OrionChat";
import {
  GalaxyBackground,
  HeroSection,
  FeaturesSection,
  AboutSection,
  VaultSection,
  PricingSection,
  CTASection,
  WhoIsThisForSection,
  InstitutionalSection,
  Founding33Section,
} from "@/components/landing";

const Index = () => {
  return (
    <>
      <SEO 
        title="Everything Your Financial Advisor Won't Tell You"
        description="3rdeyeadvisors teaches complete beginners how to understand and use decentralized finance. Plain language. No hype. No gatekeeping. Used by individuals, families, financial advisors, and law firms."
        keywords="DeFi education, crypto for beginners, decentralized finance, blockchain basics, financial advisor crypto, cryptocurrency learning"
        url="https://www.the3rdeyeadvisors.com/"
        type="website"
        schema={{
          type: "Organization",
          data: {
            "@type": "Organization",
            "name": "3rdeyeadvisors",
            "description": "Expert DeFi education and cryptocurrency training platform",
            "url": "https://www.the3rdeyeadvisors.com",
            "sameAs": [
              "https://twitter.com/3rdeyeadvisors"
            ]
          }
        }}
      />
      
      <div className="min-h-screen relative">
        {/* Galaxy background */}
        <GalaxyBackground />
        
        {/* Main content */}
        <div className="relative z-10">
          <HeroSection />
          <FeaturesSection />
          <WhoIsThisForSection />
          <VaultSection />
          <AboutSection />
          <PricingSection />
          <Founding33Section />
          <InstitutionalSection />
          <CTASection />
          
          {/* Newsletter */}
          <section className="py-8 md:py-12 lg:py-16">
            <div className="max-w-4xl mx-auto px-6">
              <NewsletterSignup variant="cosmic" />
            </div>
          </section>
        </div>
        
        {/* Orion AI Assistant */}
        <OrionChat />
      </div>
    </>
  );
};

export default Index;
