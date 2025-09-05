-- Fix RLS function and policies

-- First, drop and recreate the function to ensure it's properly defined
DROP FUNCTION IF EXISTS get_current_user_context();

-- Recreate the function with explicit column references
CREATE OR REPLACE FUNCTION get_current_user_context()
RETURNS TABLE(user_id UUID, user_role user_role, is_active BOOLEAN, email_verified BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.role, u.is_active, u.email_verified
  FROM users u
  WHERE u.id = current_setting('app.current_user_id', true)::uuid;
END;
$$;

-- Drop conflicting policies
DROP POLICY IF EXISTS "Admins can view all stores" ON stores;
DROP POLICY IF EXISTS "Admins can update all stores" ON stores;
DROP POLICY IF EXISTS "Admins can delete any store" ON stores;

-- Recreate policies with explicit references
CREATE POLICY "Admins can view all stores" ON stores 
  FOR SELECT 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

CREATE POLICY "Admins can update all stores" ON stores 
  FOR UPDATE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

CREATE POLICY "Admins can delete any store" ON stores 
  FOR DELETE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

-- Fix other policies using the get_current_user_context() function to explicitly use user_role
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

CREATE POLICY "Admins can view all profiles" ON users 
  FOR SELECT 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

CREATE POLICY "Admins can update all profiles" ON users 
  FOR UPDATE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');
    
CREATE POLICY "Admins can delete users" ON users 
  FOR DELETE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

-- Fix other policies for store_ratings
DROP POLICY IF EXISTS "Admins can update any rating" ON store_ratings;
DROP POLICY IF EXISTS "Admins can delete any rating" ON store_ratings;

CREATE POLICY "Admins can update any rating" ON store_ratings 
  FOR UPDATE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

CREATE POLICY "Admins can delete any rating" ON store_ratings 
  FOR DELETE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

-- Fix policies for refresh_tokens
DROP POLICY IF EXISTS "Admins can see all refresh tokens" ON refresh_tokens;

CREATE POLICY "Admins can see all refresh tokens" ON refresh_tokens 
  FOR SELECT 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

-- Fix policies for user_sessions
DROP POLICY IF EXISTS "Admins can see all sessions" ON user_sessions;

CREATE POLICY "Admins can see all sessions" ON user_sessions 
  FOR SELECT 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

-- Fix policy for login_attempts
DROP POLICY IF EXISTS "Admins can see all login attempts" ON login_attempts;

CREATE POLICY "Admins can see all login attempts" ON login_attempts 
  FOR SELECT 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

-- Fix policy for role_permissions
DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;

CREATE POLICY "Admins can manage role permissions" ON role_permissions 
  FOR ALL 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

-- Fix policy for stores creation
DROP POLICY IF EXISTS "Only store owners and admins can create stores" ON stores;

CREATE POLICY "Only store owners and admins can create stores" ON stores 
  FOR INSERT 
  WITH CHECK ((SELECT user_role FROM get_current_user_context()) IN ('store_owner', 'system_administrator'));
