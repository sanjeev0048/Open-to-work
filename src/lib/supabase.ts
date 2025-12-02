import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type WorkAuthorization = 
  | 'H1B' 
  | 'CPT-EAD' 
  | 'OPT-EAD' 
  | 'GC' 
  | 'GC-EAD' 
  | 'USC' 
  | 'TN';

export type UserRole = 'candidate' | 'employer' | 'admin';
