-- Update RLS policy to allow everyone to view custom channels
DROP POLICY "Users can view their own custom channels" ON public.custom_channels;

CREATE POLICY "Everyone can view custom channels" 
ON public.custom_channels 
FOR SELECT 
USING (true);