import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, BookOpen, Bell, GraduationCap, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

export function StudentOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    classesToday: 0,
    electiveStatus: "Not Submitted",
    upcomingEvents: 0,
    allocatedSubject: null as string | null,
  });
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch timetable, elective status, and events
      const [timetableRes, electiveRes, eventsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/student/timetable?className=${user.className}`),
        fetch(`http://localhost:5000/api/student/elective-status?prn=${user.prn}`),
        fetch("http://localhost:5000/api/events"),
      ]);

      const timetableData = timetableRes.ok ? await timetableRes.json() : null;
      const electiveData = electiveRes.ok ? await electiveRes.json() : null;
      const eventsData = eventsRes.ok ? await eventsRes.json() : null;

      // Calculate classes today
      let classesToday = 0;
      if (timetableData?.timetable?.schedule) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaySchedule = timetableData.timetable.schedule.find((s: any) => s.day === today);
        classesToday = todaySchedule?.periods?.length || 0;
      }

      // Determine elective status
      let electiveStatus = "Not Submitted";
      let allocatedSubject = null;
      
      if (electiveData?.allocation) {
        allocatedSubject = electiveData.allocation.allocatedSubject;
        electiveStatus = allocatedSubject === "Not Allocated" ? "Pending Allocation" : "Allocated";
      } else if (electiveData?.submission) {
        electiveStatus = "Submitted";
      }

      setStats({
        classesToday,
        electiveStatus,
        upcomingEvents: eventsData?.events?.length || 0,
        allocatedSubject,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getElectiveIcon = () => {
    if (stats.allocatedSubject && stats.allocatedSubject !== "Not Allocated") {
      return <CheckCircle className="h-12 w-12 text-green-500" />;
    } else if (stats.electiveStatus === "Submitted" || stats.electiveStatus === "Pending Allocation") {
      return <Clock className="h-12 w-12 text-yellow-500" />;
    } else {
      return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getElectiveColor = () => {
    if (stats.allocatedSubject && stats.allocatedSubject !== "Not Allocated") {
      return "text-green-500";
    } else if (stats.electiveStatus === "Submitted" || stats.electiveStatus === "Pending Allocation") {
      return "text-yellow-500";
    } else {
      return "text-red-500";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user.name || "Student"}!</h2>
          <p className="text-muted-foreground mt-1">
            Class: {user.className || "N/A"} • PRN: {user.prn || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 bg-card border-border flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const quickStats = [
    { label: "My Classes Today", value: stats.classesToday, icon: Calendar, color: "text-blue-500" },
    { 
      label: "Elective Status", 
      value: stats.allocatedSubject && stats.allocatedSubject !== "Not Allocated" 
        ? stats.allocatedSubject 
        : stats.electiveStatus, 
      icon: getElectiveIcon, 
      color: getElectiveColor() 
    },
    { label: "Upcoming Events", value: stats.upcomingEvents, icon: Bell, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {user.name || "Student"}!</h2>
        <p className="text-muted-foreground mt-1">
          Class: {user.className || "N/A"} • PRN: {user.prn || "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold mt-2 ${typeof stat.value === 'string' && stat.value.length > 15 ? 'text-lg' : 'text-3xl'}`}>
                  {stat.value}
                </p>
              </div>
              {typeof stat.icon === 'function' ? (
                stat.icon()
              ) : (
                <stat.icon className={`h-12 w-12 ${stat.color}`} />
              )}
            </div>
          </Card>
        ))}
      </div>

      {stats.allocatedSubject && stats.allocatedSubject !== "Not Allocated" && (
        <Card className="p-6 bg-card border-2 border-green-500/50">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h3 className="text-lg font-semibold text-green-500">Elective Allocated!</h3>
          </div>
          <p className="text-muted-foreground">
            Congratulations! You have been allocated to <span className="font-semibold text-green-600">{stats.allocatedSubject}</span>.
          </p>
        </Card>
      )}

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">Quick Access</h3>
        </div>
        <p className="text-muted-foreground">
          Use the sidebar to navigate to your timetable, select electives, or view upcoming events.
        </p>
      </Card>
    </div>
  );
}
