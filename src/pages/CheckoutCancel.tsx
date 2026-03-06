import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

const CheckoutCancel = () => {
  return (
    <>
      <SEO
        title="Checkout Canceled"
        description="Your checkout was canceled. Your spot is still available."
        url="https://www.sentineldefi.online/checkout/cancel"
      />
      <div className="min-h-screen bg-transparent flex items-center justify-center px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/2 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-white/40" />
            </div>
          </div>

          <h1 className="font-consciousness text-3xl font-bold text-white mb-4">
            No Problem.
          </h1>

          <p className="font-body text-lg text-white/50 mb-8 leading-relaxed">
            Your checkout was canceled. Nothing was charged. Your spot is still available whenever you are ready.
          </p>

          <div className="p-5 rounded-2xl border border-white/8 bg-white/3 mb-8 text-left">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <p className="font-body text-sm text-white/50">
                If something went wrong during checkout or you have a question about membership, reach out to us at{' '}
                <a href="mailto:info@the3rdeyeadvisors.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                  info@the3rdeyeadvisors.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/subscription" className="flex-1">
              <Button className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6">
                Try Again
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full font-body border-white/15 hover:border-white/25 text-white/70 rounded-xl py-6 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutCancel;