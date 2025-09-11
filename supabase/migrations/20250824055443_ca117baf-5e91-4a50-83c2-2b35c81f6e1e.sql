-- Create visits table to track total site visits
CREATE TABLE public.visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_path TEXT DEFAULT '/'
);

-- Enable Row Level Security
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert visits (for public tracking)
CREATE POLICY "Anyone can track visits" 
ON public.visits 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading visit counts (public stats)
CREATE POLICY "Visit stats are public" 
ON public.visits 
FOR SELECT 
USING (true);

-- Create index for better performance on queries
CREATE INDEX idx_visits_visited_at ON public.visits(visited_at);
CREATE INDEX idx_visits_page_path ON public.visits(page_path);