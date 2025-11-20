import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Loader2 } from "lucide-react";

export function EventsManagement() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/events");
      const data = await response.json();
      if (response.ok) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events");
    }
  };

  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "Event posted successfully!" });
        setFormData({ title: "", description: "", date: "" });
        fetchEvents();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Connection Error", description: "Unable to connect to server", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Events & Notices</h2>

      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-4">Post New Event</h3>
        <form onSubmit={handlePostEvent} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-secondary"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-secondary"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Event Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-secondary"
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : "Post Event"}
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Events</h3>
        {events.length === 0 ? (
          <Card className="p-6 bg-card border-border text-center text-muted-foreground">
            No events posted yet
          </Card>
        ) : (
          events.map((event, index) => (
            <Card key={index} className="p-6 bg-card border-border">
              <div className="flex items-start gap-4">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{event.title}</h4>
                  <p className="text-muted-foreground mt-1">{event.description}</p>
                  <p className="text-sm text-primary mt-2">{event.date}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
