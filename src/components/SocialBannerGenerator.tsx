import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, ImageIcon } from "lucide-react";
import cosmicBg from "@/assets/cosmic-hero-bg.jpg";

export const SocialBannerGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  // Auto-generate on component mount
  useEffect(() => {
    generateBanner();
  }, []);

  const generateBanner = async () => {
    setIsGenerating(true);
    try {
      // Build colors from design tokens with safe fallbacks (exact site theme)
      const root = getComputedStyle(document.documentElement);
      const bgStart = (root.getPropertyValue('--background')?.trim() || '222 84% 4.9%');
      const bgEnd = (root.getPropertyValue('--card')?.trim() || '217 32% 8%');
      const primary = (root.getPropertyValue('--primary')?.trim() || '217 91% 60%');
      const primaryGlow = (root.getPropertyValue('--primary-glow')?.trim() || '217 91% 70%');
      const foreground = (root.getPropertyValue('--foreground')?.trim() || '0 0% 98%');

      // Canvas setup
      const width = 1792;
      const height = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Background: homepage cosmic image (cover) + on-brand color grade
      const bgImage = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = cosmicBg;
      });
      const imgRatio = bgImage.width / bgImage.height;
      const canvasRatio = width / height;
      let drawW = width, drawH = height, dx = 0, dy = 0;
      if (imgRatio > canvasRatio) {
        drawH = height;
        drawW = height * imgRatio;
        dx = (width - drawW) / 2;
      } else {
        drawW = width;
        drawH = width / imgRatio;
        dy = (height - drawH) / 2;
      }
      ctx.drawImage(bgImage, dx, dy, drawW, drawH);

      // Overlay brand gradient to match site tone
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, `hsla(${bgStart} / 0.85)`);
      grad.addColorStop(1, `hsla(${bgEnd} / 0.85)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Clean background - no grid per user preference

      // No starfield - keeping it minimal and clean

      // Vignette to focus center
      const vignette = ctx.createRadialGradient(width/2, height/2, Math.min(width, height)/3, width/2, height/2, Math.max(width, height)/1.1);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, `hsla(${bgStart} / 0.4)`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Soft radial glow behind text (primary glow)
      const glow = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
      glow.addColorStop(0, `hsla(${primaryGlow} / 0.14)`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Wordmark: EXACT single unbroken word
      const word = 'Sentinel DeFi';
      // Choose a clean geometric sans; fall back to system
      let fontSize = 220; // will shrink to fit
      const padding = 120; // safe margins
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = `hsla(${primaryGlow} / 0.25)`;
      ctx.shadowBlur = 24;

      const setFont = (size: number) => {
        ctx.font = `700 ${size}px ui-sans-serif, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
      };

      setFont(fontSize);
      // Reduce font size until it fits within width - 2*padding
      while (ctx.measureText(word).width > (width - padding * 2) && fontSize > 40) {
        fontSize -= 4;
        setFont(fontSize);
      }

      // Fill text with brand primary blue
      ctx.fillStyle = `hsl(${primary})`;
      ctx.fillText(word, width / 2, height / 2);

      // Optional thin outline for contrast in dark mode
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = `hsla(${foreground} / 0.25)`;
      ctx.strokeText(word, width / 2, height / 2);

      // Export as WebP
      const dataUrl = canvas.toDataURL('image/webp', 0.85);
      setGeneratedImage(dataUrl);

      // Convert to File and upload to Supabase Storage (keeps previous path)
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'sentinel-social-banner.webp', { type: 'image/webp' });

      const { error: uploadError } = await supabase.storage
        .from('social-banners')
        .upload('sentinel-social-banner.webp', file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
      }

      toast({
        title: 'Social banner updated',
        description: 'Centered text "Sentinel DeFi" (single unbroken word) with site theme applied.',
      });
    } catch (error: any) {
      console.error('Error generating banner:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate social banner.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'sentinel-social-banner.webp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your social banner is being downloaded.",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Generate Social Share Banner</h2>
        <p className="text-muted-foreground">
          Create a futuristic Sentinel DeFi social share banner for your DeFi education platform
        </p>
        
        <Button 
          onClick={generateBanner}
          disabled={isGenerating}
          className="flex items-center space-x-2"
        >
          <ImageIcon className="w-4 h-4" />
          <span>{isGenerating ? "Generating..." : "Generate Banner"}</span>
        </Button>
      </div>

      {generatedImage && (
        <div className="space-y-4">
          <div className="relative bg-card rounded-lg overflow-hidden border">
            <img 
              src={generatedImage} 
              alt="Sentinel DeFi Social Share Banner - Sentinel DeFi wordmark"
              className="w-full h-auto"
              width={1792}
              height={1024}
              loading="lazy"
            />
          </div>
          
          <div className="text-center">
            <Button 
              onClick={downloadImage}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Banner</span>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>Banner size: 1792x1024px (optimized for social media sharing)</p>
            <p>Perfect for Twitter, LinkedIn, Facebook, and other social platforms</p>
          </div>
        </div>
      )}
    </div>
  );
};