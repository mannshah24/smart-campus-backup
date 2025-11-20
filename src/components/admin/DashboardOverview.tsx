import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Bell, BookOpen, Loader2 } from "lucide-react";

export function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAdmins: 0,
    activeTimetables: 0,
    postedEvents: 0,
    electiveRequests: 0,
    allocatedElectives: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [usersRes, timetablesRes, eventsRes, submissionsRes, allocationsRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/users"),
        fetch("http://localhost:5000/api/admin/timetable"),
        fetch("http://localhost:5000/api/events"),
        fetch("http://localhost:5000/api/admin/elective-submissions"),
        fetch("http://localhost:5000/api/admin/elective-allocations"),
      ]);

      const users = usersRes.ok ? (await usersRes.json()).users || [] : [];
      const timetables = timetablesRes.ok ? (await timetablesRes.json()).timetables || [] : [];
      const events = eventsRes.ok ? (await eventsRes.json()).events || [] : [];
      const submissions = submissionsRes.ok ? (await submissionsRes.json()).submissions || [] : [];
      const allocations = allocationsRes.ok ? (await allocationsRes.json()).allocations || [] : [];

      setStats({
        totalStudents: users.filter((u: any) => u.type === "Student").length,
        totalAdmins: users.filter((u: any) => u.type === "Admin").length,
        activeTimetables: timetables.length,
        postedEvents: events.length,
        electiveRequests: submissions.length,
        allocatedElectives: allocations.filter((a: any) => a.allocatedSubject !== "Not Allocated").length,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsDisplay = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-blue-500" },
    { label: "Active Timetables", value: stats.activeTimetables, icon: Calendar, color: "text-purple-500" },
    { label: "Posted Events", value: stats.postedEvents, icon: Bell, color: "text-green-500" },
    { label: "Elective Requests", value: stats.electiveRequests, icon: BookOpen, color: "text-orange-500" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 bg-card border-border flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat) => (
          <Card key={stat.label} className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold mb-2">User Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Students:</span>
              <span className="font-semibold">{stats.totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admins:</span>
              <span className="font-semibold">{stats.totalAdmins}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold mb-2">Elective Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requests:</span>
              <span className="font-semibold">{stats.electiveRequests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allocated:</span>
              <span className="font-semibold text-green-600">{stats.allocatedElectives}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
