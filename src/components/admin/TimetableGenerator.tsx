import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";

interface Teacher {
  name: string;
  subject: string;
}

export function TimetableGenerator() {
  const [loading, setLoading] = useState(false);
  const [timetables, setTimetables] = useState<any[]>([]);
  const { toast } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([{ name: "", subject: "" }]);
  const [classes, setClasses] = useState<string[]>([""]);

  const addTeacher = () => {
    setTeachers([...teachers, { name: "", subject: "" }]);
  };

  const removeTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const updateTeacher = (index: number, field: keyof Teacher, value: string) => {
    const updated = [...teachers];
    updated[index][field] = value;
    setTeachers(updated);
  };

  const addClass = () => {
    setClasses([...classes, ""]);
  };

  const removeClass = (index: number) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  const updateClass = (index: number, value: string) => {
    const updated = [...classes];
    updated[index] = value;
    setClasses(updated);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate teachers
    const validTeachers = teachers.filter(t => t.name && t.subject);
    if (validTeachers.length === 0) {
      toast({ title: "Error", description: "Please add at least one teacher with subject", variant: "destructive" });
      return;
    }

    // Validate classes
    const validClasses = classes.filter(c => c.trim());
    if (validClasses.length === 0) {
      toast({ title: "Error", description: "Please add at least one class", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/generate-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teachers: validTeachers,
          classes: validClasses,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimetables(data.timetables);
        toast({ title: "Success!", description: "Timetable generated successfully" });
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
      <h2 className="text-2xl font-bold">Timetable Generator</h2>
      
      <Card className="p-6 bg-card border-border">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-lg font-semibold">Teachers & Subjects</Label>
              <Button type="button" onClick={addTeacher} variant="outline" size="sm">
                Add Teacher
              </Button>
            </div>
            <div className="space-y-3">
              {teachers.map((teacher, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`teacher-name-${index}`}>Teacher Name</Label>
                    <Input
                      id={`teacher-name-${index}`}
                      value={teacher.name}
                      onChange={(e) => updateTeacher(index, 'name', e.target.value)}
                      placeholder="Dr. Smith"
                      className="bg-secondary"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`teacher-subject-${index}`}>Subject</Label>
                    <Input
                      id={`teacher-subject-${index}`}
                      value={teacher.subject}
                      onChange={(e) => updateTeacher(index, 'subject', e.target.value)}
                      placeholder="Mathematics"
                      className="bg-secondary"
                    />
                  </div>
                  {teachers.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeTeacher(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-lg font-semibold">Classes</Label>
              <Button type="button" onClick={addClass} variant="outline" size="sm">
                Add Class
              </Button>
            </div>
            <div className="space-y-3">
              {classes.map((className, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      value={className}
                      onChange={(e) => updateClass(index, e.target.value)}
                      placeholder="CSE-A"
                      className="bg-secondary"
                    />
                  </div>
                  {classes.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeClass(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Timetable"}
          </Button>
        </form>
      </Card>

      {timetables.length > 0 && (
        <div className="space-y-4">
          {timetables.map((tt, index) => (
            <Card key={index} className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold mb-4">Class: {tt.className}</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="border border-border p-2">Day</th>
                      {tt.schedule[0]?.periods.map((_: any, i: number) => (
                        <th key={i} className="border border-border p-2">Period {i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tt.schedule.map((day: any, dayIndex: number) => (
                      <tr key={dayIndex}>
                        <td className="border border-border p-2 font-semibold">{day.day}</td>
                        {day.periods.map((period: any, periodIndex: number) => (
                          <td key={periodIndex} className="border border-border p-2">
                            <div className="text-sm">
                              <div className="font-semibold">{period.subject}</div>
                              <div className="text-xs text-muted-foreground">{period.teacher}</div>
                              <div className="text-xs text-muted-foreground">{period.time}</div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
