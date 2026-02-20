import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, Eye, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";

interface MerchandiseCardProps {
  product: any;
  onAddToCart: (product: any) => void;
  isInCart: (productId: string | number) => boolean;
}

export function MerchandiseCard({ product, onAddToCart, isInCart }: MerchandiseCardProps) {
  const navigate = useNavigate();
  const { items } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check if product has color/size variants or single variant
  const hasSizeVariants = product.variants?.some((v: any) => v.title.includes(' / '));
  
  // Known sizes to detect format (Size / Color vs Color / Size)
  const knownSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'One size', 'One Size'];
  
  // Detect if format is "Size / Color" or "Color / Size" by checking first part of first variant
  const detectFormat = (variants: any[]) => {
    if (!variants?.length) return 'color-first';
    const firstTitle = variants[0]?.title || '';
    const [firstPart] = firstTitle.split(' / ');
    // If first part is a known size, it's "Size / Color" format
    return knownSizes.includes(firstPart) ? 'size-first' : 'color-first';
  };
  
  const variantFormat = hasSizeVariants ? detectFormat(product.variants) : 'color-first';
  
  // Group variants by color (only if has size variants)
  const variantsByColor = hasSizeVariants 
    ? product.variants?.reduce((acc: any, variant: any) => {
        const parts = variant.title.split(' / ');
        const color = variantFormat === 'size-first' ? parts[1] : parts[0];
        const size = variantFormat === 'size-first' ? parts[0] : parts[1];
        if (!acc[color]) {
          acc[color] = [];
        }
        acc[color].push({ ...variant, color, size });
        return acc;
      }, {})
    : null;

  const colors = variantsByColor ? Object.keys(variantsByColor) : [];
  const defaultColor = colors[0] || '';
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  
  // Get sizes for selected color
  const availableSizes = variantsByColor?.[selectedColor] || [];
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]?.size || '');

  // Update selected variant when color or size changes
  const updateSelectedVariant = (color: string, size: string) => {
    // Match based on detected format
    const expectedTitle = variantFormat === 'size-first' 
      ? `${size} / ${color}` 
      : `${color} / ${size}`;
    const variant = product.variants?.find((v: any) => 
      v.title === expectedTitle
    );
    setSelectedVariant(variant);
    
    // Update image based on color
    const colorImageIndex = product.images?.findIndex((img: any) => 
      img.variant_ids?.includes(variant?.id)
    );
    if (colorImageIndex !== -1) {
      setCurrentImageIndex(colorImageIndex);
    }
  };

  // Initialize first variant on mount
  useEffect(() => {
    if (selectedVariant) return;
    
    // For single-variant products (like journals), just use the first variant
    if (!hasSizeVariants && product.variants?.length > 0) {
      const firstVariant = product.variants[0];
      setSelectedVariant(firstVariant);
    } else if (availableSizes.length > 0) {
      const expectedTitle = variantFormat === 'size-first'
        ? `${selectedSize} / ${selectedColor}`
        : `${selectedColor} / ${selectedSize}`;
      const firstVariant = product.variants?.find((v: any) => 
        v.title === expectedTitle
      );
      if (firstVariant) {
        setSelectedVariant(firstVariant);
      }
    }
  }, [product.variants, hasSizeVariants, variantFormat, selectedSize, selectedColor, availableSizes.length, selectedVariant]);

  // Update image when variant changes
  useEffect(() => {
    if (selectedVariant && product.images) {
      const colorImageIndex = product.images.findIndex((img: any) => 
        img.variant_ids?.includes(selectedVariant.id)
      );
      if (colorImageIndex !== -1) {
        setCurrentImageIndex(colorImageIndex);
      }
    }
  }, [selectedVariant, product.images]);

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
    if (!selectedVariant) return;
    
    onAddToCart({
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
      image: product.images?.[currentImageIndex]?.src || product.images?.[0]?.src,
      quantity: 1,
    });
  };

  const currentImage = product.images?.[currentImageIndex];
  const cartItemId = selectedVariant ? `${product.printify_id}-${selectedVariant.id}` : null;
  const cartItem = items.find(item => item.id === cartItemId);
  const quantityInCart = cartItem?.quantity || 0;

  const handleCardClick = () => {
    navigate(`/store/merchandise/${product.printify_id}`);
  };

  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 group flex flex-col h-full">
      {/* Product Image - Clickable */}
      <div 
        className="relative aspect-square overflow-hidden bg-black cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={currentImage?.src || product.images?.[0]?.src}
          alt={product.title}
          loading="lazy"
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {quantityInCart > 0 && (
          <div className="absolute top-3 right-3 bg-violet-600 text-white font-body text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
            {quantityInCart} in Cart
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1">
        {/* Product Name - Clickable */}
        <div className="mb-4">
          <h3 
            onClick={handleCardClick}
            className="font-consciousness text-base font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-2 min-h-[3rem] cursor-pointer leading-tight"
          >
            {product.title}
          </h3>
        </div>

        <p className="font-body text-sm text-white/50 mb-6 line-clamp-2">
          {product.description?.replace(/<[^>]*>?/gm, '').slice(0, 100)}...
        </p>

        {/* Compact Variant Selector */}
        {hasSizeVariants && (
          <div className="mb-6">
            <Select 
              value={`${selectedColor} / ${selectedSize}`} 
              onValueChange={(value) => {
                const [color, size] = value.split(' / ');
                setSelectedColor(color);
                setSelectedSize(size);
                updateSelectedVariant(color, size);
              }}
            >
              <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 text-xs text-white/70 rounded-xl">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                {colors.map((color) => (
                  <div key={color}>
                    {variantsByColor[color].map((variant: any) => (
                      <SelectItem 
                        key={variant.id} 
                        value={`${color} / ${variant.size}`} 
                        className="text-xs"
                      >
                        {color} : {variant.size}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="mt-auto space-y-4">
          <p className="font-consciousness text-lg font-bold text-white">
            ${selectedVariant?.price?.toFixed(2) || '0.00'}
          </p>
          
          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            className="relative font-body text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 transition-all w-full group/btn overflow-visible"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
            {quantityInCart > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 rounded-full font-body text-[10px] text-white flex items-center justify-center">
                {quantityInCart}
              </span>
            )}
          </Button>

          <Button
            onClick={handleCardClick}
            variant="ghost"
            className="w-full font-body text-xs text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
