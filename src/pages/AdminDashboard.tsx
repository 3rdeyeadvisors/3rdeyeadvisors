import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AICommandBar } from "@/components/admin/AICommandBar";
import { OverviewPanel } from "@/components/admin/OverviewPanel";
import { OrdersManager } from "@/components/admin/OrdersManager";
import EmailHub from "@/components/admin/EmailHub";
import { UserManager } from "@/components/admin/UserManager";
import { ProductManager } from "@/components/admin/ProductManager";
import RaffleManager from "@/components/admin/RaffleManager";
import { TutorialCourseParticipation } from "@/components/admin/TutorialCourseParticipation";
import CommissionsManager from "@/components/admin/CommissionsManager";
import RoadmapManager from "@/components/admin/RoadmapManager";
import { SEOSettingsManager } from "@/components/admin/SEOSettingsManager";
import { SiteControlsManager } from "@/components/admin/SiteControlsManager";
import { isAdminEmail } from "@/lib/admin";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Only re-check if the user ID has changed
      if (checkedUserId === user.id) {
        return;
      }

      // Explicitly allow the requested admin email
      if (isAdminEmail(user.email)) {
        setCheckedUserId(user.id);
        setIsAdmin(true);
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setCheckedUserId(user.id);
      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewPanel />;
      case "orders":
        return <OrdersManager />;
      case "raffles":
        return <RaffleManager />;
      case "commissions":
        return <CommissionsManager />;
      case "email":
        return <EmailHub />;
      case "users":
        return <UserManager />;
      case "products":
        return <ProductManager />;
      case "participation":
        return <TutorialCourseParticipation />;
      case "roadmap":
        return <RoadmapManager />;
      case "seo":
        return <SEOSettingsManager />;
      case "site-controls":
        return <SiteControlsManager />;
      default:
        return <OverviewPanel />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cosmic-void">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cosmic-void">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <main className="flex-1 flex flex-col">
          <div className="sticky top-0 z-10 bg-cosmic-void/95 backdrop-blur-sm border-b border-primary/10">
            <div className="container mx-auto py-4">
              <AICommandBar onCommandExecuted={() => {}} />
            </div>
          </div>
          
          <div className="flex-1 container mx-auto py-6">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
