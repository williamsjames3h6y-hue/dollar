/*
  # Create User Profile Automatically on Signup

  1. Changes
    - Create a trigger function that automatically creates a user profile when a new auth user is created
    - This eliminates the RLS policy issues during signup since it runs as the database owner
  
  2. Security
    - Function runs with SECURITY DEFINER (elevated privileges)
    - Automatically assigns VIP tier level 1 to new users
    - Creates profile synchronously with auth user creation
*/

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_vip_tier_id uuid;
BEGIN
  -- Get the VIP tier ID for level 1
  SELECT id INTO default_vip_tier_id
  FROM public.vip_tiers
  WHERE level = 1
  LIMIT 1;

  -- Insert the new user profile
  INSERT INTO public.user_profiles (id, email, full_name, vip_tier_id, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    default_vip_tier_id,
    'active'
  );

  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();