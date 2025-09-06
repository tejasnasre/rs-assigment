CREATE TYPE "public"."user_role" AS ENUM('system_administrator', 'normal_user', 'store_owner');--> statement-breakpoint
CREATE TABLE "store_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_store_rating" UNIQUE("user_id","store_id")
);
--> statement-breakpoint
ALTER TABLE "store_ratings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"address" varchar(400) NOT NULL,
	"description" text,
	"phone" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"average_rating" numeric(2, 1) DEFAULT '0.0',
	"total_ratings" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stores_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "stores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(60) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"address" varchar(400),
	"role" "user_role" DEFAULT 'normal_user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_token" varchar(255),
	"email_verification_expiry" timestamp,
	"password_reset_token" varchar(255),
	"password_reset_expiry" timestamp,
	"last_login" timestamp,
	"login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "store_ratings" ADD CONSTRAINT "store_ratings_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_ratings" ADD CONSTRAINT "store_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "store_ratings_created_at_idx" ON "store_ratings" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "store_ratings_rating_idx" ON "store_ratings" USING btree ("rating" int4_ops);--> statement-breakpoint
CREATE INDEX "store_ratings_store_id_idx" ON "store_ratings" USING btree ("store_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "store_ratings_user_id_idx" ON "store_ratings" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "stores_active_idx" ON "stores" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "stores_address_idx" ON "stores" USING btree ("address" text_ops);--> statement-breakpoint
CREATE INDEX "stores_email_idx" ON "stores" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "stores_name_idx" ON "stores" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "stores_owner_id_idx" ON "stores" USING btree ("owner_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "stores_rating_idx" ON "stores" USING btree ("average_rating" numeric_ops);--> statement-breakpoint
CREATE INDEX "users_active_idx" ON "users" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "users_name_idx" ON "users" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role" enum_ops);--> statement-breakpoint
CREATE POLICY "Users can see all store ratings" ON "store_ratings" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Users can create ratings for stores" ON "store_ratings" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update their own ratings" ON "store_ratings" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can delete their own ratings" ON "store_ratings" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Store owners can see ratings for their stores" ON "store_ratings" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can update any rating" ON "store_ratings" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Admins can delete any rating" ON "store_ratings" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Anyone can view active stores" ON "stores" AS PERMISSIVE FOR SELECT TO public USING ((is_active = true));--> statement-breakpoint
CREATE POLICY "Store owners can view their own stores" ON "stores" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Store owners can update their own stores" ON "stores" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Store owners can delete their own stores" ON "stores" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Admins can view all stores" ON "stores" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can update all stores" ON "stores" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Admins can delete any store" ON "stores" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Only store owners and admins can create stores" ON "stores" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can view their own profile" ON "users" AS PERMISSIVE FOR SELECT TO public USING ((id = (current_setting('app.current_user_id'::text, true))::uuid));--> statement-breakpoint
CREATE POLICY "Users can update their own profile" ON "users" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Admins can view all profiles" ON "users" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can update all profiles" ON "users" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Admins can delete users" ON "users" AS PERMISSIVE FOR DELETE TO public;