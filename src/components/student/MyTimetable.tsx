import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function MyTimetable() {
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState<any>(null);
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/timetable?className=${user.className}`);
      const data = await response.json();

      if (response.ok) {
        setTimetable(data.timetable);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Connection Error", description: "Unable to fetch timetable", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Timetable</h2>

      {loading ? (
        <Card className="p-12 bg-card border-border flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
      ) : timetable ? (
        <Card className="p-6 bg-card border-border">
          <h3 className="text-xl font-semibold mb-4">Class: {timetable.className}</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary">
                  <th className="border border-border p-2">Day</th>
                  {timetable.schedule[0]?.periods.map((_: any, i: number) => (
                    <th key={i} className="border border-border p-2">Period {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable.schedule.map((day: any, dayIndex: number) => (
                  <tr key={dayIndex}>
                    <td className="border border-border p-2 font-semibold bg-secondary">{day.day}</td>
                    {day.periods.map((period: any, periodIndex: number) => (
                      <td key={periodIndex} className="border border-border p-2">
                        <div className="text-sm">
                          <div className="font-semibold text-primary">{period.subject}</div>
                          <div className="text-xs text-muted-foreground mt-1">{period.teacher}</div>
                          <div className="text-xs text-muted-foreground">{period.time}</div>
                          <div className="text-xs text-muted-foreground">{period.room}</div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 bg-card border-border text-center">
          <p className="text-muted-foreground">No timetable available for your class yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Please contact your administrator.</p>
        </Card>
      )}
    </div>
  );
}
