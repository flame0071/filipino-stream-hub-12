-- Create custom_channels table for user-added channels
CREATE TABLE public.custom_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  manifest_uri TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hls', 'mpd', 'youtube')),
  logo TEXT NOT NULL,
  category TEXT DEFAULT 'Custom',
  clear_key JSONB,
  embed_url TEXT,
  youtube_channel_id TEXT,
  has_multiple_streams BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_channels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own custom channels" 
ON public.custom_channels 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom channels" 
ON public.custom_channels 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom channels" 
ON public.custom_channels 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom channels" 
ON public.custom_channels 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_custom_channels_updated_at
BEFORE UPDATE ON public.custom_channels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();