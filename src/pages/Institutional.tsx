import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, BookOpen, Users, Building, GraduationCap, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import AnimatedSection from '@/components/landing/AnimatedSection';

const Institutional = () => {
  return (
    <>
      <SEO
        title="DeFi Education for Financial Professionals | Sentinel DeFi"
        description="Help your clients navigate crypto with confidence. White-label DeFi education for financial advisors, law firms, accountants, and educational institutions."
        keywords="DeFi education financial advisors, crypto education professionals, institutional DeFi training, blockchain education firms"
        url="https://www.sentineldefi.online/institutional"
      />

      <div className="min-h-screen bg-transparent relative">
        <div className="relative z-10">

          {/* Hero */}
          <section className="pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="font-body text-xs uppercase tracking-widest text-violet-300">For Financial Professionals</span>
            </div>

            <h1 className="font-consciousness text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your Clients Are Already<br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-blue-500 bg-clip-text text-transparent">
                In Crypto
              </span>
            </h1>

            <p className="font-body text-xl text-white/60 mb-6 max-w-3xl mx-auto leading-relaxed">
              Financial advisors, lawyers, and accountants across the country are watching high-value clients move money into digital assets they cannot explain, track, or advise on. That gap is a liability.
            </p>

            <p className="font-body text-lg text-white/40 mb-12 max-w-2xl mx-auto">
              Sentinel DeFi gives your team and your clients the structured education to navigate decentralized finance with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="font-body bg-violet-600 hover:bg-violet-500 text-white px-8 py-6 text-base font-semibold rounded-xl transition-all hover:scale-105 min-w-[220px]">
                  Talk to Us About Your Organization
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="outline" className="font-body border-white/20 hover:border-violet-500/40 hover:bg-violet-500/5 text-white/80 hover:text-white px-8 py-6 text-base rounded-xl transition-all min-w-[220px]">
                  Preview the Curriculum
                </Button>
              </Link>
            </div>
          </section>

          {/* The Reality */}
          <section className="py-12 md:py-16 px-6 max-w-6xl mx-auto">
            <AnimatedSection animation="fade-up">
              <div className="text-center mb-12">
                <span className="font-body text-xs uppercase tracking-widest text-violet-400 mb-4 block">The Reality</span>
                <h2 className="font-consciousness text-3xl md:text-4xl font-bold text-white mb-4">
                  The Knowledge Gap Is Getting Wider
                </h2>
                <p className="font-body text-white/50 max-w-2xl mx-auto">
                  Digital assets are no longer a fringe conversation. They are showing up in estate planning, divorce proceedings, business valuations, and retirement portfolios. Professionals who cannot speak to them are losing credibility and clients.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: FileText,
                  stat: "$2.3T",
                  label: "In digital assets held by US households",
                  body: "Estate attorneys are now regularly encountering crypto holdings with no clear ownership documentation or transfer mechanism."
                },
                {
                  icon: Users,
                  stat: "67%",
                  label: "Of HNW clients have crypto exposure",
                  body: "High net worth individuals under 50 are overwhelmingly holding digital assets. Many have not disclosed this to their financial advisors."
                },
                {
                  icon: Shield,
                  stat: "$0",
                  label: "Insurance coverage for most wallet losses",
                  body: "Without proper education, clients make self-custody mistakes that result in permanent, unrecoverable losses. The liability exposure is real."
                }
              ].map((item, i) => (
                <AnimatedSection key={i} animation="fade-up" delay={i * 100}>
                  <div className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-violet-500/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <p className="font-consciousness text-3xl font-bold text-violet-400 mb-1">{item.stat}</p>
                    <p className="font-body text-xs uppercase tracking-widest text-white/40 mb-3">{item.label}</p>
                    <p className="font-body text-sm text-white/50 leading-relaxed">{item.body}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>

          {/* Who This Is For */}
          <section className="py-12 md:py-16 px-6 max-w-6xl mx-auto">
            <AnimatedSection animation="fade-up">
              <div className="text-center mb-12">
                <span className="font-body text-xs uppercase tracking-widest text-violet-400 mb-4 block">Who We Serve</span>
                <h2 className="font-consciousness text-3xl md:text-4xl font-bold text-white mb-4">
                  Built for Your Practice
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Building,
                  title: "Financial Advisory Firms",
                  body: "Equip your advisors to speak confidently about digital assets in client meetings. Understand portfolio diversification into crypto, tax implications, and custody options. Stop deflecting and start advising.",
                  points: ["Client portfolio digital asset exposure", "Crypto tax planning basics", "Self-custody vs exchange custody risk", "DeFi yield as an alternative asset class"]
                },
                {
                  icon: FileText,
                  title: "Law Firms and Estate Attorneys",
                  body: "Digital assets in estate planning, divorce proceedings, and business valuations require specific knowledge. Understand ownership structures, recovery mechanisms, and transfer procedures before you need them.",
                  points: ["Wallet ownership and inheritance", "Smart contract legal frameworks", "Digital asset valuation methods", "Recovery and probate procedures"]
                },
                {
                  icon: GraduationCap,
                  title: "Educational Institutions",
                  body: "Finance, law, and business programs are behind the curve on digital assets. License our curriculum for classroom use or offer it as a certificate program to your students and alumni.",
                  points: ["Structured curriculum with assessments", "Progress tracking per student", "Certificate of completion", "Bulk licensing available"]
                },
                {
                  icon: Users,
                  title: "Accounting Practices",
                  body: "Crypto tax treatment, DeFi income classification, and on-chain transaction auditing are now core competencies for any practice serving modern clients. We make the foundation accessible.",
                  points: ["DeFi income and tax treatment", "On-chain transaction records", "Staking and yield classification", "NFT and digital asset auditing"]
                }
              ].map((item, i) => (
                <AnimatedSection key={i} animation="fade-up" delay={i * 80}>
                  <div className="bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8 hover:border-violet-500/20 transition-all h-full">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-consciousness text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="font-body text-sm text-white/50 leading-relaxed mb-5">{item.body}</p>
                    <ul className="space-y-2">
                      {item.points.map((point, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                          <span className="font-body text-sm text-white/60">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>

          {/* What They Get */}
          <section className="py-12 md:py-16 px-6 max-w-4xl mx-auto">
            <AnimatedSection animation="fade-up">
              <div className="text-center mb-12">
                <span className="font-body text-xs uppercase tracking-widest text-violet-400 mb-4 block">The Platform</span>
                <h2 className="font-consciousness text-3xl md:text-4xl font-bold text-white mb-4">
                  Everything Your Team Needs
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: BookOpen, label: "Five complete courses from foundational to advanced" },
                { icon: Shield, label: "Security training to protect client assets" },
                { icon: Users, label: "Team accounts with individual progress tracking" },
                { icon: GraduationCap, label: "Certificates of completion for compliance records" },
                { icon: FileText, label: "Downloadable reference materials and PDFs" },
                { icon: Building, label: "Dedicated support for institutional accounts" },
              ].map((item, i) => (
                <AnimatedSection key={i} animation="fade-up" delay={i * 60}>
                  <div className="flex items-start gap-4 p-5 bg-white/3 border border-white/8 rounded-xl hover:border-violet-500/20 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 flex-shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <p className="font-body text-sm text-white/70 leading-relaxed">{item.label}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 md:py-16 px-6 max-w-3xl mx-auto text-center">
            <AnimatedSection animation="fade-up">
              <div className="bg-gradient-to-b from-violet-950/30 to-black border border-violet-500/20 rounded-3xl p-6 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-500/8 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="font-consciousness text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Close the Gap?
                  </h2>
                  <p className="font-body text-white/50 mb-8 max-w-xl mx-auto leading-relaxed">
                    Reach out to discuss team pricing, curriculum licensing, or a custom onboarding plan for your organization.
                  </p>
                  <Link to="/contact">
                    <Button className="font-body bg-violet-600 hover:bg-violet-500 text-white px-8 py-6 text-base font-semibold rounded-xl transition-all hover:scale-105">
                      Get in Touch
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <p className="font-body text-xs text-white/40 mt-4">
                    We respond to every inquiry within one business day.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </section>

        </div>
      </div>
    </>
  );
};

export default Institutional;
