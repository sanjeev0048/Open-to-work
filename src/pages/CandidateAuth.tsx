import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCircle } from "lucide-react";

const CandidateAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // FIXED Session Check — Only redirect if role = candidate
  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "candidate") {
        navigate("/dashboard");
      }
    };

    checkRole();
  }, [navigate]);

  // SIGNUP
  const handleSignUp = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) throw signupError;
      if (!authData.user) throw new Error("Signup failed");

      const userId = authData.user.id;

      // Insert into profiles
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
        email,
        phone,
        role: "candidate",
      });

      if (profileError) throw profileError;

      // Insert into candidate_profiles
      const { error: candidateError } = await supabase
        .from("candidate_profiles")
        .insert({
          user_id: userId,
          phone,
        });

      if (candidateError) throw candidateError;

      toast({ title: "Account created successfully" });
      navigate("/dashboard");

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleSignIn = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({ title: "Welcome back!" });
      navigate("/dashboard");

    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-border/40">

        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <UserCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">
            {isSignup ? "Create Account" : "Candidate Login"}
          </h1>
          <p className="text-muted-foreground text-center">
            Get started and apply for jobs instantly!
          </p>
        </div>

        <Tabs
          value={isSignup ? "signup" : "signin"}
          onValueChange={(v) => setIsSignup(v === "signup")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <Label>Email</Label>
              <Input type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)} />

              <Label>Password</Label>
              <Input type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)} />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* SIGNUP */}
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">

              <Label>Full Name</Label>
              <Input required value={fullName}
                onChange={(e) => setFullName(e.target.value)} />

              <Label>Email</Label>
              <Input type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} />

              <Label>Phone</Label>
              <Input type="tel" placeholder="+1 555 123 4567" value={phone}
                onChange={(e) => setPhone(e.target.value)} />

              <Label>Password</Label>
              <Input type="password" required minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)} />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>

        </Tabs>
      </Card>
    </div>
  );
};

export default CandidateAuth;
