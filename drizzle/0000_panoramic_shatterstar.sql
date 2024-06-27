CREATE TABLE IF NOT EXISTS "abandoned_cart_cart_item" (
	"cart_item_id" integer,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"description" varchar(1000) DEFAULT '',
	"time_submitted" timestamp,
	"quantity" integer NOT NULL,
	"sale_price" numeric(10, 2) DEFAULT '0.0',
	"addon_count" integer,
	"small_image_url" varchar(500),
	"image_url" varchar(500),
	"discount" varchar(10),
	"savings" numeric(10, 2),
	"inventory_quantity" integer,
	"contact_id" integer,
	CONSTRAINT "abandoned_cart_cart_item_pk" PRIMARY KEY("cart_item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abandoned_cart_contact" (
	"id" integer,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"business_name" varchar(255),
	"company" varchar(255),
	"salutation" varchar(50),
	"address1" varchar(255),
	"address2" varchar(255),
	"city" varchar(100),
	"state" varchar(50),
	"postal_code" varchar(50),
	"country" varchar(50),
	"primary_email_address" varchar(255),
	"notes" varchar(500),
	"alternate_email" varchar(255),
	"phone_numbers" varchar(255),
	"phone" varchar(50),
	CONSTRAINT "abandoned_cart_contact_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abandoned_cart_product_addon" (
	"product_addon_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"description" varchar(100) NOT NULL,
	"group_description" varchar(100),
	"manufacturer_sku" varchar(50),
	"inventory_product_id" integer,
	"sale_price" numeric(10, 2),
	"cart_item_addon_id" integer,
	"scart_item_id" integer,
	"quantity" integer,
	CONSTRAINT "abandoned_cart_product_addon_pk" PRIMARY KEY("scart_item_id","product_addon_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abandoned_cart_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "abandoned_cart_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abandoned_cart_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abandoned_cart_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abandoned_cart_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "abandoned_cart_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abandoned_cart_error_log" (
	"id" integer PRIMARY KEY NOT NULL,
	"contact" integer,
	"message" varchar NOT NULL,
	"created_at" date NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "abandoned_cart_cart_item" ADD CONSTRAINT "abandoned_cart_item_contact_fk" FOREIGN KEY ("cart_item_id") REFERENCES "public"."abandoned_cart_contact"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "abandoned_cart_product_addon" ADD CONSTRAINT "abandoned_cart_product_addon_cart_item_fk" FOREIGN KEY ("scart_item_id") REFERENCES "public"."abandoned_cart_cart_item"("cart_item_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "abandoned_cart_account" ADD CONSTRAINT "abandoned_cart_account_userId_abandoned_cart_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."abandoned_cart_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "abandoned_cart_session" ADD CONSTRAINT "abandoned_cart_session_userId_abandoned_cart_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."abandoned_cart_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "abandoned_cart_error_log" ADD CONSTRAINT "abandoned_cart_error_log_contact_abandoned_cart_contact_id_fk" FOREIGN KEY ("contact") REFERENCES "public"."abandoned_cart_contact"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "abandoned_cart_account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "abandoned_cart_session" ("userId");