import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import FloatingChat from "@/components/FloatingChat";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const FindJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase.from("jobs").select(`
      *,
      employer:employer_profiles(company_name, location)
    `);

    if (!error) {
      setJobs(data || []);
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />

      <div className="container mx-auto px-6 my-16">
        <h1 className="text-4xl font-bold mb-10">Find Jobs</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.employer?.company_name}
                location={job.location}
                salaryMin={job.salary_min}
                salaryMax={job.salary_max}
                jobType={job.job_type}
                workAuthorization={job.work_authorization}
                skills={job.skills_required}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
      <FloatingChat />
    </div>
  );
};

export default FindJobs;
