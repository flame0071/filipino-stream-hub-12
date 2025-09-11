-- Add DELETE policy for recently_watched table
CREATE POLICY "Users can delete their own recently watched" 
ON public.recently_watched 
FOR DELETE 
USING (auth.uid() = user_id);