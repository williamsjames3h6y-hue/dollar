/*
  # Fix User Profile Trigger Timing

  1. Changes
    - Drop existing BEFORE INSERT trigger
    - Create new AFTER INSERT trigger
    - This ensures the auth.users record exists before we try to create the profile
  
  2. Why This Fix Works
    - BEFORE triggers run before the row is inserted into auth.users
    - This causes foreign key constraint violations
    - AFTER triggers run after the row is inserted, so the FK constraint is satisfied
*/

-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to run AFTER insert (not BEFORE)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();