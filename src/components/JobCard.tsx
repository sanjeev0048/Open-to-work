import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Building2, DollarSign, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string;
  workAuthorization?: string[];
  skills?: string[];
}

const visaReplacement: Record<string, string> = {
  "H1B": "Sponsorship Available",
  "GC": "Work Permit Holder",
  "USC": "Eligible to Work",
  "OPT-EAD": "Graduate Work Permission",
  "CPT-EAD": "Internship Work Permission",
};

const JobCard = ({
  id,
  title,
  company,
  location,
  salaryMin,
  salaryMax,
  jobType,
  workAuthorization,
  skills
}: JobCardProps) => {

  const replacedAuthorization =
    workAuthorization?.map((auth) => visaReplacement[auth] || auth) || [];

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-card border-border/50 hover:-translate-y-1 group">
      <div className="space-y-4">
        
        <div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" /> {company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {location}
            </span>
          </div>
        </div>

        {(salaryMin || salaryMax) && (
          <div className="flex items-center gap-2 text-sm bg-success/10 rounded-lg p-2">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="font-semibold text-success">
              ${salaryMin?.toLocaleString()} - ${salaryMax?.toLocaleString()} / year
            </span>
          </div>
        )}

        {jobType && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <Badge variant="secondary" className="bg-primary-light/50">
              {jobType}
            </Badge>
          </div>
        )}

        {replacedAuthorization.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {replacedAuthorization.slice(0, 3).map((auth) => (
              <Badge key={auth} variant="outline" className="text-xs border-accent/50 text-accent">
                {auth}
              </Badge>
            ))}
            {replacedAuthorization.length > 3 && (
              <Badge variant="outline" className="text-xs border-accent/50 text-accent">
                +{replacedAuthorization.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 4).map((skill) => (
              <Badge key={skill} className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border-0">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <Link to={`/jobs/${id}`}>
          <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default JobCard;
