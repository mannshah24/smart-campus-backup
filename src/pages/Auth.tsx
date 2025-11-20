import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Shield } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    prn: "",
    type: "Student",
    email: "",
    class: "",
    password: "",
  });

  const validatePRN = (prn: string) => {
    return /^\d{10}$/.test(prn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePRN(formData.prn)) {
      toast({
        title: "Invalid PRN",
        description: "PRN must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload = mode === "signup" 
        ? { 
            name: formData.name, 
            prn: formData.prn, 
            type: formData.type, 
            email: formData.email, 
            className: formData.class, 
            password: formData.password 
          }
        : { 
            prn: formData.prn, 
            password: formData.password, 
            type: formData.type 
          };
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: "Success",
          description: `Welcome ${mode === "signup" ? "aboard" : "back"}!`,
        });
        
        if (data.user.type === "Admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Authentication failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">Smart Campus Hub</h1>
          </div>
          <p className="text-muted-foreground">Manage your academic journey</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <div className="flex gap-2 mb-6">
            <Button
              variant={mode === "signin" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("signin")}
            >
              Sign In
            </Button>
            <Button
              variant={mode === "signup" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("signup")}
            >
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary"
                />
              </div>
            )}

            <div>
              <Label htmlFor="prn">PRN (10 digits)</Label>
              <Input
                id="prn"
                type="text"
                required
                maxLength={10}
                value={formData.prn}
                onChange={(e) => setFormData({ ...formData, prn: e.target.value })}
                className="bg-secondary"
                placeholder="1234567890"
              />
            </div>

            <div>
              <Label htmlFor="type">User Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Student">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Student
                    </div>
                  </SelectItem>
                  <SelectItem value="Admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-secondary"
                  />
                </div>

                <div>
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    type="text"
                    required
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="bg-secondary"
                    placeholder="e.g., CSE-A"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-secondary"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
