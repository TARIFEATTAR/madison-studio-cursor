-- Enable the pg_net extension to make HTTP requests from the database
create extension if not exists "pg_net";

-- Create the function that triggers the email
create or replace function public.handle_new_user_welcome()
returns trigger as $$
declare
  project_url text := 'https://likkskifwsrvszxdvufw.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpa2tza2lmd3NydnN6eGR2dWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNjUyMDEsImV4cCI6MjA3Nzc0MTIwMX0.OE30C349lQjBiTnBnvk-MTywaN13j__oKPQEs8cO2nY';
begin
  -- Check if email was just confirmed (it was NULL, now it is NOT NULL)
  if (old.email_confirmed_at is null and new.email_confirmed_at is not null) then
    
    -- Send the request to the Edge Function
    perform
      net.http_post(
        url := project_url || '/functions/v1/send-welcome-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key
        ),
        body := jsonb_build_object(
          'userEmail', new.email,
          'userName', coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
        )
      );
      
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger on the auth.users table
-- This fires whenever a user is updated (e.g. when they confirm their email)
drop trigger if exists on_auth_user_confirmed_welcome on auth.users;
create trigger on_auth_user_confirmed_welcome
  after update on auth.users
  for each row
  execute function public.handle_new_user_welcome();
