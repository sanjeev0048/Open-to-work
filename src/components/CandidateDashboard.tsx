import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, Clock, XCircle } from "lucide-react";

const CandidateDashboard = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchApplications();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("candidate_profiles")
      .select("*, profiles(*)")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const fetchApplications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: candidateProfile } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (candidateProfile) {
      const { data } = await supabase
        .from("applications")
        .select(`
          *,
          jobs(
            *,
            employer:employer_profiles(company_name)
          )
        `)
        .eq("candidate_id", candidateProfile.id)
        .order("applied_at", { ascending: false });

      setApplications(data || []);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile || !profile) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileExt = resumeFile.name.split('.').pop();
      const filePath = `${session.user.id}/resume.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, resumeFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("candidate_profiles")
        .update({ resume_url: publicUrl })
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      toast({
        title: "Resume uploaded successfully!",
      });
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      accepted: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (!profile) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Candidate Dashboard</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{profile.profiles.full_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{profile.profiles.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Work Authorization</Label>
                <Badge className="mt-1">{profile.work_authorization}</Badge>
              </div>
              <div>
                <Label>Resume</Label>
                {profile.resume_url ? (
                  <div className="flex items-center gap-2 mt-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <a 
                      href={profile.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      View Resume
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">No resume uploaded</p>
                )}
                <div className="mt-4">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="mb-2"
                  />
                  <Button 
                    onClick={handleResumeUpload} 
                    disabled={!resumeFile || uploading}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Resume"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Applications Section */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Your Applications</h2>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No applications yet. Start applying to jobs!
                </p>
                <Button className="mt-4" onClick={() => window.location.href = "/"}>
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card key={app.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(app.status)}
                          <h3 className="font-semibold">{app.jobs?.title}</h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {app.jobs?.employer?.company_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Applied: {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
