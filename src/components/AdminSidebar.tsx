import { LayoutDashboard, Calendar, Bell, BookOpen, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "timetable", label: "Timetable Generator", icon: Calendar },
    { id: "events", label: "Events & Notices", icon: Bell },
    { id: "electives", label: "Elective Allocation", icon: BookOpen },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({ title: "Logged out successfully" });
    navigate("/");
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <div className="p-6">
          <h2 className="text-lg font-bold text-primary">Admin Panel</h2>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    className={activeTab === item.id ? "bg-primary text-primary-foreground" : ""}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
