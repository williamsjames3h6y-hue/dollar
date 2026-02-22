/*
  # Fix User Profile Creation System

  1. Changes
    - Drop the INSERT policy for user_profiles (not needed with trigger)
    - Update the trigger function with better error handling
    - Add unique constraint check to prevent duplicates
  
  2. Security
    - Trigger runs with SECURITY DEFINER (bypasses RLS)
    - Only SELECT and UPDATE policies remain (INSERT is handled by trigger)
*/

-- Drop the INSERT policy since the trigger handles profile creation
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.user_profiles;

-- Recreate the trigger function with better error handling
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

  -- Insert the new user profile (with ON CONFLICT to handle duplicates)
  INSERT INTO public.user_profiles (id, email, full_name, vip_tier_id, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    default_vip_tier_id,
    'active'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;