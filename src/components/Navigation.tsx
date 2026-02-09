import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, LogIn, LogOut, User, ShoppingCart, ChevronDown, 
  BookOpen, BarChart3, Package, FileText, MoreHorizontal, Gift, 
  Home, Lightbulb, Vault, GraduationCap, Newspaper, FolderOpen,
  Mail, Shield, Scale, Map, Brain
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/admin";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Navigation = () => {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
    setExpandedSection(null);
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

  // Desktop navigation - main items
  const mainNavItems = [
    { path: "/", label: "Home", external: false },
    { path: "/philosophy", label: "Philosophy", external: false },
    { path: "/courses", label: "Courses", external: false },
    { path: "/tutorials", label: "Tutorials", external: false },
    { path: "/blog", label: "Blog", external: false },
    { path: "/resources", label: "Resources", external: false },
    { path: "/mini-games", label: "Mini Games", external: false },
    { path: "/raffles", label: "Raffles", external: false },
    { path: "/earn", label: "Earn", external: false },
    { path: "/vault-access", label: "Vault", external: false },
    { path: "/store", label: "Store", external: false },
  ];

  // Desktop navigation - dropdown items
  const moreNavItems = [
    { path: "/raffle-history", label: "Raffle History" },
    { path: "/roadmap", label: "Roadmap" },
    { path: "/analytics", label: "Analytics" },
    { path: "/contact", label: "Contact" },
  ];

  // Mobile navigation - clean organized sections
  const mobileNavSections = {
    main: [
      { path: "/", label: "Home", icon: Home },
      { path: "/philosophy", label: "Philosophy", icon: Lightbulb },
      { path: "/store", label: "Store", icon: Package },
      { path: "/vault-access", label: "Vault Access", icon: Vault },
    ],
    learn: {
      label: "Learn",
      icon: GraduationCap,
      items: [
        { path: "/courses", label: "Courses", icon: BookOpen },
        { path: "/tutorials", label: "Tutorials", icon: GraduationCap },
        { path: "/mini-games", label: "Mini Games", icon: Brain },
        { path: "/blog", label: "Blog", icon: Newspaper },
        { path: "/resources", label: "Resources", icon: FolderOpen },
      ]
    },
    community: {
      label: "Community & More",
      icon: Gift,
      items: [
        { path: "/raffles", label: "Raffles", icon: Gift },
        { path: "/earn", label: "Earn", icon: Gift },
        { path: "/raffle-history", label: "Raffle History", icon: BarChart3 },
        { path: "/roadmap", label: "Roadmap", icon: Map },
        { path: "/analytics", label: "Analytics", icon: BarChart3 },
        { path: "/contact", label: "Contact", icon: Mail },
      ]
    },
    legal: [
      { path: "/privacy", label: "Privacy Policy", icon: Shield },
      { path: "/terms", label: "Terms of Service", icon: Scale },
    ]
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2 group min-h-[44px]" aria-label="3rdeyeadvisors home">
            <div className="text-lg md:text-xl font-consciousness font-bold text-primary whitespace-nowrap group-hover:text-primary-glow transition-all duration-300">
              3rdeyeadvisors
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-end flex-1 ml-8 gap-1 lg:gap-4 xl:gap-6">
            <div className="flex items-center gap-4 lg:gap-6">
              {mainNavItems.slice(0, 5).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-consciousness transition-all duration-cosmic hover:text-primary whitespace-nowrap min-h-[44px] flex items-center px-2 ${
                    isActive(item.path)
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* More Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-consciousness h-auto py-1 px-2 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
                    More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[220px] gap-1 p-2 bg-popover shadow-xl">
                      {/* Remaining main items */}
                      {mainNavItems.slice(5).map((item) => (
                        <li key={item.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.path}
                              className={`block select-none space-y-1 rounded-md p-2.5 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${
                                isActive(item.path) ? "bg-accent text-accent-foreground" : ""
                              }`}
                            >
                              <div className="text-sm font-medium font-consciousness">
                                {item.label}
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                      <div className="h-px bg-border my-1" />
                      {/* Original more items */}
                      {moreNavItems.map((item) => (
                        <li key={item.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.path}
                              className={`block select-none space-y-1 rounded-md p-2.5 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${
                                isActive(item.path) ? "bg-accent text-accent-foreground" : ""
                              }`}
                            >
                              <div className="text-sm font-medium font-consciousness">
                                {item.label}
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-2 ml-2 lg:ml-4 pl-4 border-l border-border/50">
              <Link to="/cart" className="relative" aria-label={`View shopping cart with ${itemCount} items`}>
                <Button variant="ghost" size="icon" className="relative h-11 w-11" aria-hidden="true">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary hidden lg:flex h-11"
                    >
                      <Link to="/admin" className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary hidden lg:flex h-11"
                  >
                    <Link to="/profile" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 h-11"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <Button asChild variant="outline" size="sm" className="h-11">
                  <Link to="/auth" className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Cart & Menu */}
          <div className="md:hidden flex items-center space-x-2 ml-auto">
            {/* Mobile Cart */}
            <Link to="/cart" className="relative" aria-label={`View shopping cart with ${itemCount} items`}>
              <Button variant="ghost" size="icon" className="relative" aria-hidden="true">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-0 bg-background/95 backdrop-blur-lg border-t border-border z-40 animate-in slide-in-from-top-2 duration-200">
            <div className="h-full overflow-y-auto pb-20">
              {/* Account Section */}
              {user ? (
                <div className="p-4 border-b border-border/50 bg-gradient-to-b from-primary/5 to-transparent">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border border-primary/20">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Welcome back!</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className={`grid ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/30 transition-all active:scale-95"
                      >
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-xs font-medium">Admin</span>
                      </Link>
                    )}
                    <Link 
                      to="/profile"
                      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/30 transition-all active:scale-95"
                    >
                      <User className="w-5 h-5 text-primary" />
                      <span className="text-xs font-medium">Profile</span>
                    </Link>
                    
                    <Link 
                      to="/cart"
                      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/30 transition-all active:scale-95 relative"
                    >
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      <span className="text-xs font-medium">Cart</span>
                      {itemCount > 0 && (
                        <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-all active:scale-95"
                    >
                      <LogOut className="w-5 h-5 text-destructive" />
                      <span className="text-xs font-medium text-destructive">Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-border/50 bg-gradient-to-b from-primary/5 to-transparent">
                  <div className="text-center space-y-3">
                    <p className="text-sm font-medium text-foreground">Welcome to 3rdeyeadvisors</p>
                    <Button asChild className="w-full">
                      <Link to="/auth" className="flex items-center justify-center gap-2">
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Get Started</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Main Navigation */}
              <div className="p-4 space-y-6">
                {/* Primary Links */}
                <div className="space-y-1">
                  {mobileNavSections.main.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${
                        isActive(item.path)
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Learn Section */}
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSection('learn')}
                    aria-expanded={expandedSection === 'learn'}
                    aria-controls="mobile-learn-section"
                    className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all ${
                      expandedSection === 'learn' 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <span className="font-medium">{mobileNavSections.learn.label}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${
                      expandedSection === 'learn' ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  <div
                    id="mobile-learn-section"
                    className={`overflow-hidden transition-all duration-200 ${
                    expandedSection === 'learn' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {mobileNavSections.learn.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all active:scale-95 ${
                            isActive(item.path)
                              ? "bg-primary/15 border border-primary/30"
                              : "bg-card/50 border border-border/50 hover:border-primary/20"
                          }`}
                        >
                          <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium text-center ${isActive(item.path) ? 'text-primary' : ''}`}>
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Community & More Section */}
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSection('community')}
                    aria-expanded={expandedSection === 'community'}
                    aria-controls="mobile-community-section"
                    className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all ${
                      expandedSection === 'community' 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-primary" />
                      <span className="font-medium">{mobileNavSections.community.label}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${
                      expandedSection === 'community' ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  <div
                    id="mobile-community-section"
                    className={`overflow-hidden transition-all duration-200 ${
                    expandedSection === 'community' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {mobileNavSections.community.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all active:scale-95 ${
                            isActive(item.path)
                              ? "bg-primary/15 border border-primary/30"
                              : "bg-card/50 border border-border/50 hover:border-primary/20"
                          }`}
                        >
                          <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium text-center ${isActive(item.path) ? 'text-primary' : ''}`}>
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legal Links */}
                <div className="pt-4 border-t border-border/30">
                  <div className="flex justify-center gap-4">
                    {mobileNavSections.legal.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;