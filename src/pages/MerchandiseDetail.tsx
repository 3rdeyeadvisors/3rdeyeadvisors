import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, ArrowLeft, ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import DOMPurify from "dompurify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MerchandiseDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Known sizes to detect format (Size / Color vs Color / Size)
  const knownSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'One size', 'One Size'];
  
  // Detect if format is "Size / Color" or "Color / Size" by checking first part of first variant
  const detectFormat = (variants: any[]) => {
    if (!variants?.length) return 'color-first';
    const firstTitle = variants[0]?.title || '';
    const [firstPart] = firstTitle.split(' / ');
    return knownSizes.includes(firstPart) ? 'size-first' : 'color-first';
  };

  // Memoize derived values
  const variants = useMemo(() => (product?.variants as any[]) || [], [product?.variants]);
  const hasSizeVariants = useMemo(() => variants.some((v: any) => v.title?.includes(' / ')), [variants]);
  const variantFormat = useMemo(() => hasSizeVariants ? detectFormat(variants) : 'color-first', [hasSizeVariants, variants]);
  
  const variantsByColor = useMemo(() => {
    if (!hasSizeVariants) return null;
    return variants.reduce((acc: any, variant: any) => {
      const parts = variant.title?.split(' / ') || [];
      const color = variantFormat === 'size-first' ? parts[1] : parts[0];
      const size = variantFormat === 'size-first' ? parts[0] : parts[1];
      if (color) {
        if (!acc[color]) {
          acc[color] = [];
        }
        acc[color].push({ ...variant, color, size });
      }
      return acc;
    }, {});
  }, [hasSizeVariants, variants, variantFormat]);

  const colors = useMemo(() => variantsByColor ? Object.keys(variantsByColor) : [], [variantsByColor]);
  const availableSizes = useMemo(() => variantsByColor?.[selectedColor] || [], [variantsByColor, selectedColor]);

  const productImages = useMemo(() => (product?.images as any[]) || [], [product?.images]);
  const rawDescription = useMemo(() => typeof product?.description === 'string' ? product.description : '', [product?.description]);
  const productDescription = useMemo(() => DOMPurify.sanitize(rawDescription), [rawDescription]);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      // Use secure public view that excludes pricing strategy data
      const { data, error } = await supabase
        .from('printify_products_public')
        .select('*')
        .eq('printify_id', productId)
        .maybeSingle();
      
      if (error) throw error;
      
      setProduct(data);
      
      // Initialize variant selection
      const productVariants = (data?.variants as any[]) || [];
      const productImages = (data?.images as any[]) || [];
      
      if (productVariants.length > 0) {
        const hasSizeVariants = productVariants.some((v: any) => v.title?.includes(' / '));
        
        if (!hasSizeVariants) {
          // Single variant product (like journals)
          const firstVariant = productVariants[0];
          setSelectedVariant(firstVariant);
          setSelectedColor('');
          setSelectedSize('');
        } else {
          // Multi-variant product with color/size - detect format
          const firstTitle = productVariants[0]?.title || '';
          const [firstPart] = firstTitle.split(' / ');
          const format = knownSizes.includes(firstPart) ? 'size-first' : 'color-first';
          
          const variantsByColor = productVariants.reduce((acc: any, variant: any) => {
            const parts = variant.title?.split(' / ') || [];
            const color = format === 'size-first' ? parts[1] : parts[0];
            const size = format === 'size-first' ? parts[0] : parts[1];
            if (color) {
              if (!acc[color]) {
                acc[color] = [];
              }
              acc[color].push({ ...variant, color, size });
            }
            return acc;
          }, {});
          
          const colors = Object.keys(variantsByColor || {});
          const defaultColor = colors[0];
          setSelectedColor(defaultColor);
          
          const firstColorVariants = variantsByColor[defaultColor];
          if (firstColorVariants?.length > 0) {
            const firstVariant = firstColorVariants[0];
            setSelectedSize(firstVariant.size);
            setSelectedVariant(productVariants.find((v: any) => v.id === firstVariant.id));
            
            // Set the correct image for the first variant
            const colorImageIndex = productImages.findIndex((img: any) => 
              img.variant_ids?.includes(firstVariant.id)
            );
            if (colorImageIndex !== -1) {
              setCurrentImageIndex(colorImageIndex);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
      navigate('/store');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSelectedVariant = (color: string, size: string) => {
    // Match based on detected format
    const expectedTitle = variantFormat === 'size-first' 
      ? `${size} / ${color}` 
      : `${color} / ${size}`;
    const variant = variants.find((v: any) => v.title === expectedTitle);
    setSelectedVariant(variant);
    
    // Update image based on color
    const colorImageIndex = productImages.findIndex((img: any) => 
      img.variant_ids?.includes(variant?.id)
    );
    if (colorImageIndex !== -1) {
      setCurrentImageIndex(colorImageIndex);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const newSizes = variantsByColor?.[color] || [];
    const newSize = newSizes[0]?.size;
    setSelectedSize(newSize);
    updateSelectedVariant(color, newSize);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    updateSelectedVariant(selectedColor, size);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !product) return;
    
    addItem({
      id: `${product.printify_id}-${selectedVariant.id}`,
      printify_id: product.printify_id,
      printify_product_id: product.printify_id,
      variant_id: selectedVariant.id,
      title: product.title,
      price: selectedVariant.price,
      type: "merchandise",
      category: "Apparel",
      color: selectedColor,
      size: selectedSize,
      image: productImages[currentImageIndex]?.src || productImages[0]?.src,
    });
    
    toast.success(`${product.title} added to cart!`);
  };

  const nextImage = () => {
    if (productImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }
  };

  const prevImage = () => {
    if (productImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
  };

  const inCart = selectedVariant && product && items.some(item => item.id === `${product.printify_id}-${selectedVariant.id}`);

  if (isLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-white/5 rounded w-32 mb-8" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-white/5 rounded" />
              <div className="space-y-4">
                <div className="h-8 bg-white/5 rounded w-3/4" />
                <div className="h-6 bg-white/5 rounded w-1/4" />
                <div className="h-32 bg-white/5 rounded" />
                <div className="h-12 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <>
      <SEO 
        title={`${product.title} | Sentinel DeFi Store`}
        description={productDescription.replace(/<[^>]*>/g, '') || `Premium merchandise: ${product.title}`}
        keywords={`${product.title}, DeFi merchandise, crypto apparel, blockchain clothing`}
        url={`https://www.sentineldefi.online/store/merchandise/${productId}`}
        type="product"
        image={productImages[0]?.src}
      />

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
            onClick={() => setIsLightboxOpen(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-[110] rounded-full"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="relative w-full max-w-5xl aspect-square flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={currentImageIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={productImages[currentImageIndex]?.src || productImages[0]?.src}
                alt={product.title}
                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg"
              />

              {productImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur rounded-full h-12 w-12"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur rounded-full h-12 w-12"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            <p className="mt-6 text-white font-consciousness font-medium text-center">
              {product.title} {productImages.length > 1 && `(${currentImageIndex + 1} / ${productImages.length})`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="min-h-screen py-20 w-full overflow-x-hidden">
        <div className="container mx-auto px-4 w-full max-w-7xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/store')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Button>

          {/* Product Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 w-full">
            {/* Image Gallery */}
            <div className="space-y-4">
              <Card className="overflow-hidden relative group">
                <div
                  className="relative aspect-square bg-black cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={productImages[currentImageIndex]?.src || productImages[0]?.src}
                    alt={product.title}
                    width={800}
                    height={800}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="rounded-full shadow-lg" aria-label="Open image lightbox">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {productImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur"
                        onClick={prevImage}
                        aria-label="Previous product image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur"
                        onClick={nextImage}
                        aria-label="Next product image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>

              {/* Thumbnail Navigation */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {productImages.map((image: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all ${
                        index === currentImageIndex
                          ? 'border-primary'
                          : 'border-white/8 hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={image.src}
                        alt={`${product.title} view ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6 w-full text-center md:text-left">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-consciousness font-bold mb-3 sm:mb-4 break-words">
                  {product.title}
                </h1>
                <div className="flex items-center justify-center md:justify-start">
                  <span className="font-body text-lg mr-2 text-primary/70">$</span>
                  <p className="text-3xl font-consciousness font-bold text-primary">
                    {selectedVariant?.price?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {productDescription && (
                <div 
                  className="text-white/50 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: productDescription }}
                />
              )}

              {/* Variant Selection - only show for products with color/size variants */}
              {hasSizeVariants && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-consciousness font-medium mb-2">
                      Color: <span className="text-white">{selectedColor}</span>
                    </label>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {colors.map((color) => (
                        <Button
                          key={color}
                          variant={selectedColor === color ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleColorChange(color)}
                          className="min-w-[80px] min-h-[44px]"
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-consciousness font-medium mb-2">
                      Size: <span className="text-white">{selectedSize}</span>
                    </label>
                    <Select value={selectedSize} onValueChange={handleSizeChange}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSizes.map((variant: any) => (
                          <SelectItem key={variant.id} value={variant.size}>
                            {variant.size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant || inCart}
                className="w-full gap-2 h-11 sm:h-12 text-sm sm:text-base font-consciousness touch-manipulation"
                size="lg"
              >
                {inCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>

              {/* Product Details */}
              <Card className="p-4 bg-secondary/40">
                <h3 className="font-consciousness font-semibold mb-2">Product Details</h3>
                <ul className="text-sm text-white/50 space-y-1">
                  <li>• Premium eco-friendly materials</li>
                  <li>• 5 to 7 business day processing and shipping</li>
                  <li>• Secure payment processing</li>
                  <li>• Free shipping</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
