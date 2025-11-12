-- Improved email verification function with better error handling
-- Re-enable email confirmation for production security

-- Create or replace the email verification check function
CREATE OR REPLACE FUNCTION public.is_email_verified(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND email_confirmed_at IS NOT NULL
  );
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Instructions for enabling email confirmation:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Providers > Email
-- 3. Toggle "Confirm email" to ON
-- 4. Configure Email Templates (see scripts/05-custom-email-templates.sql)
-- 5. Set redirect URLs in Authentication > URL Configuration

SELECT 'Email confirmation enabled - configure in Supabase Dashboard' as status;
