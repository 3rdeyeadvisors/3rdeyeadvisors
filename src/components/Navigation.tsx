import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, LogIn, LogOut, User, ShoppingCart, ChevronDown, 
  BookOpen, BarChart3, Package, Gift,
  Lightbulb, Vault, GraduationCap, Newspaper, FolderOpen,
  Mail, Map, Brain, Zap
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/admin";

const Navigation = () => {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { user, signOut, session } = useAuth();
  const { toast } = useToast();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Explicitly allow the requested admin email
      if (isAdminEmail(user.email)) {
        setIsAdmin(true);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  const desktopNavItems = [
    {
      label: "Learn",
      children: [
        { path: "/courses", label: "Courses", description: "Structured DeFi courses from beginner to advanced" },
        { path: "/tutorials", label: "Tutorials", description: "Hands-on step by step guides for real actions" },
        { path: "/blog", label: "Blog", description: "Research, insights, and market analysis" },
        { path: "/resources", label: "Resources", description: "PDFs, tools, and reference materials" },
        { path: "/mini-games", label: "Brain Games", description: "Sharpen your thinking with cognitive challenges" },
      ]
    },
    {
      label: "Community",
      children: [
        { path: "/raffles", label: "Raffles", description: "Enter to win by completing educational tasks" },
        { path: "/earn", label: "Earn", description: "Points, rewards, and referral commissions" },
        { path: "/roadmap", label: "Roadmap", description: "Vote on what gets built next" },
        { path: "/raffle-history", label: "Raffle History", description: "Past winners and prize distributions" },
        { path: "/leaderboard", label: "Leaderboard", description: "Community rankings and point leaders" },
        { path: "/analytics", label: "Analytics", description: "Platform data and market insights" },
      ]
    },
    { label: "Vault", path: "/vault-access" },
    { label: "Store", path: "/store" },
    { label: "Philosophy", path: "/philosophy" },
    { label: "For Professionals", path: "/institutional" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/8 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center group transition-all duration-300" aria-label="3rdeyeadvisors home">
            <span className="font-consciousness font-bold text-violet-400 text-lg group-hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.4)] transition-all">
              3rdeyeadvisors
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8 gap-1">
            {desktopNavItems.map((item) => (
              <div key={item.label} className="relative group px-1">
                {item.children ? (
                  <div className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-consciousness font-medium text-white/70 group-hover:text-violet-400 group-hover:bg-white/5 transition-all cursor-default">
                    {item.label}
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                      <div className="w-64 bg-black/95 border border-white/10 rounded-2xl p-2 shadow-2xl shadow-violet-950/50 backdrop-blur-xl overflow-hidden">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`flex flex-col p-3 rounded-xl transition-all hover:bg-white/5 group/item ${isActive(child.path) ? "bg-white/5" : ""}`}
                          >
                            <span className={`font-consciousness text-sm font-medium ${isActive(child.path) ? "text-violet-400" : "text-white group-hover/item:text-violet-400"}`}>
                              {child.label}
                            </span>
                            <span className="font-body text-xs text-white/40 mt-0.5">
                              {child.description}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path!}
                    className={`px-3 py-2 rounded-xl text-sm font-consciousness font-medium transition-all ${
                      isActive(item.path!)
                        ? "text-violet-400 bg-white/5"
                        : "text-white/70 hover:text-violet-400 hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/cart" className="relative p-2 text-white/70 hover:text-violet-400 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-violet-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold border border-black">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" className="font-consciousness text-white/60 hover:text-violet-400 hover:bg-white/5">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="font-consciousness text-white/60 hover:text-violet-400 hover:bg-white/5">
                      Profile
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="font-consciousness text-red-400/70 hover:text-red-400 hover:bg-red-400/5"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="bg-violet-600 hover:bg-violet-500 text-white font-consciousness text-sm px-6 rounded-xl transition-all">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 top-[64px] bg-black/98 backdrop-blur-xl z-40 md:hidden transition-all duration-300 ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="h-full overflow-y-auto flex flex-col">
          {/* User account strip */}
          {user && (
            <div className="flex items-center gap-3 p-4 mb-2 border-b border-white/8">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <User className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="font-body text-sm text-white">{user.email}</p>
                <p className="font-body text-xs text-white/40">Member</p>
              </div>
            </div>
          )}

          {/* Primary action buttons */}
          <div className="grid grid-cols-2 gap-3 p-4 mb-4">
            <Link to="/courses" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 transition-all active:scale-95">
              <BookOpen className="w-6 h-6 text-violet-400" />
              <span className="font-body text-sm text-white font-medium">Courses</span>
            </Link>
            <Link to="/tutorials" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all active:scale-95">
              <GraduationCap className="w-6 h-6 text-white/60" />
              <span className="font-body text-sm text-white/80 font-medium">Tutorials</span>
            </Link>
            <Link to="/vault-access" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all active:scale-95">
              <Vault className="w-6 h-6 text-white/60" />
              <span className="font-body text-sm text-white/80 font-medium">Vault</span>
            </Link>
            <Link to="/store" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all active:scale-95">
              <Package className="w-6 h-6 text-white/60" />
              <span className="font-body text-sm text-white/80 font-medium">Store</span>
            </Link>
          </div>

          {/* Full link list */}
          <div className="px-4 space-y-1">
            {[
              { path: "/blog", label: "Blog", icon: Newspaper },
              { path: "/resources", label: "Resources", icon: FolderOpen },
              { path: "/mini-games", label: "Brain Games", icon: Brain },
              { path: "/raffles", label: "Raffles", icon: Gift },
              { path: "/earn", label: "Earn", icon: Zap },
              { path: "/roadmap", label: "Roadmap", icon: Map },
              { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
              { path: "/analytics", label: "Analytics", icon: BarChart3 },
              { path: "/philosophy", label: "Philosophy", icon: Lightbulb },
              { path: "/institutional", label: "For Professionals", icon: Building },
              { path: "/contact", label: "Contact", icon: Mail },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] font-body text-sm ${
                  isActive(item.path)
                    ? "bg-violet-500/15 text-violet-400 border border-violet-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Bottom auth actions */}
          <div className="p-4 mt-4 border-t border-white/8">
            {user ? (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/profile" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 font-body text-sm text-white/80 hover:bg-white/8 transition-all">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button onClick={handleSignOut} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 font-body text-sm text-red-400 hover:bg-red-500/15 transition-all">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/auth" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-body text-sm text-white font-medium transition-all">
                <LogIn className="w-4 h-4" />
                Sign In to Get Started
              </Link>
            )}
          </div>

          {/* Legal links */}
          <div className="flex justify-center gap-6 px-4 py-4">
            <Link to="/privacy" className="font-body text-xs text-white/30 hover:text-white/50 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="font-body text-xs text-white/30 hover:text-white/50 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;