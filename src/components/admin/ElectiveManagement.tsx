import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, CheckCircle, XCircle } from "lucide-react";

export function ElectiveManagement() {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetchingData(true);
    try {
      // Fetch submissions
      const submissionsRes = await fetch("http://localhost:5000/api/admin/elective-submissions");
      const submissionsData = await submissionsRes.json();
      
      // Fetch allocations
      const allocationsRes = await fetch("http://localhost:5000/api/admin/elective-allocations");
      const allocationsData = await allocationsRes.json();
      
      if (submissionsRes.ok) {
        setSubmissions(submissionsData.submissions || []);
      }
      
      if (allocationsRes.ok) {
        setAllocations(allocationsData.allocations || []);
      }
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setFetchingData(false);
    }
  };

  const handleAllocate = async () => {
    if (submissions.length === 0) {
      toast({ 
        title: "No Submissions", 
        description: "There are no student submissions to allocate",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/allocate-electives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectCapacity: 60 }),
      });

      const data = await response.json();

      if (response.ok) {
        setAllocations(data.allocations);
        setStatistics(data.statistics);
        toast({ 
          title: "Success!", 
          description: "Electives allocated successfully based on CGPA and priorities" 
        });
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
      <h2 className="text-2xl font-bold">Elective Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-3xl font-bold mt-1">{submissions.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>
        
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Allocated</p>
              <p className="text-3xl font-bold mt-1 text-green-600">
                {allocations.filter(a => a.allocatedSubject !== 'Not Allocated').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Not Allocated</p>
              <p className="text-3xl font-bold mt-1 text-red-600">
                {allocations.filter(a => a.allocatedSubject === 'Not Allocated').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Allocation Control</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Run the allocation algorithm based on CGPA and student priorities
            </p>
          </div>
        </div>

        <Button onClick={handleAllocate} disabled={loading || submissions.length === 0} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Allocating...</> : "Run Allocation Algorithm"}
        </Button>
      </Card>

      {statistics && (
        <Card className="p-6 bg-card border-border">
          <h3 className="text-xl font-semibold mb-4">Subject-wise Allocation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statistics.subjectWiseCount).map(([subject, count]) => (
              <div key={subject} className="bg-secondary p-4 rounded-lg">
                <p className="font-semibold">{subject}</p>
                <p className="text-2xl font-bold text-primary mt-1">{count as number} students</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {fetchingData ? (
        <Card className="p-12 bg-card border-border flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
      ) : (
        <>
          {submissions.length > 0 && (
            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold mb-4">Student Submissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="p-3 text-left">PRN</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Class</th>
                      <th className="p-3 text-left">CGPA</th>
                      <th className="p-3 text-left">Priorities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-3">{sub.prn}</td>
                        <td className="p-3">{sub.name}</td>
                        <td className="p-3">{sub.className}</td>
                        <td className="p-3 font-semibold">{sub.cgpa}</td>
                        <td className="p-3">
                          <div className="text-sm space-y-1">
                            {sub.priorities.map((p: any, i: number) => (
                              <div key={i}>
                                {p.priority}. {p.subject}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {allocations.length > 0 && (
            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold mb-4">Allocation Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="p-3 text-left">PRN</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">CGPA</th>
                      <th className="p-3 text-left">Allocated Subject</th>
                      <th className="p-3 text-left">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((alloc, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-3">{alloc.prn}</td>
                        <td className="p-3">{alloc.name}</td>
                        <td className="p-3 font-semibold">{alloc.cgpa}</td>
                        <td className="p-3">
                          <span className={alloc.allocatedSubject === 'Not Allocated' ? 'text-red-600' : 'text-green-600'}>
                            {alloc.allocatedSubject}
                          </span>
                        </td>
                        <td className="p-3">{alloc.priority || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
