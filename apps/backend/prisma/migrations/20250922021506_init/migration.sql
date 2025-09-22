-- CreateTable
CREATE TABLE "public"."comics" (
    "comic_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "characters" JSONB,
    "setting" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comics_pkey" PRIMARY KEY ("comic_id")
);

-- CreateTable
CREATE TABLE "public"."pages" (
    "page_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comic_id" UUID NOT NULL,
    "page_number" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("page_id")
);

-- CreateTable
CREATE TABLE "public"."panels" (
    "panel_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "page_id" UUID NOT NULL,
    "panel_number" INTEGER NOT NULL,
    "image_url" TEXT,
    "prompt" TEXT,
    "dialogue" TEXT,
    "layout_position" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "panels_pkey" PRIMARY KEY ("panel_id")
);

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "profile_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "display_name" VARCHAR(100),
    "bio" TEXT,
    "avatar_url" TEXT,
    "preferences" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(50),
    "email" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "auth_provider_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "idx_comics_user_id" ON "public"."comics"("user_id");

-- CreateIndex
CREATE INDEX "idx_pages_comic_id" ON "public"."pages"("comic_id");

-- CreateIndex
CREATE UNIQUE INDEX "pages_comic_id_page_number_key" ON "public"."pages"("comic_id", "page_number");

-- CreateIndex
CREATE INDEX "idx_panels_page_id" ON "public"."panels"("page_id");

-- CreateIndex
CREATE UNIQUE INDEX "panels_page_id_panel_number_key" ON "public"."panels"("page_id", "panel_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "public"."user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_profiles_user_id" ON "public"."user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_provider_id_key" ON "public"."users"("auth_provider_id");

-- CreateIndex
CREATE INDEX "idx_users_auth_provider_id" ON "public"."users"("auth_provider_id");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."comics" ADD CONSTRAINT "comics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."pages" ADD CONSTRAINT "pages_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "public"."comics"("comic_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."panels" ADD CONSTRAINT "panels_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("page_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
