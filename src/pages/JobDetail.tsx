import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Building2, DollarSign, Briefcase, Calendar } from "lucide-react";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [user, setUser] = useState<any>(null);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);

  useEffect(() => {
    fetchJob();
    checkUser();
  }, [id]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "candidate") {
        const { data: candidateData } = await supabase
          .from("candidate_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        
        setCandidateProfile(candidateData);
      }
    }
  };

  const fetchJob = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        employer:employer_profiles(
          company_name,
          company_website,
          location,
          description
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching job:", error);
      toast({
        title: "Error",
        description: "Could not load job details",
        variant: "destructive",
      });
    } else {
      setJob(data);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!user) {
      navigate("/candidate/auth");
      return;
    }

    if (!candidateProfile) {
      toast({
        title: "Error",
        description: "Only candidates can apply for jobs",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    try {
      const { error } = await supabase.from("applications").insert({
        job_id: job.id,
        candidate_id: candidateProfile.id,
        cover_letter: coverLetter,
      });

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: "Good luck with your application!",
      });
      setCoverLetter("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-light/10">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-xl border-border/50">
            <div className="space-y-6">
              <div className="pb-6 border-b border-border/50">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {job.employer?.company_name}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    {job.job_type}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {(job.salary_min || job.salary_max) && (
                <div className="flex items-center gap-3 text-lg font-semibold text-success bg-success/10 rounded-xl p-4">
                  <DollarSign className="h-6 w-6" />
                  ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()} / year
                </div>
              )}

              {job.skills_required && job.skills_required.length > 0 && (
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    Required Skills
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill: string) => (
                      <Badge key={skill} className="bg-primary/10 text-primary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-base font-semibold mb-2 block">
                  Job Description
                </Label>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {job.employer?.description && (
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    About {job.employer.company_name}
                  </Label>
                  <p className="text-muted-foreground">
                    {job.employer.description}
                  </p>
                </div>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg text-lg h-14">
                    Apply Now
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply for {job.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverletter">Cover Letter (Optional)</Label>
                      <Textarea
                        id="coverletter"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={6}
                        placeholder="Tell the employer why you're a great fit..."
                      />
                    </div>
                    <Button 
                      onClick={handleApply} 
                      disabled={isApplying}
                      className="w-full"
                    >
                      {isApplying ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
