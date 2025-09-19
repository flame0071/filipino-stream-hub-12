-- Drop the existing policy that allows everyone to view custom channels
DROP POLICY IF EXISTS "Everyone can view custom channels" ON public.custom_channels;

-- Create new policy so users can only view their own custom channels
CREATE POLICY "Users can view their own custom channels" 
ON public.custom_channels 
FOR SELECT 
USING (auth.uid() = user_id);