CREATE TABLE "prompt_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"prompt_id" uuid NOT NULL,
	"version_id" uuid NOT NULL,
	"llm_provider_id" uuid,
	"model" text NOT NULL,
	"input_variables_jsonb" jsonb,
	"response_text" text NOT NULL,
	"response_metadata_jsonb" jsonb,
	"token_usage_jsonb" jsonb,
	"cost_usd" numeric(10, 6),
	"latency_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prompt_executions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rating" boolean NOT NULL,
	"comment_text" text,
	"user_context_jsonb" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "prompt_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"content" text NOT NULL,
	"metadata_jsonb" jsonb,
	"parent_version_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prompt_versions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prompts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "prompt_executions" ADD CONSTRAINT "prompt_executions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_executions" ADD CONSTRAINT "prompt_executions_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_executions" ADD CONSTRAINT "prompt_executions_version_id_prompt_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."prompt_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_execution_id_prompt_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."prompt_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_parent_version_id_fkey" FOREIGN KEY ("parent_version_id") REFERENCES "public"."prompt_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prompt_executions_tenant_id_idx" ON "prompt_executions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "prompt_executions_prompt_id_idx" ON "prompt_executions" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_executions_version_id_idx" ON "prompt_executions" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "prompt_executions_created_at_idx" ON "prompt_executions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "prompt_executions_llm_provider_id_idx" ON "prompt_executions" USING btree ("llm_provider_id");--> statement-breakpoint
CREATE INDEX "feedback_execution_id_idx" ON "feedback" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "feedback_tenant_id_idx" ON "feedback" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tenants_stripe_customer_id_idx" ON "tenants" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "prompt_versions_prompt_id_idx" ON "prompt_versions" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_versions_version_number_idx" ON "prompt_versions" USING btree ("version_number");--> statement-breakpoint
CREATE INDEX "prompt_versions_parent_version_id_idx" ON "prompt_versions" USING btree ("parent_version_id");--> statement-breakpoint
CREATE INDEX "prompts_tenant_id_idx" ON "prompts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "prompts_is_public_idx" ON "prompts" USING btree ("is_public");--> statement-breakpoint
CREATE POLICY "prompt_executions_select" ON "prompt_executions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (tenant_id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "prompt_executions_insert" ON "prompt_executions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "prompt_executions_update" ON "prompt_executions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (tenant_id::text = current_setting('app.current_tenant_id', true)) WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "prompt_executions_delete" ON "prompt_executions" AS PERMISSIVE FOR DELETE TO "authenticated" USING (tenant_id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "feedback_select" ON "feedback" AS PERMISSIVE FOR SELECT TO "authenticated" USING (tenant_id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "feedback_insert" ON "feedback" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "feedback_update" ON "feedback" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (tenant_id::text = current_setting('app.current_tenant_id', true)) WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "feedback_delete" ON "feedback" AS PERMISSIVE FOR DELETE TO "authenticated" USING (tenant_id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "tenants_select" ON "tenants" AS PERMISSIVE FOR SELECT TO "authenticated" USING (id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "tenants_insert" ON "tenants" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "tenants_update" ON "tenants" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (id::text = current_setting('app.current_tenant_id', true)) WITH CHECK (id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "tenants_delete" ON "tenants" AS PERMISSIVE FOR DELETE TO "authenticated" USING (id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "prompt_versions_select" ON "prompt_versions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
        SELECT 1 FROM prompts 
        WHERE prompts.id = prompt_versions.prompt_id 
        AND (prompts.tenant_id::text = current_setting('app.current_tenant_id', true) OR prompts.is_public = true)
      ));--> statement-breakpoint
CREATE POLICY "prompt_versions_insert" ON "prompt_versions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
        SELECT 1 FROM prompts 
        WHERE prompts.id = prompt_versions.prompt_id 
        AND prompts.tenant_id::text = current_setting('app.current_tenant_id', true)
      ));--> statement-breakpoint
CREATE POLICY "prompt_versions_update" ON "prompt_versions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM prompts 
        WHERE prompts.id = prompt_versions.prompt_id 
        AND prompts.tenant_id::text = current_setting('app.current_tenant_id', true)
      )) WITH CHECK (EXISTS (
        SELECT 1 FROM prompts 
        WHERE prompts.id = prompt_versions.prompt_id 
        AND prompts.tenant_id::text = current_setting('app.current_tenant_id', true)
      ));--> statement-breakpoint
CREATE POLICY "prompt_versions_delete" ON "prompt_versions" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM prompts 
        WHERE prompts.id = prompt_versions.prompt_id 
        AND prompts.tenant_id::text = current_setting('app.current_tenant_id', true)
      ));--> statement-breakpoint
CREATE POLICY "prompts_select" ON "prompts" AS PERMISSIVE FOR SELECT TO "authenticated" USING (tenant_id::text = current_setting('app.current_tenant_id', true) OR is_public = true);--> statement-breakpoint
CREATE POLICY "prompts_insert" ON "prompts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "prompts_update" ON "prompts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (tenant_id::text = current_setting('app.current_tenant_id', true)) WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "prompts_delete" ON "prompts" AS PERMISSIVE FOR DELETE TO "authenticated" USING (tenant_id::text = current_setting('app.current_tenant_id', true));