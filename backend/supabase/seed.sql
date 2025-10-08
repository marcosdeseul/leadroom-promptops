-- Seed data for development
-- Test data for 5 core tables: tenants, prompts, prompt_versions, prompt_executions, feedback

-- Insert test tenants
INSERT INTO tenants (id, name, plan, stripe_customer_id, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Acme Corp', 'pro', 'cus_acme123', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'TechStart Inc', 'free', NULL, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Enterprise Solutions', 'enterprise', 'cus_ent456', NOW(), NOW());

-- Insert sample prompts
INSERT INTO prompts (id, tenant_id, name, description, is_public, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Customer Support Assistant', 'Helpful customer support chatbot', FALSE, NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Marketing Email Generator', 'Generate engaging marketing emails', FALSE, NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Code Review Assistant', 'AI-powered code review assistant', TRUE, NOW(), NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Legal Document Analyzer', 'Analyze legal contracts', FALSE, NOW(), NOW());

-- Insert prompt versions
INSERT INTO prompt_versions (id, prompt_id, version_number, content, metadata_jsonb, parent_version_id, created_at) VALUES
  -- Customer Support Assistant versions
  ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'You are a helpful customer support assistant. Answer customer questions politely and professionally.', '{"optimizationType": "initial"}', NULL, NOW() - INTERVAL '7 days'),
  ('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 'You are a helpful customer support assistant. Answer questions politely, professionally, and concisely. Always ask if they need further assistance.', '{"optimizationType": "clarity", "performanceNotes": "Improved response quality"}', 'a1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '3 days'),

  -- Marketing Email Generator versions
  ('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 'Generate a marketing email for {{product_name}} with tone {{tone}}.', '{"optimizationType": "initial"}', NULL, NOW() - INTERVAL '5 days'),

  -- Code Review Assistant versions
  ('c1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 'Review the following code and provide constructive feedback: {{code}}', '{"optimizationType": "initial"}', NULL, NOW() - INTERVAL '2 days'),

  -- Legal Document Analyzer versions
  ('d1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 'Analyze the following legal document and summarize key points, risks, and obligations: {{document}}', '{"optimizationType": "initial"}', NULL, NOW() - INTERVAL '1 day');

-- Insert sample executions
INSERT INTO prompt_executions (id, tenant_id, prompt_id, version_id, llm_provider_id, model, input_variables_jsonb, response_text, response_metadata_jsonb, token_usage_jsonb, cost_usd, latency_ms, created_at) VALUES
  -- Acme Corp executions
  ('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a2222222-2222-2222-2222-222222222222', NULL, 'gpt-4', '{"question": "How do I reset my password?"}', 'To reset your password, please click on "Forgot Password" on the login page. You will receive an email with instructions to create a new password. Is there anything else I can help you with?', '{"status": "completed", "finishReason": "stop"}', '{"promptTokens": 45, "completionTokens": 38, "totalTokens": 83}', 0.002490, 1250, NOW() - INTERVAL '2 hours'),
  ('e2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b1111111-1111-1111-1111-111111111111', NULL, 'gpt-4', '{"product_name": "CloudSync Pro", "tone": "professional"}', 'Subject: Introducing CloudSync Pro - Your Data, Always in Sync\n\nDear Valued Customer,\n\nWe are excited to announce CloudSync Pro, our latest solution for seamless data synchronization...', '{"status": "completed", "finishReason": "stop"}', '{"promptTokens": 32, "completionTokens": 156, "totalTokens": 188}', 0.005640, 1820, NOW() - INTERVAL '1 hour'),

  -- TechStart executions
  ('e3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c1111111-1111-1111-1111-111111111111', NULL, 'claude-3-sonnet', '{"code": "function add(a,b){return a+b}"}', 'Code Review Feedback:\n\n1. Missing parameter types - add TypeScript types\n2. Missing JSDoc comments\n3. Consider edge cases for non-number inputs\n\nSuggested improvement:\n/**\n * Adds two numbers\n * @param {number} a - First number\n * @param {number} b - Second number\n * @returns {number} Sum of a and b\n */\nfunction add(a: number, b: number): number {\n  return a + b;\n}', '{"status": "completed", "finishReason": "end_turn"}', '{"promptTokens": 28, "completionTokens": 95, "totalTokens": 123}', 0.001845, 980, NOW() - INTERVAL '30 minutes'),

  -- Enterprise executions
  ('e4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd1111111-1111-1111-1111-111111111111', NULL, 'gpt-4', '{"document": "This Service Agreement..."}', 'Document Analysis Summary:\n\nKey Points:\n- 12-month service agreement\n- Monthly payment of $5,000\n- Automatic renewal unless terminated\n\nRisks:\n- Unlimited liability clause in Section 4.2\n- No data privacy provisions\n\nObligations:\n- Client must provide access within 5 business days\n- Provider must maintain 99.9% uptime', '{"status": "completed", "finishReason": "stop"}', '{"promptTokens": 428, "completionTokens": 112, "totalTokens": 540}', 0.016200, 2340, NOW() - INTERVAL '15 minutes');

-- Insert sample feedback
INSERT INTO feedback (id, execution_id, tenant_id, rating, comment_text, user_context_jsonb, created_at) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', TRUE, 'Very helpful response, exactly what I needed!', '{"sessionId": "sess_abc123", "deviceType": "desktop"}', NOW() - INTERVAL '1 hour 45 minutes'),
  ('f2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', TRUE, 'Great email template, saved me a lot of time.', '{"sessionId": "sess_def456", "deviceType": "mobile"}', NOW() - INTERVAL '55 minutes'),
  ('f3333333-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', TRUE, 'Excellent code review suggestions.', '{"sessionId": "sess_ghi789", "deviceType": "desktop"}', NOW() - INTERVAL '25 minutes'),
  ('f4444444-4444-4444-4444-444444444444', 'e4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', FALSE, 'Analysis was too generic, missed important clauses.', '{"sessionId": "sess_jkl012", "deviceType": "tablet", "customMetadata": {"userRole": "legal-team"}}', NOW() - INTERVAL '10 minutes');

-- Verify seed data
SELECT
  (SELECT COUNT(*) FROM tenants) as tenant_count,
  (SELECT COUNT(*) FROM prompts) as prompt_count,
  (SELECT COUNT(*) FROM prompt_versions) as version_count,
  (SELECT COUNT(*) FROM prompt_executions) as execution_count,
  (SELECT COUNT(*) FROM feedback) as feedback_count;
