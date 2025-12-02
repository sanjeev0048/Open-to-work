import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Briefcase, Users, Eye } from "lucide-react";

const EmployerDashboard = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  // Job Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [skills, setSkills] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchJobs();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("employer_profiles")
      .select("*, profiles(*)")
      .eq("user_id", session.user.id)
      .single();

    if (data) setProfile(data);
  };

  const fetchJobs = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: employerProfile } = await supabase
      .from("employer_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (employerProfile) {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", employerProfile.id)
        .order("created_at", { ascending: false });

      setJobs(data || []);
    }
  };

  const fetchApplications = async (jobId: string) => {
    const { data } = await supabase
      .from("applications")
      .select(`
        *,
        candidate:candidate_profiles(
          *,
          profiles(*)
        )
      `)
      .eq("job_id", jobId);

    setApplications(data || []);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const { error } = await supabase.from("jobs").insert({
      employer_id: profile.id,
      title,
      description,
      location,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      job_type: jobType,
      skills_required: skills.split(',').map(s => s.trim()).filter(Boolean),
    });

    if (error) {
      toast({ title: "Error posting job", variant: "destructive" });
      return;
    }

    toast({ title: "Job posted successfully!" });
    setIsDialogOpen(false);
    fetchJobs();

    // Reset
    setTitle("");
    setDescription("");
    setLocation("");
    setSalaryMin("");
    setSalaryMax("");
    setSkills("");
  };

  const handleViewApplications = (job: any) => {
    setSelectedJob(job);
    fetchApplications(job.id);
  };

  if (!profile) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Post New Job</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Post a New Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePostJob} className="space-y-4">
              <Label>Job Title</Label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} />

              <Label>Description</Label>
              <Textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

              <Label>Location</Label>
              <Input required value={location} onChange={(e) => setLocation(e.target.value)} />

              <Label>Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              <Label>Required Skills (comma separated)</Label>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js" />

              <Button type="submit" className="w-full">Post Job</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Jobs Posted */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Your Job Postings</h2>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No jobs yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <Card key={job.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.location} • {job.job_type}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewApplications(job)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Applications Modal */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Applications for {selectedJob.title}</DialogTitle>
            </DialogHeader>
            {applications.length === 0 ? (
              <div className="text-center py-10">
                <Users className="mx-auto h-16 w-16 text-muted-foreground" />
                <p>No applications yet</p>
              </div>
            ) : (
              applications.map(app => (
                <Card key={app.id} className="p-4 my-2">
                  <h4 className="font-semibold">{app.candidate?.profiles?.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{app.candidate?.profiles?.email}</p>
                </Card>
              ))
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmployerDashboard;
