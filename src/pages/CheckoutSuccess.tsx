import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const type = searchParams.get('type') || 'subscription';
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isFounding33 = type === 'founding33';

  return (
    <>
      <SEO
        title="Welcome to Sentinel DeFi"
        description="Your membership is confirmed. Start learning DeFi today."
        url="https://www.sentineldefi.online/checkout/success"
      />
      <div className="min-h-screen bg-transparent flex items-center justify-center px-6">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div
          className={`relative z-10 max-w-lg w-full text-center transition-all duration-700 ${
            show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Success icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-violet-400" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-consciousness text-3xl md:text-4xl font-bold text-white mb-4">
            You Are In.
          </h1>

          <p className="font-body text-lg text-white/60 mb-8 leading-relaxed">
            Your {plan === 'annual' ? 'annual' : 'monthly'} membership is active. Your 14 day free trial starts now.
          </p>

          {/* What to do next */}
          <div className="text-left mb-8 p-6 rounded-2xl border border-white/8 bg-white/3">
            <p className="font-consciousness text-sm uppercase tracking-widest text-violet-400 mb-4">Start Here</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-body text-xs text-violet-400 font-bold">1</span>
                </div>
                <p className="font-body text-sm text-white/70">Head to Courses and start with DeFi Foundations. It is built for complete beginners.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-body text-xs text-violet-400 font-bold">2</span>
                </div>
                <p className="font-body text-sm text-white/70">Set up your wallet using our Wallet Setup Tutorial. This is the most important first step.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-body text-xs text-violet-400 font-bold">3</span>
                </div>
                <p className="font-body text-sm text-white/70">Join the community. Ask questions. The platform is community run and people here want you to succeed.</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/courses" className="flex-1">
              <Button className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 gap-2">
                <BookOpen className="w-4 h-4" />
                Start Learning
              </Button>
            </Link>
            <Link to="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full font-body border-white/15 hover:border-violet-500/40 hover:bg-violet-500/5 text-white/80 rounded-xl py-6 gap-2">
                <Users className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutSuccess;