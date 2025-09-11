-- Create visits table for tracking unique visitors
CREATE TABLE public.visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  page_path TEXT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all users to read and insert visits (for public visitor tracking)
CREATE POLICY "Anyone can view visits" 
ON public.visits 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert visits" 
ON public.visits 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance on frequent queries
CREATE INDEX idx_visits_visitor_date ON public.visits(visitor_id, visit_date);
CREATE INDEX idx_visits_date ON public.visits(visit_date);