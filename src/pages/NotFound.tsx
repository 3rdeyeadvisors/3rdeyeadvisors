import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <SEO
        title="Page Not Found | Sentinel DeFi"
        description="This page does not exist."
        url="https://www.sentineldefi.online/404"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    <div className="min-h-screen flex items-center justify-center py-20 bg-transparent">
      <div className="container mx-auto px-4 mobile-typography-center">
        <Card className="p-12 bg-white/3 border border-white/8 max-w-md mx-auto text-center">
          <Eye className="w-16 h-16 text-primary mx-auto mb-6 animate-cosmic-pulse" />
          <h1 className="text-6xl font-consciousness font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-consciousness font-semibold text-foreground mb-4">
            Path Not Found
          </h2>
          <p className="font-body text-white/50 mb-8 leading-relaxed">
            This route does not exist in our system. 
            Perhaps you meant to explore a different path to consciousness?
          </p>
          <Link to="/">
            <Button variant="cosmic" className="font-consciousness">
              <Home className="w-4 h-4 mr-2" />
              Return to Origin
            </Button>
          </Link>
        </Card>
      </div>
    </div>
    </>
  );
};

export default NotFound;
