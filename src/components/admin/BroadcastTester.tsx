import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BroadcastTester = () => {
  const [jsonInput, setJsonInput] = useState(`{
  "day_type": "monday",
  "subject_line": "Sentinel DeFi Market Pulse: Top Movers",
  "intro_text": "Here's this week's top-performing DeFi tokens.",
  "market_block": "<h3>Top Movers</h3><ul><li><strong>ETH</strong>: $2,450 <span style='color: #10b981;'>+5.2%</span></li><li><strong>UNI</strong>: $8.75 <span style='color: #10b981;'>+12.4%</span></li></ul>",
  "cta_link": "https://www.sentineldefi.online"
}`);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const { toast } = useToast();

  const handleSendWebhook = async () => {
    setIsLoading(true);
    setLastResponse(null);

    try {
      // Validate JSON
      const payload = JSON.parse(jsonInput);

      // Send to webhook
      const { data, error } = await supabase.functions.invoke('3ea-broadcast', {
        body: payload
      });

      if (error) throw error;

      setLastResponse(data);
      
      toast({
        title: "Broadcast Queued!",
        description: `Scheduled for ${data.scheduled_for}`,
      });
    } catch (error: any) {
      console.error("Webhook error:", error);
      
      if (error instanceof SyntaxError) {
        toast({
          title: "Invalid JSON",
          description: "Please check your JSON syntax",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Send Failed",
          description: error.message || "Failed to send to webhook",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSend = async () => {
    if (!lastResponse?.id) {
      toast({
        title: "No Broadcast Queued",
        description: "Send to webhook first, then test send",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-scheduled-broadcast', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent!",
        description: `Sent to ${data.sent} subscribers`,
      });
    } catch (error: any) {
      console.error("Test send error:", error);
      toast({
        title: "Send Failed",
        description: error.message || "Failed to trigger send",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = (type: 'monday' | 'wednesday' | 'friday') => {
    const templates = {
      monday: {
        day_type: "monday",
        subject_line: "Sentinel DeFi Market Pulse: Top Movers",
        intro_text: "Here are this week's top-performing DeFi tokens and their 24-hour performance metrics.",
        market_block: "<h3>Top Movers</h3><ul><li><strong>Ethereum (ETH)</strong>: $2,450 <span style='color: #10b981;'>+5.2%</span></li><li><strong>Uniswap (UNI)</strong>: $8.75 <span style='color: #10b981;'>+12.4%</span></li><li><strong>Aave (AAVE)</strong>: $95.30 <span style='color: #ef4444;'>-2.1%</span></li></ul>",
        cta_link: "https://www.sentineldefi.online"
      },
      wednesday: {
        day_type: "wednesday",
        subject_line: "Sentinel DeFi Trends: What's Moving This Week",
        intro_text: "Key trends shaping DeFi markets this week.",
        market_block: "<h3>This Week's Trends</h3><p>🔥 <strong>Liquid Staking Dominance:</strong> LSTs now represent over $40B in TVL across major protocols.</p><p>📊 <strong>Cross-chain Activity:</strong> Bridge volume up 28% week-over-week.</p><p>⚡ <strong>Gas Optimizations:</strong> Layer 2 adoption continues accelerating with record-low fees.</p>",
        cta_link: "https://www.sentineldefi.online/blog"
      },
      friday: {
        day_type: "friday",
        subject_line: "Sentinel DeFi Learning Drop (DeFi Education)",
        intro_text: "This week's DeFi education highlight: Understanding Impermanent Loss",
        market_block: "<h3>📚 Understanding Impermanent Loss</h3><p><strong>What is it?</strong> Impermanent loss occurs when providing liquidity to automated market makers (AMMs). It represents the difference between holding tokens vs. providing liquidity.</p><p><strong>Key Takeaway:</strong> IL is temporary if token prices return to their original ratio. However, fees earned can offset the loss.</p><p><strong>Pro Tip:</strong> Use stable pairs (USDC/USDT) to minimize IL risk while earning fees.</p>",
        cta_link: "https://www.sentineldefi.online/courses/defi-mastery"
      }
    };

    setJsonInput(JSON.stringify(templates[type], null, 2));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Broadcast Webhook Tester</h2>
            <p className="text-sm text-muted-foreground">
              Test the Sentinel DeFi Broadcast automation webhook
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => loadTemplate('monday')}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              Monday Template
            </Button>
            <Button
              onClick={() => loadTemplate('wednesday')}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              Wednesday Template
            </Button>
            <Button
              onClick={() => loadTemplate('friday')}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              Friday Template
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jsonInput">JSON Payload</Label>
            <Textarea
              id="jsonInput"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Paste your JSON here..."
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSendWebhook}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send to Webhook
            </Button>

            <Button
              onClick={handleTestSend}
              disabled={isLoading || !lastResponse}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Test Send Now
            </Button>
          </div>

          {lastResponse && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Broadcast Queued Successfully</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ID: {lastResponse.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Scheduled for: {lastResponse.scheduled_for}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click "Test Send Now" to trigger email immediately
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3">Webhook Endpoint</h3>
        <code className="text-sm bg-background p-3 rounded block overflow-x-auto">
          https://zapbkuaejvzpqerkkcnc.supabase.co/functions/v1/3ea-broadcast
        </code>
        
        <h3 className="font-semibold mb-3 mt-6">Required Fields</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• <code>day_type</code>: "monday" | "wednesday" | "friday"</li>
          <li>• <code>subject_line</code>: Email subject (string)</li>
          <li>• <code>intro_text</code>: Opening paragraph (string)</li>
          <li>• <code>market_block</code>: Main content (HTML string)</li>
          <li>• <code>cta_link</code>: Call-to-action URL (optional)</li>
        </ul>
      </Card>
    </div>
  );
};

export default BroadcastTester;
