-- CreateTable
CREATE TABLE "public"."user_credits" (
    "user_id" UUID NOT NULL,
    "panel_balance" INTEGER NOT NULL DEFAULT 20,
    "last_purchased_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_credits_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."credit_purchases" (
    "purchase_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "stripe_charge_id" VARCHAR(255) NOT NULL,
    "amount_dollars" INTEGER NOT NULL,
    "panels_purchased" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_purchases_pkey" PRIMARY KEY ("purchase_id")
);

-- CreateTable
CREATE TABLE "public"."panel_usage_log" (
    "usage_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "comic_id" UUID,
    "panel_id" UUID,
    "credits_consumed" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "panel_usage_log_pkey" PRIMARY KEY ("usage_id")
);

-- CreateTable
CREATE TABLE "public"."stripe_events" (
    "event_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stripe_event_id" VARCHAR(255) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "related_charge_id" VARCHAR(255),
    "processed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "idx_user_credits_last_purchase" ON "public"."user_credits"("last_purchased_at");

-- CreateIndex
CREATE UNIQUE INDEX "credit_purchases_stripe_charge_id_key" ON "public"."credit_purchases"("stripe_charge_id");

-- CreateIndex
CREATE INDEX "idx_credit_purchases_user_id" ON "public"."credit_purchases"("user_id");

-- CreateIndex
CREATE INDEX "idx_credit_purchases_created_at" ON "public"."credit_purchases"("created_at");

-- CreateIndex
CREATE INDEX "idx_panel_usage_user_id" ON "public"."panel_usage_log"("user_id");

-- CreateIndex
CREATE INDEX "idx_panel_usage_comic_id" ON "public"."panel_usage_log"("comic_id");

-- CreateIndex
CREATE INDEX "idx_panel_usage_created_at" ON "public"."panel_usage_log"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_events_stripe_event_id_key" ON "public"."stripe_events"("stripe_event_id");

-- CreateIndex
CREATE INDEX "idx_stripe_events_event_type" ON "public"."stripe_events"("event_type");

-- CreateIndex
CREATE INDEX "idx_stripe_events_processed_at" ON "public"."stripe_events"("processed_at");

-- AddForeignKey
ALTER TABLE "public"."user_credits" ADD CONSTRAINT "user_credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."credit_purchases" ADD CONSTRAINT "credit_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."panel_usage_log" ADD CONSTRAINT "panel_usage_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."panel_usage_log" ADD CONSTRAINT "panel_usage_log_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "public"."comics"("comic_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."panel_usage_log" ADD CONSTRAINT "panel_usage_log_panel_id_fkey" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("panel_id") ON DELETE SET NULL ON UPDATE NO ACTION;
