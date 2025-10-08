# CLAUDE.md

**Keep it concise. Less code = better. Avoid unnecessary docs and samples. Keep CLAUDE.md itself concise.**

Guidance for Claude Code when working with this repository.

## Project: Leadroom PromptOps

Multi-tenant LLM Prompt Optimizer that evolves LLM prompts from users' feedback.

**Core Features**:
- Multi-tenancy: Customers mostly use this service via API
- BYOK: Customers can bring their own API key from LLM providers such as OpenAI, Anthropic
- The service provides different outputs based on different LLM models or different LLM prompt optimizations
- Multi-tenant with RLS (`tenant_id` everywhere)

## Critical Development Rules

**Check Existing Code First**: ALWAYS search for existing implementations before writing new code. NO duplicated logic should exist.

**Mandatory Pre-Implementation Checks**:
1. **Search for existing functions**: Use Serena's `find_symbol` with the function name you're about to create
2. **Search for similar patterns**: Use `search_for_pattern` to find existing implementations
3. **Check shared utilities**: Look in shared code such as `/src/database/utils/`, `/src/common/`, `/test/helpers/`
4. **Verify no duplication**: If similar code exists → import and reuse it OR extract to shared utility

**Example Workflow**:
```bash
# Before creating buildConnectionString()
mcp__serena__find_symbol "buildConnectionString"
mcp__serena__search_for_pattern "postgresql://.*password"

# If exists → import and reuse
# If not exists → create in shared location
```

**Rule**: If you find yourself copying code, you're doing it wrong. Extract to shared utility instead.

**Modularize**: Extract reusable logic to shared directories. Follow consistent interfaces and patterns across the codebase.

## Task Tracking

**CRITICAL**: Use TodoWrite tool to track all work. Update regularly, not all at once at the end.

**Best Practices**:
- Create todo list at start of work (before any coding)
- Mark tasks as `in_progress` when starting (one at a time)
- Mark tasks as `completed` immediately when done
- Update list regularly throughout work session
- Use clear, actionable task descriptions

## Serena Setup

```bash
# Activate Serena MCP for semantic code navigation
# From project root:
mcp__serena__activate_project $(pwd)
```

## Quick Commands

```bash
# Backend
cd backend
npm run dev              # Local development
npm run test:unit        # Unit tests
npm run db:generate      # Generate Drizzle migrations
npm run db:push          # Push to local Supabase

# Frontend
cd frontend
npm run dev              # Development server
npm run build            # Production build
npm run typecheck        # Type checking
```

## Architecture (MVP - Local Dev)

```
User → Next.js 15 (Chakra UI) → NestJS+Fastify → Supabase (local)
                                    ↓
                                [MCP Server]
```

**Stack**:
- Frontend: Next.js 15 + Chakra UI v3 + TanStack Query + Zustand
- Backend: NestJS + Fastify adapter + @rekog/mcp-nest
- Database: Supabase (PostgreSQL + RLS + Vault + Realtime)
- Local Dev: Custom ports (see architecture-guideline/backend.md)

**Future (v2+)**:
- Zuplo: API gateway, rate limiting, API key management
- Cloud Run: Stateless compute

## Critical Patterns

### Always Include Tenant Context
```typescript
// Tenant context set via middleware
await db.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`);

// All queries automatically filtered by RLS policies
const leads = await db.select().from(leadsTable);
```

## Database Patterns

- **Multi-tenancy**: ALL tables have `tenant_id`, RLS enforced via Drizzle TypeScript schema
- **Schema Location**: `backend/src/database/schema/` - see architecture-guideline/DATABASE.md for complete patterns
- **Migrations**: Auto-generated from TypeScript schema via 5-step workflow:
  1. Define schema in TypeScript with `pgPolicy()` for RLS
  2. `npm run db:generate` - Generate SQL migration
  3. `npm run db:copy` - Copy to `supabase/migrations/` via `scripts/copy-migrations.ts`
  4. `supabase db reset --local` - Apply to local database
  5. Verify in Supabase Studio (http://127.0.0.1:54323)

**RLS Pattern Examples** (from `backend/src/database/schema/`):
```typescript
// Standard tenant isolation (prompts, executions, feedback)
pgPolicy('table_select', {
  for: 'select',
  to: authenticatedRole,
  using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
})

// Root tenant pattern (tenants table only)
pgPolicy('tenants_select', {
  for: 'select',
  to: authenticatedRole,
  using: sql`id::text = current_setting('app.current_tenant_id', true)`,
})

// Nested RLS (prompt_versions inherits from prompts)
pgPolicy('prompt_versions_select', {
  for: 'select',
  to: authenticatedRole,
  using: sql`EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = prompt_versions.prompt_id
    AND (prompts.tenant_id::text = current_setting('app.current_tenant_id', true) OR prompts.is_public = true)
  )`,
})
```

## Development Roadmap

- **Backend**: See `backend/README.md` for architecture and GitHub issues for tasks
- **Frontend**: See `frontend/README.md` for tech stack and GitHub issues for tasks

## Git Workflow

**Quality Standards**:
- **Zero failing errors**: No failing tests or errors are acceptable
- **Coverage requirements**: Maintain or exceed current test coverage thresholds
- **CI must be green**: All checks (tests, lint, coverage) must pass

### Creating PRs

**CRITICAL**: Always run tests before raising a PR. No exceptions.

```bash
git checkout -b feature/name

# Run tests FIRST
npm run test:unit          # Backend unit tests
npm run lint               # Linting

# Only commit if tests pass
git add . && git commit -m "feat: description"
git push -u origin feature/name
gh pr create --title "feat: title" --body "Summary of changes"
```

### Verify CI Status

**After creating or updating a PR**, always check GitHub Actions:

```bash
# Check latest runs for your branch
gh run list --branch feature/name --limit 3

# View specific run details
gh run view <run-id>

# See failure logs if tests fail
gh run view <run-id> --log-failed
```

**Fix CI failures before requesting review**:
1. Address TypeScript/lint errors
2. Fix failing tests
3. **Review coverage reports** - Check for coverage recommendations
4. Push fixes and verify CI passes
5. **Ensure all checks pass** - Tests + coverage + lint must all be green
6. Only mark PR as ready when all checks are green

**Coverage Monitoring**:
- Watch for coverage percentage changes
- Review coverage comments on PR
- Address coverage drops or recommendations
- Aim to maintain or improve coverage

### PR Size Guidelines

**Target**: < 10 files, < 100 lines

**Split Strategy**:
1. Schema/migrations first
2. DTOs and interfaces
3. Business logic
4. API endpoints
5. Tests separately

**Exceptions**: Generated code, file moves, initial setup

## MCP Servers

| Server | Use For | Priority |
|--------|---------|----------|
| Serena | Code navigation, editing, refactoring | PRIMARY |
| Context7 | Framework docs, patterns | When needed |
| Sequential | Complex analysis, debugging | Complex tasks |
| Chakra | Frontend components doc | When planning on frontend |

**Key**: Always prefer Serena's semantic tools over basic Read/Write/Edit.

## Performance & Security

- **Security**: RLS on all queries (tenant isolation via `current_setting('app.current_tenant_id')`)
- **Data Protection**: Communication content auto-deleted when project archived
- **Credits**: All actions tracked and deducted atomically

## Development Workflow

0. **Create todo list** (`TodoWrite` tool) - Track all steps before starting
1. Pick task from GitHub issues (filter by priority:high)
2. **Write tests first (TDD - Red-Green-Refactor)**:
   - ✅ Write test
   - ✅ Run test → **MUST see it FAIL** (Red)
   - ✅ Implement minimal code
   - ✅ Run test → See it PASS (Green)
   - ✅ Refactor if needed
   - ⚠️ **Update todo list** - Mark tasks completed as you go (not all at end)
3. Run lint and format (`npm run lint`)
4. **Run all tests locally** (`npm run test:unit`) - Must pass before commit
5. Commit per logical change (atomic commits)
6. **Run all tests again** - Final verification before push
7. Push changes and watch CI runs (all checks must pass)
8. **Post-commit code review** - See "Post-Commit Code Review" section
9. Keep PRs small (<10 files, <100 lines)

**TDD Rule**: NEVER implement before seeing the test fail. If you can't see it fail, you're not doing TDD.

**Todo Rule**: Update todo list as you work, not in batch at the end.

## Post-Commit Code Review

**CRITICAL**: After committing and pushing (checkpoint created), run independent code review to ensure maximum reusability and zero duplication.

### Process

1. **Checkpoint First** - Commit and push changes before review
2. Run Analysis - Execute /sc:analyze --think on committed changes to identify quality issues
3. **Spawn 3 Independent Sub-Agents** - Each reviews the same code independently
4. **Same Instructions for All Agents**:
   - Review all changed code (new and existing touched files against origin mainb branch)
   - Spot duplicated logic that should be extracted
   - Identify reuse opportunities with existing codebase
   - Check for maximum reusability and modularity
   - Find common patterns that can be abstracted
5. **Agents Report Only** - Do not refactor directly, just report findings
6. **Consolidate Insights** - Review findings from all 3 agents
7. **Create Refactoring Plan** - If issues found, plan extraction/reuse work
8. **Commit Refactoring Separately** - Keep feature and refactoring commits separate

**Rule**: NO duplicated logic should exist. Always extract common utilities.

### Example Sub-Agent Invocation

```bash
# Use Task tool to spawn 3 independent reviewers
Task({
  description: "Independent code review for duplication and reusability",
  prompt: "Review recent changes in [files] against origin mainb branch. Spot: duplicated logic, reuse opportunities with existing code, extraction candidates. Report findings only, do not refactor.",
  subagent_type: "general-purpose"
})
```

## Documentation Maintenance

**CRITICAL**: After any refactoring or significant code changes, documentation MUST be updated to reflect reality.

### Post-Refactoring Checklist

1. **Check CLAUDE.md**:
   - Update architecture diagrams if structure changed
   - Update critical patterns if approach changed
   - Update database patterns if schema changed
   - Update quick commands if scripts changed

2. **Check architecture-guideline/ files**:
   - `backend.md`: Update if API patterns, middleware, or stack changed
   - `frontend.md`: Update if component patterns, state management, or UI approach changed
   - `DATABASE.md`: Update if schema, RLS policies, or tables changed

3. **Update GitHub Issues**:
   - Comment on related issue with changes made
   - Update parent issue if scope or approach changed
   - Close issue if work is complete

4. **Update PR Description**:
   - Add "Documentation Updated" section if docs were changed
   - List specific doc files updated and why

**Rule**: Code changes without documentation updates are incomplete. Always update docs as part of the refactoring commit or in immediate follow-up commit.

**When to Update**:
- ✅ Schema changes → Update DATABASE.md
- ✅ New patterns introduced → Update relevant architecture-guideline/ file
- ✅ Architecture changes → Update CLAUDE.md + backend.md/frontend.md
- ✅ New commands/scripts → Update CLAUDE.md Quick Commands
- ✅ API changes → Update backend.md
- ✅ Component patterns changed → Update frontend.md
