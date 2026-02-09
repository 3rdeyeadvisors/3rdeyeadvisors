import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, Tag, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CartItem = ({ item }: { item: any }) => {
  const { removeItem, updateQuantity, addItem, items } = useCart();
  const [productData, setProductData] = useState<any>(null);
  const [variantUpdated, setVariantUpdated] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadProductData = async () => {
      if (item.type === "merchandise" && item.printify_product_id) {
        // Use secure public view that excludes pricing strategy data
        const { data } = await supabase
          .from('printify_products_public')
          .select('*')
          .eq('printify_id', item.printify_product_id)
          .maybeSingle();
        
        if (data) {
          setProductData(data);
        }
      }
    };
    loadProductData();
  }, [item]);

  const getVariantStock = (variant: any): { available: boolean; isLow: boolean; count?: number } => {
    // Check if variant has stock information
    if (variant.is_available === false) {
      return { available: false, isLow: false };
    }
    
    // If we have quantity info, check it
    if (variant.quantity !== undefined) {
      const stock = parseInt(variant.quantity);
      return {
        available: stock > 0,
        isLow: stock > 0 && stock < 5,
        count: stock
      };
    }
    
    // Default to available if no stock info
    return { available: true, isLow: false };
  };

  const handleVariantChange = async (newVariantId: string) => {
    if (!productData || isUpdating) return;
    
    setIsUpdating(true);
    setVariantError(null);
    
    try {
      const newVariant = productData.variants.find((v: any) => v.id.toString() === newVariantId);
      if (!newVariant) {
        setVariantError("Variant not found");
        return;
      }

      // Check stock availability
      const stockInfo = getVariantStock(newVariant);
      if (!stockInfo.available) {
        setVariantError("That variant is sold out. Please choose another.");
        return;
      }

      const [color, size] = newVariant.title.split(' / ');
      const newItemId = `${item.printify_product_id}-${newVariant.id}`;
      const currentQuantity = item.quantity;
      const oldVariantId = item.variant_id;
      const oldPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const newPrice = newVariant.price;
      
      // Find the correct image for this variant
      const variantImage = productData.images?.find((img: any) => 
        img.variant_ids?.includes(newVariant.id)
      )?.src || productData.images?.[0]?.src;

      // Check if this new variant already exists in cart
      const existingItem = items.find(cartItem => 
        cartItem.id === newItemId && cartItem.id !== item.id
      );

      // Track the change
      trackEvent('cart_variant_changed', 'cart', newItemId, Math.round((newPrice - oldPrice) * 100));

      if (existingItem) {
        // Merge with existing item
        updateQuantity(newItemId, existingItem.quantity + currentQuantity);
        removeItem(item.id);
        toast.success("Quantities merged!", {
          description: `${currentQuantity} items added to existing variant`
        });
      } else {
        // Update current item with new variant
        removeItem(item.id);
        addItem({
          id: newItemId,
          printify_id: item.printify_product_id,
          printify_product_id: item.printify_product_id,
          variant_id: newVariant.id,
          title: item.title,
          price: newPrice,
          type: "merchandise",
          category: "Apparel",
          color: color,
          size: size,
          image: variantImage,
        });
        
        // Add remaining quantity if more than 1
        for (let i = 1; i < currentQuantity; i++) {
          addItem({
            id: newItemId,
            printify_id: item.printify_product_id,
            printify_product_id: item.printify_product_id,
            variant_id: newVariant.id,
            title: item.title,
            price: newPrice,
            type: "merchandise",
            category: "Apparel",
            color: color,
            size: size,
            image: variantImage,
          });
        }
      }

      setVariantUpdated(true);
      setTimeout(() => setVariantUpdated(false), 1500);
      
    } catch (error) {
      console.error('Error changing variant:', error);
      setVariantError("Failed to update variant. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const isMerchandise = item.type === "merchandise" && productData;

  // Get current variant's stock info
  const currentVariantStock = isMerchandise && item.variant_id 
    ? getVariantStock(productData.variants.find((v: any) => v.id === item.variant_id))
    : { available: true, isLow: false };

  return (
    <Card className="p-4 md:p-6">
      {/* Accessibility: Live region for updates */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {variantUpdated && "Cart updated with new variant"}
        {variantError && `Error: ${variantError}`}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          {/* Image - Fixed aspect ratio to prevent CLS */}
          <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {item.image ? (
              <img 
                src={item.image} 
                alt={`${item.title} product image`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.error('Image failed to load:', item.image);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-consciousness font-semibold text-foreground mb-1 truncate">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground font-consciousness mb-2">
              {item.category} • {item.type}
            </p>
            {item.color && item.size && (
              <p className="text-xs text-muted-foreground font-consciousness">
                {item.color} / {item.size}
              </p>
            )}
          </div>

          <div className="flex md:hidden items-start">
            <p className="text-lg font-consciousness font-semibold text-primary whitespace-nowrap">
              ${typeof item.price === 'string' ? item.price : item.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Variant Selectors for Merchandise */}
        {isMerchandise && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="flex-1 w-full sm:w-auto">
                <Label htmlFor={`variant-${item.id}`} className="sr-only">
                  Change variant
                </Label>
                <Select 
                  value={item.variant_id?.toString()} 
                  onValueChange={handleVariantChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger 
                    id={`variant-${item.id}`}
                    className="w-full sm:min-w-[200px] h-10"
                    aria-label="Select size and color variant"
                  >
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {productData.variants?.map((variant: any) => {
                      const stock = getVariantStock(variant);
                      return (
                        <SelectItem 
                          key={variant.id} 
                          value={variant.id.toString()}
                          disabled={!stock.available}
                          className="text-sm"
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span>{variant.title}</span>
                            <span className="font-semibold">${variant.price}</span>
                            {!stock.available && (
                              <span className="text-xs text-destructive ml-2">(Sold Out)</span>
                            )}
                            {stock.isLow && stock.available && (
                              <span className="text-xs text-orange-600 dark:text-orange-400 ml-2">
                                (Low Stock)
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              {variantUpdated && (
                <span 
                  className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 min-w-fit"
                  role="status"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Updated ✓
                </span>
              )}
            </div>

            {/* Stock warning */}
            {currentVariantStock.isLow && (
              <Alert variant="default" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Low stock - only {currentVariantStock.count} remaining
                </AlertDescription>
              </Alert>
            )}

            {/* Variant error */}
            {variantError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {variantError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="hidden md:block">
            <p className="text-lg font-consciousness font-semibold text-primary">
              ${typeof item.price === 'string' ? item.price : item.price.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Quantity Controls - Touch-friendly size */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="h-11 w-11 touch-manipulation"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-10 text-center font-consciousness font-medium" aria-label={`Quantity: ${item.quantity}`}>
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="h-11 w-11 touch-manipulation"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Remove Button - Touch-friendly */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
              className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
              aria-label="Remove item from cart"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Cart = () => {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  
  // Check cart item types for conditional messaging
  const hasDigitalItems = items.some(item => !item.variant_id);
  const hasMerchandiseItems = items.some(item => item.variant_id);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    try {
      const { data, error } = await supabase.rpc('validate_discount_code', {
        _code: discountCode.toUpperCase(),
        _amount: Math.floor(total),
        _product_type: 'all'
      }).single();

      if (error) throw error;

      if (data?.is_valid) {
        setDiscountApplied(true);
        setDiscountAmount(data.discount_amount);
        toast.success(data.message);
      } else {
        toast.error(data?.message || "Invalid discount code");
      }
    } catch (error) {
      console.error('Error validating discount:', error);
      toast.error("Failed to validate discount code");
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const checkoutItems = items.map(item => {
        const checkoutItem = {
          id: item.id,
          title: item.title,
          price: typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price,
          quantity: item.quantity,
          type: item.type,
          category: item.category,
          images: item.images,
          printify_id: item.printify_id,
          printify_product_id: item.printify_product_id || item.printify_id,
          variant_id: item.variant_id,
          color: item.color,
          size: item.size,
          image: item.image
        };
        
        return checkoutItem;
      });

      
      const { data, error } = await supabase.functions.invoke('create-cart-checkout', {
        body: {
          items: checkoutItems,
          discountCode: discountApplied ? discountCode : null,
          userId: user?.id // Pass user ID to checkout
        }
      });


      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received:', data);
        toast.error('Failed to create checkout session - no URL returned');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  const finalTotal = discountApplied ? Math.max(0, total - discountAmount) : total;

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 mobile-typography-center">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-consciousness font-bold text-foreground mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground font-consciousness mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. 
              Explore our store to find digital products and merchandise.
            </p>
            <Link to="/store">
              <Button variant="cosmic" className="font-consciousness">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 w-full overflow-x-hidden">
      <div className="container mx-auto px-4 mobile-typography-center w-full max-w-6xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-consciousness font-bold text-foreground mb-6 sm:mb-8">
          Shopping Cart
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 w-full">
            {items.map((item) => <CartItem key={item.id} item={item} />)}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-consciousness font-bold text-foreground mb-6">
                Order Summary
              </h2>

              {/* Conditional messaging based on cart contents */}
              {hasDigitalItems && !hasMerchandiseItems && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-sm text-purple-800 dark:text-purple-200 font-consciousness">
                    📧 Digital products will be delivered to your email
                  </p>
                </div>
              )}
              
              {!hasDigitalItems && hasMerchandiseItems && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-consciousness">
                    📦 Physical items will be shipped to your address
                  </p>
                </div>
              )}
              
              {hasDigitalItems && hasMerchandiseItems && (
                <div className="mb-4 space-y-2">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <p className="text-sm text-purple-800 dark:text-purple-200 font-consciousness">
                      📧 Digital items: Delivered via email
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-consciousness">
                      📦 Merchandise: Shipped to your address
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="font-consciousness text-muted-foreground">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="font-consciousness font-medium">
                      ${((typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Discount Code Section */}
              <div className="border-t pt-4 mb-4">
                <Label htmlFor="discount" className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" />
                  <span className="font-consciousness">Discount Code</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="discount"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    disabled={discountApplied}
                    className="uppercase"
                  />
                  <Button 
                    onClick={handleApplyDiscount}
                    variant={discountApplied ? "secondary" : "outline"}
                    disabled={discountApplied || !discountCode.trim()}
                  >
                    {discountApplied ? "Applied" : "Apply"}
                  </Button>
                </div>
                {discountApplied && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Discount of ${discountAmount.toFixed(2)} applied!
                  </p>
                )}
              </div>

              <div className="border-t pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-consciousness text-muted-foreground">Subtotal</span>
                  <span className="font-consciousness">${total.toFixed(2)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span className="font-consciousness">Discount</span>
                    <span className="font-consciousness">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg border-t pt-2">
                  <span className="font-consciousness font-bold text-foreground">Total</span>
                  <span className="font-consciousness font-bold text-primary">${finalTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground font-consciousness mt-2">
                  * Taxes will be calculated at checkout
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="cosmic"
                  className="w-full font-consciousness"
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Proceed to Checkout"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full font-consciousness"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>

                <Link to="/store">
                  <Button variant="ghost" className="w-full font-consciousness">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;