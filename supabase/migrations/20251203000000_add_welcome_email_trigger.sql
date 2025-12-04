-- Create a trigger to send welcome email on signup
-- This trigger fires when a new row is inserted into auth.users (or public.profiles)

-- First, create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_welcome()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function to send the email
  -- We use net.http_post to call the function asynchronously
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'userEmail', NEW.email,
        'userName', NEW.raw_user_meta_data->>'full_name'
      )
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block the signup if email sending fails
    RAISE WARNING 'Failed to trigger welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
-- Note: We need to be careful with triggers on auth.users. 
-- Alternatively, we can put it on public.profiles if that's where you store user data.
-- Let's check if public.profiles exists and is reliable.
-- For now, auth.users is the source of truth for "signup".

DROP TRIGGER IF EXISTS on_auth_user_created_welcome ON auth.users;
CREATE TRIGGER on_auth_user_created_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_welcome();
