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
import { EmailHub } from "@/components/admin/EmailHub";
import { UserManager } from "@/components/admin/UserManager";
import { ProductManager } from "@/components/admin/ProductManager";
import { RaffleManager } from "@/components/admin/RaffleManager";
import { TutorialCourseParticipation } from "@/components/admin/TutorialCourseParticipation";
import { CommissionsManager } from "@/components/admin/CommissionsManager";
import { RoadmapManager } from "@/components/admin/RoadmapManager";
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    checkAdminStatus();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
      case "overview":      return <OverviewPanel />;
      case "email":         return <EmailHub />;
      case "users":         return <UserManager />;
      case "orders":        return <OrdersManager />;
      case "products":      return <ProductManager />;
      case "raffles":       return <RaffleManager />;
      case "commissions":   return <CommissionsManager />;
      case "participation": return <TutorialCourseParticipation />;
      case "roadmap":       return <RoadmapManager />;
      case "seo":           return <SEOSettingsManager />;
      case "site":          return <SiteControlsManager />;
      default:              return <OverviewPanel />;
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
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="sticky top-0 z-10 bg-cosmic-void/95 backdrop-blur-sm">
            <div className="container mx-auto py-4">
              <AICommandBar onCommandExecuted={() => {}} />
            </div>

            <div className="container mx-auto pb-4 px-4 sm:px-6 lg:px-8 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-consciousness font-bold tracking-tight text-white capitalize">
                  {activeSection.replace(/-/g, " ")}
                </h1>
              </div>
              <div className="text-right font-body text-white/50 text-sm">
                <div className="font-medium text-white/80">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div>{currentTime.toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              {renderActiveSection()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
