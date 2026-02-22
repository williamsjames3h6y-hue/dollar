/*
  # Create function to get all users for admin

  1. New Functions
    - `get_all_users()` - Returns all users from auth.users table
      - Only accessible by admin users
      - Returns user id, email, created_at, last_sign_in_at

  2. Security
    - Function is SECURITY DEFINER to access auth.users
    - Only callable by admin users
*/

-- Create function to get all users (admin only)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
) AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;