import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";
import { MyTimetable } from "@/components/student/MyTimetable";
import { ElectiveSelection } from "@/components/student/ElectiveSelection";
import { EventsFeed } from "@/components/student/EventsFeed";
import { StudentOverview } from "@/components/student/StudentOverview";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <StudentOverview />;
      case "timetable":
        return <MyTimetable />;
      case "electives":
        return <ElectiveSelection />;
      case "events":
        return <EventsFeed />;
      default:
        return <StudentOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-semibold">Student Dashboard</h1>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;
