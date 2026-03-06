import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, X, RefreshCw, Shield, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/contexts/CartContext";
import SEO from "@/components/SEO";
import { MerchandiseCard } from "@/components/store/MerchandiseCard";
import { NFTStoreCard } from "@/components/store/NFTStoreCard";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PageHero from "@/components/PageHero";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh";
import { isAdminEmail } from "@/lib/admin";

type StoreCategory = 'merchandise' | 'digital';

const Store = () => {
  const { addItem, items, clearCart } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [printifyProducts, setPrintifyProducts] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState<StoreCategory>('merchandise');

  const handleAddToCart = (product: any) => {
    
    // Ensure image is a string, not an array
    const imageUrl = product.image || 
                     (product.images?.[0]?.src) || 
                     (Array.isArray(product.images) ? product.images[0] : product.images);
    
    const cartItem = {
      id: product.id || product.printify_id,
      title: product.title,
      price: typeof product.price === 'string' ? parseFloat(product.price.replace('$', '')) : product.price,
      type: product.type,
      category: product.category,
      printify_id: product.printify_id,
      printify_product_id: product.printify_product_id || product.printify_id,
      variant_id: product.variant_id,
      color: product.color,
      size: product.size,
      image: imageUrl,
      variants: product.variants,
      images: product.images
    };
    
    addItem(cartItem);
    toast.success(`${product.title} added to cart!`);
  };

  const syncPrintifyProducts = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-printify-products');
      
      if (error) throw error;
      
      toast.success(`Synced ${data.synced} products from Printify! Now syncing to Stripe...`);
      
      // Now sync to Stripe
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('sync-printify-to-stripe');
      
      if (stripeError) throw stripeError;
      
      if (stripeData.success) {
        toast.success(`${stripeData.synced} products synced to Stripe with images!`);
        loadPrintifyProducts();
      }
    } catch (error) {
      console.error('Error syncing Printify products:', error);
      toast.error('Failed to sync Printify products');
    } finally {
      setIsSyncing(false);
    }
  };

  const loadPrintifyProducts = async () => {
    try {
      // Use secure public view that excludes pricing strategy data
      const { data, error } = await supabase
        .from('printify_products_public')
        .select('*');
      
      if (error) throw error;
      
      const formattedProducts = data?.map(product => ({
        ...product,
        id: product.printify_id,
        price: product.variants?.[0]?.price || 0,
        type: "merchandise",
        category: "Apparel",
        icon: Package,
        features: Array.isArray(product.variants) ? product.variants.map((v: any) => `${v.title}: $${v.price}`) : []
      })) || [];
      
      setPrintifyProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading Printify products:', error);
    }
  };

  const isInCart = (productId: string | number) => {
    return items.some(item => item.id == productId || item.id == productId.toString());
  };

  // Check admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Explicitly allow the requested admin email
      if (isAdminEmail(user.email)) {
        setIsAdmin(true);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data);
    };

    checkAdminRole();
  }, [user]);

  // Load products on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    if (success) {
      setShowSuccessMessage(true);
      clearCart(); // Clear cart after successful payment
      toast.success("Payment successful! Thank you for your purchase!");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled) {
      toast.error("Payment was canceled");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    setIsLoading(true);
    loadPrintifyProducts().finally(() => setIsLoading(false));
  }, [clearCart]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await loadPrintifyProducts();
    toast.success("Products refreshed!");
  }, []);

  const { isRefreshing, pullDistance, isTriggered } = usePullToRefresh({
    onRefresh: handleRefresh
  });


  return (
    <>
      <SEO 
        title="Store | Sentinel DeFi"
        description="Consciousness-inspired merchandise and premium apparel. Support your journey with Sentinel DeFi branded products."
        keywords="consciousness merchandise, spiritual apparel, Sentinel DeFi store"
        url="https://www.sentineldefi.online/store"
        type="website"
      />
      <PullToRefreshIndicator 
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        isTriggered={isTriggered}
      />
      <div className="min-h-screen bg-transparent relative overflow-hidden">
        {/* Nebula Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Merch"
          title="Represent the Movement"
          subtitle="Consciousness-inspired apparel and accessories for the decentralized generation."
        />

        <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
          <div className="flex justify-center mb-12 -mt-4">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-4 py-2 rounded-full">
              <Package className="w-4 h-4" />
              <span className="font-body text-xs uppercase tracking-widest">Free Shipping on All Orders</span>
            </div>
          </div>

          {/* Category Toggle Buttons */}
          <div className="flex justify-center gap-3 mb-16">
            {[
              { id: 'merchandise', label: 'Physical Products', icon: Package },
              { id: 'digital', label: 'Digital Collectibles', icon: Sparkles },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`font-body text-xs uppercase tracking-widest px-8 py-3 rounded-full border transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-900/20"
                    : "border-white/15 text-white/50 hover:border-violet-500/30 hover:text-white/80 bg-transparent"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <Card className="mb-8 p-6 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-consciousness font-semibold text-green-800 dark:text-green-200">
                      Purchase Successful!
                    </h3>
                    <p className="text-green-700 dark:text-green-300 font-consciousness">
                      Thank you for your purchase! Check your email for order confirmation and delivery details.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Physical Merchandise Section */}
          {activeCategory === 'merchandise' && (
            <section aria-labelledby="merchandise-heading">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="flex items-center justify-center gap-3">
                  <Package className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h2 id="merchandise-heading" className="text-2xl font-consciousness font-bold text-white">
                    Physical Merchandise
                  </h2>
                </div>
                {isAdmin && (
                  <Button 
                    onClick={syncPrintifyProducts} 
                    disabled={isSyncing}
                    variant="outline"
                    size="sm"
                    className="gap-2 font-consciousness touch-target self-start sm:self-auto"
                    aria-label="Sync merchandise products"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
                    {isSyncing ? 'Syncing...' : 'Sync Products'}
                  </Button>
                )}
              </div>

              {(() => {
                const filteredProducts = printifyProducts;

                if (isLoading) {
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="overflow-hidden animate-pulse">
                          <div className="aspect-square bg-white/5" />
                          <div className="p-4 space-y-3">
                            <div className="h-5 bg-white/5 rounded w-3/4" />
                            <div className="h-4 bg-white/5 rounded w-1/2" />
                            <div className="h-10 bg-white/5 rounded w-full mt-4" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  );
                }

                if (filteredProducts.length === 0) {
                  return (
                    <Card className="p-8 md:p-12 text-center border-2 bg-white/3 backdrop-blur">
                      <Package className="h-12 w-12 md:h-16 md:w-16 text-white/50 mx-auto mb-4" aria-hidden="true" />
                      <h3 className="text-lg md:text-xl font-consciousness font-semibold mb-2">
                        No Merchandise Available
                      </h3>
                      <p className="text-sm md:text-base text-white/50 font-consciousness mb-6">
                        Check back soon for new products!
                      </p>
                      {isAdmin && (
                        <Button 
                          onClick={syncPrintifyProducts} 
                          disabled={isSyncing}
                          variant="outline"
                          className="gap-2 font-consciousness touch-target"
                          aria-label="Sync merchandise products from Printify"
                        >
                          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
                          {isSyncing ? 'Syncing...' : 'Sync Products'}
                        </Button>
                      )}
                    </Card>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {filteredProducts.map((product: any) => (
                      <MerchandiseCard 
                        key={product.id} 
                        product={product}
                        onAddToCart={handleAddToCart}
                        isInCart={isInCart}
                      />
                    ))}
                  </div>
                );
              })()}
            </section>
          )}

          {/* Digital Collectibles / NFT Section */}
          {activeCategory === 'digital' && (
            <section aria-labelledby="nft-heading">
              <div className="flex items-center justify-center gap-3 mb-8">
                <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
                <h2 id="nft-heading" className="text-2xl font-consciousness font-bold text-white">
                  Digital Collectibles
                </h2>
              </div>
              
              {/* Single NFT - centered with max width for professional look */}
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <NFTStoreCard />
                </div>
              </div>
              
              <p className="text-sm text-white/50 font-consciousness mt-6 text-center">
                Complete your purchase on Thirdweb with your wallet.
              </p>
            </section>
          )}

          <Card className="mt-12 md:mt-16 p-6 md:p-8 bg-secondary/40 border-white/8" role="region" aria-label="Payment information">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
              <Shield className="h-8 w-8 text-primary flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-lg font-consciousness font-semibold text-white mb-2">
                  Secure Payment Processing
                </h3>
                <p className="text-white/50 font-consciousness leading-relaxed">
                  Merchandise is automatically fulfilled with 5 to 7 business day processing and shipping. We accept all major payment methods.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Store;
