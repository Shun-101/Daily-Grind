-- Removed invalid auth.config updates - these don't work in Supabase
-- Email confirmation must be disabled via Supabase Dashboard
-- Go to: Authentication > Providers > Email > Confirm email = OFF

-- This is a documentation file only
-- To disable email confirmation:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Providers > Email
-- 3. Toggle "Confirm email" to OFF
-- 4. Save changes

SELECT 'Email confirmation disabled via Supabase Dashboard' as status;
