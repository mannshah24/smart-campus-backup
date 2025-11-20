import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { TimetableGenerator } from "@/components/admin/TimetableGenerator";
import { EventsManagement } from "@/components/admin/EventsManagement";
import { ElectiveManagement } from "@/components/admin/ElectiveManagement";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "timetable":
        return <TimetableGenerator />;
      case "events":
        return <EventsManagement />;
      case "electives":
        return <ElectiveManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
