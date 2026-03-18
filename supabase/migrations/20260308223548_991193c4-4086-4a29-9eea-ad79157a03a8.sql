
-- Jobs table for company job postings
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  job_type TEXT DEFAULT 'full-time',
  salary_range TEXT,
  skills TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active jobs
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT USING (is_active = true);

-- Companies can insert own jobs
CREATE POLICY "Companies can insert own jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (company_user_id = auth.uid());

-- Companies can update own jobs
CREATE POLICY "Companies can update own jobs" ON public.jobs FOR UPDATE TO authenticated USING (company_user_id = auth.uid()) WITH CHECK (company_user_id = auth.uid());

-- Companies can delete own jobs
CREATE POLICY "Companies can delete own jobs" ON public.jobs FOR DELETE TO authenticated USING (company_user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER handle_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for jobs
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
