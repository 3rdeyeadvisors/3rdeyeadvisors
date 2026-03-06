import { 
  LayoutDashboard, 
  ShoppingCart, 
  Mail, 
  Users, 
  Package,
  Gift,
  Eye,
  Activity,
  DollarSign,
  Map,
  Search
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { id: "overview", title: "Overview", icon: LayoutDashboard },
  { id: "orders", title: "Orders & Customers", icon: ShoppingCart },
  { id: "raffles", title: "Raffle Manager", icon: Gift },
  { id: "commissions", title: "Commissions", icon: DollarSign },
  { id: "participation", title: "Tutorial/Course Participation", icon: Activity },
  { id: "roadmap", title: "Roadmap Manager", icon: Map },
  { id: "seo", title: "SEO Settings", icon: Search },
  { id: "email", title: "Email Hub", icon: Mail },
  { id: "users", title: "User Management", icon: Users },
  { id: "products", title: "Products & Courses", icon: Package },
];

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { state } = useSidebar();

  return (
    <Sidebar className="w-60">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent className="font-body">
        <SidebarGroup>
          <SidebarGroupLabel className="font-consciousness uppercase tracking-widest text-violet-400/70">Sentinel DeFi Admin</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onSectionChange(item.id)}
                    className={`font-body ${activeSection === item.id ? "bg-primary/20 text-primary" : "hover:bg-primary/10"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
