-- Restrict public access to profiles to prevent email harvesting
-- 1) Drop overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 2) Allow users to read only their own profile
CREATE POLICY "Users can view their own profile - select"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 3) Allow admins or moderators to read all profiles
CREATE POLICY "Admins or moderators can view all profiles - select"
ON public.profiles
FOR SELECT
USING (public.is_admin_or_moderator(auth.uid()));