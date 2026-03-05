import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSender = () => {
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendNewsletter = async () => {
    if (!blogTitle || !blogExcerpt || !blogUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "send-newsletter-email",
        {
          body: {
            blogTitle,
            blogExcerpt,
            blogUrl,
          },
        }
      );

      if (error) throw error;

      toast({
        title: "Newsletter Sent!",
        description: `Successfully sent to ${data.sent} subscribers`,
      });

      // Clear form
      setBlogTitle("");
      setBlogExcerpt("");
      setBlogUrl("");
    } catch (error: any) {
      console.error("Newsletter send error:", error);
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send newsletter",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill for latest blog
  const handleQuickFillLatest = () => {
    setBlogTitle("On-Chain ETFs: How Tokenized Funds Are Bridging DeFi and Traditional Finance in 2025");
    setBlogExcerpt("Explore how tokenized ETFs are building bridges between decentralized finance and traditional markets, introducing billions in institutional capital to blockchain infrastructure.");
    setBlogUrl("https://www.sentineldefi.com/blog/on-chain-etfs-2025");
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Send Newsletter</h2>
          <p className="text-sm text-muted-foreground">
            Notify all subscribers about a new blog post
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="blogTitle">Blog Title</Label>
          <Input
            id="blogTitle"
            placeholder="Enter blog post title"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="blogExcerpt">Blog Excerpt</Label>
          <Textarea
            id="blogExcerpt"
            placeholder="Enter a brief description or excerpt"
            value={blogExcerpt}
            onChange={(e) => setBlogExcerpt(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="blogUrl">Blog URL</Label>
          <Input
            id="blogUrl"
            placeholder="https://www.sentineldefi.com/blog/..."
            value={blogUrl}
            onChange={(e) => setBlogUrl(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleQuickFillLatest}
            variant="outline"
            disabled={isLoading}
          >
            Quick Fill: Latest Post
          </Button>
          
          <Button
            onClick={handleSendNewsletter}
            disabled={isLoading}
            className="ml-auto"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send to All Subscribers
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NewsletterSender;
