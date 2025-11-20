import { LayoutDashboard, Calendar, BookOpen, Bell, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface StudentSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function StudentSidebar({ activeTab, setActiveTab }: StudentSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "timetable", label: "My Timetable", icon: Calendar },
    { id: "electives", label: "Elective Selection", icon: BookOpen },
    { id: "events", label: "Events", icon: Bell },
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
          <h2 className="text-lg font-bold text-primary">Student Portal</h2>
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
