import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSocialLinks, SocialLink } from "@/hooks/useSocialLinks";
import { usePageVisibility, PageVisibility } from "@/hooks/usePageVisibility";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  Save,
  Check,
  AlertTriangle,
  Settings,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

export const SiteControlsManager = () => {
  const { toast } = useToast();
  const { links: initialLinks, loading: linksLoading } = useSocialLinks();
  const { pages, loading: pagesLoading } = usePageVisibility();

  const [links, setLinks] = useState<Partial<SocialLink>[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [savingLinks, setSavingLinks] = useState(false);
  const [pageStatus, setPageStatus] = useState<Record<string, 'success' | 'error' | null>>({});

  useEffect(() => {
    if (initialLinks) {
      setLinks(initialLinks);
      setDeletedIds([]);
    }
  }, [initialLinks]);

  const handleAddLink = () => {
    const newLink: Partial<SocialLink> = {
      platform: "custom",
      label: "",
      url: "",
      icon: "Link",
      is_active: false,
      sort_order: links.length
    };
    setLinks([...links, newLink]);
  };

  const handleRemoveLink = (index: number) => {
    const linkToRemove = links[index];
    if (linkToRemove.id) {
      setDeletedIds([...deletedIds, linkToRemove.id]);
    }
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, updates: Partial<SocialLink>) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], ...updates };
    setLinks(newLinks);
  };

  const handleSaveLinks = async () => {
    try {
      setSavingLinks(true);

      // 1. Handle Deletions
      if (deletedIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("social_links" as any)
          .delete()
          .in("id", deletedIds);

        if (deleteError) throw deleteError;
        setDeletedIds([]);
      }

      // 2. Handle Upserts
      const linksToUpsert = links.map((link, index) => ({
        ...link,
        sort_order: index,
        // If it's a new link without an ID, let Supabase generate one
        ...(link.id ? { id: link.id } : {})
      }));

      if (linksToUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from("social_links" as any)
          .upsert(linksToUpsert);

        if (upsertError) throw upsertError;
      }

      toast({
        title: "Success",
        description: "Social links saved",
      });
    } catch (error) {
      console.error("Error saving links:", error);
      toast({
        title: "Error",
        description: "Save failed",
        variant: "destructive",
      });
    } finally {
      setSavingLinks(false);
    }
  };

  const handleTogglePage = async (path: string, newValue: boolean) => {
    try {
      const { error } = await supabase
        .from("page_visibility" as any)
        .update({ is_visible: newValue, updated_at: new Date().toISOString() })
        .eq("path", path);

      if (error) throw error;

      setPageStatus({ ...pageStatus, [path]: 'success' });
      setTimeout(() => {
        setPageStatus(prev => ({ ...prev, [path]: null }));
      }, 2000);
    } catch (error) {
      console.error("Error updating page visibility:", error);
      setPageStatus({ ...pageStatus, [path]: 'error' });
      setTimeout(() => {
        setPageStatus(prev => ({ ...prev, [path]: null }));
      }, 2000);
    }
  };

  if (linksLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-consciousness font-bold">Site Controls</h2>
          <p className="text-sm text-muted-foreground font-body">
            Manage social media presence and page accessibility
          </p>
        </div>
      </div>

      {/* Social Links Editor */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-consciousness text-violet-400">Social Links Editor</CardTitle>
          <CardDescription className="font-body">
            Configure the social media icons shown in the footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 font-body">
          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={link.id || index} className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 capitalize min-w-[80px] justify-center">
                  {link.platform}
                </Badge>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    value={link.label}
                    onChange={(e) => updateLink(index, { label: e.target.value })}
                    placeholder="Label (e.g. Twitter)"
                    className="bg-black/20 border-white/10 h-9"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(index, { url: e.target.value })}
                    placeholder="URL (https://...)"
                    className="bg-black/20 border-white/10 h-9"
                  />
                  <Input
                    value={link.icon}
                    onChange={(e) => updateLink(index, { icon: e.target.value })}
                    placeholder="Icon (e.g. Twitter)"
                    className="bg-black/20 border-white/10 h-9"
                  />
                </div>
                <div className="flex items-center gap-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/50">Active</span>
                    <Switch
                      checked={link.is_active}
                      onCheckedChange={(checked) => updateLink(index, { is_active: checked })}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLink(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={handleAddLink}
              className="border-white/10 hover:bg-white/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Link
            </Button>
            <Button
              onClick={handleSaveLinks}
              disabled={savingLinks}
              className="bg-violet-600 hover:bg-violet-700 min-w-[120px]"
            >
              {savingLinks ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save All
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Page Visibility Manager */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-consciousness text-violet-400">Page Visibility Manager</CardTitle>
          <CardDescription className="font-body">
            Control which pages are visible in the navigation menus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 font-body">
          <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Hiding a page removes it from navigation but the URL still works. Share it only with people who have the link.
            </AlertDescription>
          </Alert>

          <div className="grid gap-3">
            {pages?.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-white/20 transition-all">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white capitalize">
                    {page.path.replace(/^\//, '').replace(/-/g, ' ') || 'Home'}
                  </span>
                  <span className="text-xs text-white/30 font-mono">{page.path}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center min-w-[24px]">
                    {pageStatus[page.path] === 'success' && (
                      <Check className="w-5 h-5 text-green-400 animate-in fade-in zoom-in duration-300" />
                    )}
                    {pageStatus[page.path] === 'error' && (
                      <span className="text-red-400 text-xs">Error</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {page.is_visible ? (
                      <Eye className="w-4 h-4 text-violet-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-white/20" />
                    )}
                    <Switch
                      checked={page.is_visible}
                      onCheckedChange={(checked) => handleTogglePage(page.path, checked)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
