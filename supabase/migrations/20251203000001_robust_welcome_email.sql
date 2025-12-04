-- Enable the pg_net extension to make HTTP requests
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Create a function to call the Edge Function
CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user is confirmed and it's a new confirmation (or new confirmed user)
  IF (NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at)) OR (TG_OP = 'INSERT' AND NEW.email_confirmed_at IS NOT NULL) THEN
    
    -- Call the Edge Function
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
      
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_confirmed_welcome ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_welcome
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_welcome_email();
