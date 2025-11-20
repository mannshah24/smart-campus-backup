import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Clock } from "lucide-react";

const ELECTIVE_SUBJECTS = [
  "Machine Learning",
  "Blockchain Technology",
  "Cloud Computing",
  "Cyber Security",
  "Data Science",
  "IoT Applications",
  "Mobile App Development",
  "Artificial Intelligence",
];

export function ElectiveSelection() {
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [allocation, setAllocation] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [isAllocated, setIsAllocated] = useState(false);
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    name: user.name || "",
    prn: user.prn || "",
    class: user.className || "",
    cgpa: "",
    priority1: "",
    priority2: "",
    priority3: "",
    priority4: "",
    priority5: "",
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setFetchingStatus(true);
    try {
      const response = await fetch(`http://localhost:5000/api/student/elective-status?prn=${user.prn}`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.allocation) {
          setAllocation(data.allocation);
          // Check if student is allocated to a subject
          if (data.allocation.allocatedSubject && data.allocation.allocatedSubject !== 'Not Allocated') {
            setIsAllocated(true);
          }
        }
        
        if (data.submission) {
          setSubmission(data.submission);
          // Pre-fill form with existing submission
          setFormData({
            name: data.submission.name,
            prn: data.submission.prn,
            class: data.submission.className,
            cgpa: data.submission.cgpa.toString(),
            priority1: data.submission.priorities[0]?.subject || "",
            priority2: data.submission.priorities[1]?.subject || "",
            priority3: data.submission.priorities[2]?.subject || "",
            priority4: data.submission.priorities[3]?.subject || "",
            priority5: data.submission.priorities[4]?.subject || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch status");
    } finally {
      setFetchingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all priorities are selected and unique
    const priorities = [
      formData.priority1,
      formData.priority2,
      formData.priority3,
      formData.priority4,
      formData.priority5,
    ];

    if (priorities.some(p => !p)) {
      toast({ 
        title: "Error", 
        description: "Please select all 5 priorities",
        variant: "destructive" 
      });
      return;
    }

    const uniquePriorities = new Set(priorities);
    if (uniquePriorities.size !== 5) {
      toast({ 
        title: "Error", 
        description: "Each subject can only be selected once",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        prn: formData.prn,
        name: formData.name,
        className: formData.class,
        cgpa: parseFloat(formData.cgpa),
        priorities: [
          { subject: formData.priority1, priority: 1 },
          { subject: formData.priority2, priority: 2 },
          { subject: formData.priority3, priority: 3 },
          { subject: formData.priority4, priority: 4 },
          { subject: formData.priority5, priority: 5 },
        ]
      };

      const response = await fetch("http://localhost:5000/api/student/submit-elective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ 
          title: "Success!", 
          description: "Elective preferences submitted successfully. Check back later for allocation results." 
        });
        fetchStatus();
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
      <h2 className="text-2xl font-bold">Elective Selection</h2>

      {allocation && (
        <Card className="p-6 bg-card border-2 border-primary/50">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${allocation.allocatedSubject === 'Not Allocated' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
              {allocation.allocatedSubject === 'Not Allocated' ? (
                <Clock className="h-6 w-6 text-red-500" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Allocation Status</h3>
              {allocation.allocatedSubject === 'Not Allocated' ? (
                <p className="text-muted-foreground">Your elective has not been allocated yet. This may be due to capacity constraints.</p>
              ) : (
                <>
                  <p className="text-lg font-semibold text-green-600 mb-1">
                    Allocated: {allocation.allocatedSubject}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This was your priority {allocation.priority} choice. CGPA: {allocation.cgpa}
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {isAllocated && (
        <Card className="p-6 border-2 border-yellow-500/50 bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-600">Form Locked</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You cannot modify your preferences after allocation. Your allocated subject: <span className="font-semibold">{allocation?.allocatedSubject}</span>
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-card border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary"
                required
                disabled
              />
            </div>

            <div>
              <Label htmlFor="prn">PRN</Label>
              <Input
                id="prn"
                value={formData.prn}
                onChange={(e) => setFormData({ ...formData, prn: e.target.value })}
                className="bg-secondary"
                required
                disabled
              />
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Input
                id="class"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="bg-secondary"
                required
                disabled
              />
            </div>

            <div>
              <Label htmlFor="cgpa">CGPA</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="bg-secondary"
                required
                disabled={isAllocated}
              />
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="font-semibold text-lg">Select Your Priorities</h3>
            {[1, 2, 3, 4, 5].map((priority) => (
              <div key={priority}>
                <Label htmlFor={`priority${priority}`}>Priority {priority}</Label>
                <Select
                  value={formData[`priority${priority}` as keyof typeof formData]}
                  onValueChange={(value) => setFormData({ ...formData, [`priority${priority}`]: value })}
                  required
                  disabled={isAllocated}
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {ELECTIVE_SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={loading || isAllocated} className="w-full mt-6">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : isAllocated ? (
              "Already Allocated - Cannot Modify"
            ) : submission ? (
              "Update Preferences"
            ) : (
              "Submit Preferences"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
