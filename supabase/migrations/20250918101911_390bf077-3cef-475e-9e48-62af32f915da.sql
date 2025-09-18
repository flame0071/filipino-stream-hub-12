-- Update RLS policy to allow admins to edit any custom channel
DROP POLICY "Users can update their own custom channels" ON public.custom_channels;

CREATE POLICY "Users can update their own custom channels" 
ON public.custom_channels 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any custom channel" 
ON public.custom_channels 
FOR UPDATE 
USING (is_admin_or_moderator(auth.uid()));