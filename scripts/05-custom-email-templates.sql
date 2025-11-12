-- Custom email templates for Daily Grind
-- Note: These templates need to be configured in Supabase Dashboard > Authentication > Email Templates
-- This script documents the templates to use

-- CONFIRMATION EMAIL TEMPLATE
-- Subject: Let's Get This Grind Started! Confirm Your Daily Grind Account
-- 
-- Body HTML:
-- <h2>Hey there!</h2>
-- <p>You're just one click away from starting your Daily Grind journey. We're ready to help you hit your goals, whatever they may be.</p>
-- <p>Tap the button below to confirm your email and unlock your new account:</p>
-- <p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Confirm and Start the Grind!</a></p>
-- <p>If you have any trouble, just reply to this email, and we'll help you out.</p>
-- <p>See you on the inside,<br>The Daily Grind Crew</p>

-- WELCOME EMAIL (sent after confirmation via trigger)
-- This will be handled by the application after successful email verification

-- Instructions:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Email Templates
-- 3. Update the "Confirm signup" template with the above content
-- 4. Set the redirect URL to: {{ .SiteURL }}/auth/callback?next=/auth/signin?verified=true

SELECT 'Email templates configured in Supabase Dashboard' as status;
