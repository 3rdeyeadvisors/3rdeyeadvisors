
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, RefreshCw } from "lucide-react";

export const SocialPreviewChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const currentUrl = window.location.origin;
  const socialImage = `${currentUrl}/social-share-3rdeyeadvisors.jpg`;

  const checkPreview = () => {
    setIsChecking(true);
    // Simulate checking
    setTimeout(() => setIsChecking(false), 2000);
  };

  const debugTools = [
    {
      name: "Facebook Sharing Debugger",
      url: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(currentUrl)}`,
      description: "Check how Facebook/Meta sees your link"
    },
    {
      name: "LinkedIn Inspector",
      url: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(currentUrl)}`,
      description: "Preview how LinkedIn displays your link"
    },
    {
      name: "Twitter Card Validator",
      url: `https://cards-dev.twitter.com/validator`,
      description: "Validate Twitter card preview (enter URL manually)"
    },
    {
      name: "Open Graph Check",
      url: `https://opengraphcheck.com/result.php?url=${encodeURIComponent(currentUrl)}`,
      description: "General Open Graph meta tag checker"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Social Link Preview Checker</h2>
        <p className="text-muted-foreground">
          Test how your website link appears when shared on messaging apps and social media
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Social Share Image</h3>
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <img 
              src={socialImage} 
              alt="Current social share preview"
              className="w-full max-w-lg mx-auto rounded border"
              width={1200}
              height={630}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p><strong>Image URL:</strong> {socialImage}</p>
            <p><strong>Site URL:</strong> {currentUrl}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Test Your Link Preview</h3>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Use these tools to see exactly how different platforms will display your link:
          </p>
          
          <div className="grid gap-4">
            {debugTools.map((tool, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{tool.name}</h4>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a 
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Check
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-primary/10 border-primary/30">
        <h3 className="text-lg font-semibold mb-2 text-foreground">💡 Pro Tips for Link Previews</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <strong>iMessage/WhatsApp:</strong> Can take 1-4 hours to update cached previews</li>
          <li>• <strong>Clear cache:</strong> Delete previous messages with your link and reshare</li>
          <li>• <strong>Test with new contacts:</strong> Fresh conversations update faster</li>
          <li>• <strong>Use debug tools above:</strong> They force platforms to refresh your link data</li>
        </ul>
      </Card>
    </div>
  );
};
