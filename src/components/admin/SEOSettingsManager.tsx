import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export const SEOSettingsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState({
    site_name: "",
    site_tagline: "",
    default_meta_title: "",
    default_meta_description: "",
    default_meta_keywords: "",
    og_image_url: "",
    twitter_handle: "",
    google_site_verification: "",
    robots_default: "index, follow",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings" as any)
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const settings = data as any;
        setFields({
          site_name: settings.site_name || "",
          site_tagline: settings.site_tagline || "",
          default_meta_title: settings.default_meta_title || "",
          default_meta_description: settings.default_meta_description || "",
          default_meta_keywords: settings.default_meta_keywords || "",
          og_image_url: settings.og_image_url || "",
          twitter_handle: settings.twitter_handle || "",
          google_site_verification: settings.google_site_verification || "",
          robots_default: settings.robots_default || "index, follow",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load SEO settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("site_settings" as any)
        .update({
          ...fields,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq("id", "default");

      if (error) throw error;

      // Invalidate and refetch site settings
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });

      toast({
        title: "Success",
        description: "SEO settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save SEO settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Search className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-consciousness font-bold">SEO Settings</h2>
          <p className="text-sm text-muted-foreground font-body">
            Manage global search engine optimization and social metadata
          </p>
        </div>
      </div>

      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-consciousness text-violet-400">Global Configuration</CardTitle>
          <CardDescription className="font-body">
            These values apply site-wide unless overridden on specific pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 font-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Site Name</label>
              <Input
                value={fields.site_name}
                onChange={(e) => setFields({ ...fields, site_name: e.target.value })}
                placeholder="e.g., Sentinel DeFi"
                className="bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Site Tagline</label>
              <Input
                value={fields.site_tagline}
                onChange={(e) => setFields({ ...fields, site_tagline: e.target.value })}
                placeholder="e.g., Decentralized Finance Education"
                className="bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/70">Default Meta Title</label>
              <span className={`text-xs ${fields.default_meta_title.length > 60 ? 'text-red-400' : 'text-muted-foreground'}`}>
                {fields.default_meta_title.length} / 60
              </span>
            </div>
            <Input
              value={fields.default_meta_title}
              onChange={(e) => setFields({ ...fields, default_meta_title: e.target.value })}
              placeholder="Primary browser tab title"
              className={`bg-white/5 border-white/10 focus:border-primary/50 ${fields.default_meta_title.length > 60 ? 'border-red-500/50' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/70">Default Meta Description</label>
              <span className={`text-xs ${fields.default_meta_description.length > 160 ? 'text-red-400' : 'text-muted-foreground'}`}>
                {fields.default_meta_description.length} / 160
              </span>
            </div>
            <Textarea
              value={fields.default_meta_description}
              onChange={(e) => setFields({ ...fields, default_meta_description: e.target.value })}
              placeholder="Description for search results"
              rows={3}
              className={`bg-white/5 border-white/10 focus:border-primary/50 ${fields.default_meta_description.length > 160 ? 'border-red-500/50' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Default Meta Keywords</label>
            <Textarea
              value={fields.default_meta_keywords}
              onChange={(e) => setFields({ ...fields, default_meta_keywords: e.target.value })}
              placeholder="Comma separated keywords"
              rows={2}
              className="bg-white/5 border-white/10 focus:border-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">OG Image URL</label>
              <Input
                value={fields.og_image_url}
                onChange={(e) => setFields({ ...fields, og_image_url: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Twitter Handle</label>
              <Input
                value={fields.twitter_handle}
                onChange={(e) => setFields({ ...fields, twitter_handle: e.target.value })}
                placeholder="@sentineldefi"
                className="bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Google Site Verification</label>
              <Input
                value={fields.google_site_verification}
                onChange={(e) => setFields({ ...fields, google_site_verification: e.target.value })}
                placeholder="Verification code"
                className="bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Robots Default</label>
              <Select
                value={fields.robots_default}
                onValueChange={(value) => setFields({ ...fields, robots_default: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select robots policy" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="index, follow">index, follow</SelectItem>
                  <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                  <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 text-white min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
