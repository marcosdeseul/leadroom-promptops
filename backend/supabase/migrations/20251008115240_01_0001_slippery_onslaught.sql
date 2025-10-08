CREATE ROLE "authenticated";--> statement-breakpoint
CREATE INDEX "feedback_rating_idx" ON "feedback" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "prompt_versions_prompt_version_idx" ON "prompt_versions" USING btree ("prompt_id","version_number");