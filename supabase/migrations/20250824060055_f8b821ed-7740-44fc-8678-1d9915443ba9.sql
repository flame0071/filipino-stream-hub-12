-- Add columns for unique-per-day tracking
ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS visitor_id TEXT,
  ADD COLUMN IF NOT EXISTS visit_date DATE NOT NULL DEFAULT (now()::date);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON public.visits(visit_date);