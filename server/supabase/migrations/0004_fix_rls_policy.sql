-- Fix RLS policies to properly reference user_role

-- First, drop all policies that have issues
DROP POLICY IF EXISTS "Admins can view all stores" ON stores;
DROP POLICY IF EXISTS "Admins can update all stores" ON stores;
DROP POLICY IF EXISTS "Admins can delete any store" ON stores;
DROP POLICY IF EXISTS "Only store owners and admins can create stores" ON stores;

DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

DROP POLICY IF EXISTS "Admins can update any rating" ON store_ratings;
DROP POLICY IF EXISTS "Admins can delete any rating" ON store_ratings;

DROP POLICY IF EXISTS "Admins can see all refresh tokens" ON refresh_tokens;
DROP POLICY IF EXISTS "Admins can see all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admins can see all login attempts" ON login_attempts;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;

-- Recreate policies with explicit user_role references
CREATE POLICY "Admins can view all stores" ON stores 
  FOR SELECT 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

CREATE POLICY "Admins can update all stores" ON stores 
  FOR UPDATE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

CREATE POLICY "Admins can delete any store" ON stores 
  FOR DELETE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

CREATE POLICY "Only store owners and admins can create stores" ON stores 
  FOR INSERT 
  WITH CHECK ((SELECT user_role FROM get_current_user_context()) IN ('store_owner', 'system_administrator'));

CREATE POLICY "Admins can view all profiles" ON users 
  FOR SELECT 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

CREATE POLICY "Admins can update all profiles" ON users 
  FOR UPDATE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');
    
CREATE POLICY "Admins can delete users" ON users 
  FOR DELETE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

CREATE POLICY "Admins can update any rating" ON store_ratings 
  FOR UPDATE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');

CREATE POLICY "Admins can delete any rating" ON store_ratings 
  FOR DELETE 
  USING ((SELECT user_role FROM get_current_user_context()) = 'system_administrator');
