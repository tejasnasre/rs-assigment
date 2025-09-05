CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(60) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(16) NOT NULL,
	"address" varchar(400),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
