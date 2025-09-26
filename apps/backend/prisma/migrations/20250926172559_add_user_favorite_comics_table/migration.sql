-- CreateTable
CREATE TABLE "public"."user_favorite_comics" (
    "user_id" UUID NOT NULL,
    "comic_id" UUID NOT NULL,

    CONSTRAINT "user_favorite_comics_pkey" PRIMARY KEY ("user_id","comic_id")
);

-- AddForeignKey
ALTER TABLE "public"."user_favorite_comics" ADD CONSTRAINT "user_favorite_comics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_favorite_comics" ADD CONSTRAINT "user_favorite_comics_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "public"."comics"("comic_id") ON DELETE CASCADE ON UPDATE CASCADE;
