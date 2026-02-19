# FireCMS v4 — AI & Dataki Integration Notes

> Consolidated findings from the Feb 2025 exploration of AI integration strategy, Dataki dashboard blending, and self-hosted backend architecture.

---

## 1. Existing AI Features in FireCMS

| Package | What It Does | API Pattern |
|---------|-------------|-------------|
| `@firecms/data_enhancement` | Streaming form field suggestions via LLM | `POST /data/enhance_stream/` → SSE |
| `@firecms/datatalk` | NL chat interface for querying data | `POST /datatalk/command` → SSE |
| `@firecms/collection_editor` | AI-generated collection schemas from prompts | `POST /collections/generate` → JSON |
| `@firecms/schema_inference` | Infer schemas from existing data | Local inference |

All AI calls currently go to `https://api.firecms.co` — a hard dependency on the hosted backend.

---

## 2. Competitive Landscape (2025-2026)

- **Retool**: AI App Generation, Retool Agents (autonomous bots), AI Assist (query/UI generation)
- **Supabase**: Schema-aware SQL AI Assistant, error detection, optimization, test data generation
- **Airtable**: Cobuilder (prompt → project), AI Fields (column-level AI), Omni Assistant
- **Notion**: AI Agents (autonomous workflows), Custom Autofill Properties
- **Emerging**: MCP (Model Context Protocol) — open standard for AI ↔ tools interaction. No admin panel competitor has shipped an MCP server yet.

**FireCMS's moat**: Full SQL schema awareness (tables, FKs, indexes, constraints via Drizzle). Every competitor doing generic LLM integration can't match schema-aware accuracy.

---

## 3. Prioritized AI Feature Ideas

### Phase 1 — High Impact, Leverages Existing Architecture
1. **NL → SQL Query Builder** — Evolve DataTalk for Postgres, schema-aware SQL generation
2. **AI Data Entry Assistant** — Evolve `data_enhancement` with batch mode, cross-reference fill
3. **AI Schema Designer** — Generate DDL + Drizzle schema + migrations from prompts
4. **MCP Server** — Expose FireCMS as an AI-accessible data layer

### Phase 2 — Enterprise Appeal
5. AI Dashboard / Analytics Agent
6. AI Content Generation Fields (`ai_generated` property type)
7. AI Data Quality Agent (duplicates, inconsistencies, completeness)

### Phase 3 — Competitive Moat
8. AI Workflow / Automation Builder
9. AI Access Control Advisor (RBAC suggestions from audit logs)
10. Custom AI Agents (Support Agent, Inventory Agent)

### Phase 4 — Advanced
11. Predictive Fields & Anomaly Detection (pgvector, embeddings)

---

## 4. Dataki Dashboard Integration Design

### Decision: Unified Workspace (Approach A)

Dashboards become **first-class navigation entries** alongside collections and views. Not segregated into a separate mode.

**Key type change** in `packages/types/src/controllers/navigation.ts`:
```typescript
// NavigationEntry.type extended:
type: "collection" | "view" | "admin" | "dashboard"
```

**Home page**: Dashboard cards appear in the same grid as collection cards, with distinct visual styling (chart icon, widget count, mini-preview). Users can drag-and-drop dashboards into any group alongside collections.

**Drawer**: Dashboards appear inline with collections in groups. AI Assistant elevated from hidden admin route to persistent drawer entry.

**Drill-down** (key differentiator): Clicking a chart widget navigates to the underlying collection view, pre-filtered.

### Drill-Down Technical Approach

Dataki widgets = SQL query + Vega spec. Drill-down works by:
1. **Vega signals** capture click events (data point behind clicked bar/slice)
2. **SQL `FROM` clause** → maps to FireCMS collection via `collection.path`/`dbPath`
3. **Clicked dimension values** → converted to FireCMS `FilterValues`
4. Navigate to collection pre-filtered

Start with automatic resolution (parse SQL → find collection → navigate). Add explicit config for complex cases later.

### Files to Modify
- `packages/types/src/controllers/navigation.ts` — extend `NavigationEntry`, add `DashboardEntry`
- `packages/firecms_core/src/components/HomePage/NavigationCardBinding.tsx` — dashboard card variant
- `packages/firecms_core/src/components/HomePage/DefaultHomePage.tsx` — updated search, dashboard support
- `packages/firecms_core/src/core/DefaultDrawer.tsx` — dashboard items + AI assistant entry
- `packages/firecms_core/src/core/NavigationRoutes.tsx` — dashboard routes

---

## 5. Self-Hosted AI Backend Architecture

### The Problem
Enterprise customers run FireCMS v4 via Docker. AI calls to `api.firecms.co` are a non-starter for data sovereignty, network isolation, compliance (GDPR/HIPAA/SOC2), and cost control.

### Recommended: Hybrid (Model 3), Then Self-Hosted (Model 2)

**Model 3 (Hybrid)** — Ship first:
- Backend proxies AI calls to `api.firecms.co` (sends only schema + prompt, never data)
- SQL execution happens locally against customer's Postgres
- Actual data never leaves customer infrastructure

**Model 2 (Self-Hosted)** — Build toward:
- AI service bundled into Docker image
- Customer provides own LLM API key (BYOK: OpenAI, Azure OpenAI, Bedrock, Ollama)
- Nothing leaves customer infrastructure

### Technical Design

AI becomes the fourth optional module in `initializeFireCMSBackend` (alongside auth, storage, datasources):

```typescript
await initializeFireCMSBackend({
    collections, server, app,
    datasource: { connection: db, schema: { tables, enums, relations } },
    auth: { jwtSecret: "..." },
    storage: { type: "local", basePath: "./uploads" },
    ai: {                           // NEW
        mode: "self-hosted",        // "cloud" | "self-hosted" | "disabled"
        llm: { provider: "openai", apiKey: "sk-..." }
    }
});
```

**New backend routes**: `/api/ai/query`, `/api/ai/enhance`, `/api/ai/generate-collection`, `/api/ai/generate-widget`, `/api/ai/suggestions`

**LLM Provider abstraction**: Supports OpenAI, Azure OpenAI, AWS Bedrock, Anthropic, Ollama, and custom endpoints.

**Frontend change**: Replace hardcoded `api.firecms.co` with configurable endpoint defaulting to local backend (`/api/ai`).

### Components to Build

| Component | Location | Effort |
|-----------|----------|--------|
| `AIConfig` in backend config | `packages/backend/src/init.ts` | Small |
| `AIService` interface + cloud impl | `packages/backend/src/ai/` | Medium |
| Express AI routes | `packages/backend/src/ai/routes.ts` | Small |
| Schema context builder | `packages/backend/src/ai/schema.ts` | Medium |
| Frontend configurable endpoint | `datatalk`, `data_enhancement` | Small |
| Self-hosted AI service | `packages/backend/src/ai/` | Large |
| LLM provider abstraction | `packages/backend/src/ai/providers/` | Medium |
| SQL/Vega generation prompts | `packages/backend/src/ai/prompts/` | Large |
| Dashboard persistence | `packages/backend/src/ai/dashboards.ts` | Medium |

---

## 6. Architectural Principles

1. **Schema-Aware Everything** — All AI features leverage full SQL schema context
2. **BYOM (Bring Your Own Model)** — Configurable LLM providers
3. **Human-in-the-Loop by Default** — User review for AI-generated actions/queries
4. **Streaming-First** — Standardized streaming architecture across AI features
5. **Audit Everything** — Log all AI actions for compliance
6. **Plugin Pattern** — AI features as optional modules, not hard dependencies
