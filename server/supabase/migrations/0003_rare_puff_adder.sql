ALTER TABLE "store_ratings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "stores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Users can see all store ratings" ON "store_ratings" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Users can create ratings for stores" ON "store_ratings" AS PERMISSIVE FOR INSERT TO public WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "Users can update their own ratings" ON "store_ratings" AS PERMISSIVE FOR UPDATE TO public USING (user_id = current_setting('app.current_user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "Users can delete their own ratings" ON "store_ratings" AS PERMISSIVE FOR DELETE TO public USING (user_id = current_setting('app.current_user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "Store owners can see ratings for their stores" ON "store_ratings" AS PERMISSIVE FOR SELECT TO public USING (store_id IN (SELECT id FROM stores WHERE owner_id = current_setting('app.current_user_id', true)::uuid));--> statement-breakpoint
CREATE POLICY "Anyone can view active stores" ON "stores" AS PERMISSIVE FOR SELECT TO public USING (is_active = true);--> statement-breakpoint
CREATE POLICY "Store owners can view their own stores" ON "stores" AS PERMISSIVE FOR SELECT TO public USING (owner_id = current_setting('app.current_user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "Store owners can update their own stores" ON "stores" AS PERMISSIVE FOR UPDATE TO public USING (owner_id = current_setting('app.current_user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "Store owners can delete their own stores" ON "stores" AS PERMISSIVE FOR DELETE TO public USING (owner_id = current_setting('app.current_user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "Users can view their own profile" ON "users" AS PERMISSIVE FOR SELECT TO public USING (id = current_setting('app.current_user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "Users can update their own profile" ON "users" AS PERMISSIVE FOR UPDATE TO public USING (id = current_setting('app.current_user_id', true)::uuid);