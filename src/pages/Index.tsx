import SEO from "@/components/SEO";
import NewsletterSignup from "@/components/NewsletterSignup";
import OrionChat from "@/components/orion/OrionChat";
import {
  HeroSection,
  FeaturesSection,
  AboutSection,
  PricingSection,
  CTASection,
  WhoIsThisForSection,
  InstitutionalSection,
} from "@/components/landing";

const Index = () => {
  return (
    <>
      <SEO 
        title="Everything Your Financial Advisor Won't Tell You"
        description="Sentinel DeFi teaches complete beginners how to understand and use decentralized finance. Plain language. No hype. No gatekeeping. Used by individuals, families, financial advisors, and law firms."
        keywords="DeFi education, crypto for beginners, decentralized finance, blockchain basics, financial advisor crypto, cryptocurrency learning"
        url="https://www.sentineldefi.online/"
        type="website"
        schema={{
          type: "Organization",
          data: {
            "@type": "Organization",
            "name": "Sentinel DeFi",
            "description": "Expert DeFi education and cryptocurrency training platform",
            "url": "https://www.sentineldefi.online",
            "sameAs": [
              "https://twitter.com/sentineldefi"
            ]
          }
        }}
      />
      
      <div className="min-h-screen relative">
        {/* Main content */}
        <div className="relative z-10">
          <HeroSection />
          <FeaturesSection />
          <WhoIsThisForSection />
          <AboutSection />
          <PricingSection />
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
