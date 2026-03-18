# Rebase vs Django Admin / Flask Admin — Feature Gap Audit

## Executive Summary

Rebase already has a **very strong foundation** — CRUD, Auth, RLS, SQL Editor, Realtime, AI data enhancement, Schema-as-Code — that neither Django Admin nor Flask Admin offer out of the box. However, both Python frameworks have battle-tested admin patterns accumulated over 20+ years that Rebase currently lacks. Below are the **highest-value gaps**, ranked by impact.

---

## 🔴 High-Impact Missing Features

### 1. Bulk / Batch Actions on Selected Rows
**Django:** Select N rows → run a custom action (e.g., "Mark as published", "Delete selected", "Export selected"). Built-in `actions` system with dropdown + checkbox selection.
**Flask Admin:** Custom batch actions via decorators.

**Rebase today:** No multi-row selection or batch action system exists in the collection view. Users must edit records one at a time.

> [!IMPORTANT]
> This is probably the single most-requested admin feature globally. A checkbox column + action dropdown would be a huge quality-of-life win.

---

### 2. Inline Editing of Related / Nested Records
**Django:** `TabularInline` and `StackedInline` allow editing child records (e.g., order items) directly within the parent form (e.g., order). Supports `extra`, `min_num`, `max_num` controls.
**Flask Admin:** Inline editor for related models.

**Rebase today:** Collections support sub-collections conceptually, but there's no inline editing of related Postgres rows inside a parent entity form. Foreign-key references open in a separate side panel.

---

### 3. Server-Side Column Filters with Rich Filter Types
**Django:** `list_filter` provides sidebar filters: booleans, choices, date ranges, related objects. Custom `SimpleListFilter` for arbitrary logic.
**Flask Admin:** Customizable column filters with AJAX support.

**Rebase today:** Filtering exists at the data source level, but the UI doesn't expose a rich, extensible filter panel (date range pickers, enum selectors, boolean toggles, relational filters) comparable to Django's sidebar.

---

### 4. Global Search Across All Collections
**Django:** `search_fields` per model with `__icontains`, `__startswith`, etc. Some third-party packages add global cross-model search.
**Flask Admin:** Quick search per model.

**Rebase today:** Individual collection text search may work via the SQL backend, but there's no global search bar that finds entities across all collections simultaneously — a feature power users expect.

---

### 5. Audit Log / Action History (Change Tracking)
**Django:** Built-in `LogEntry` model tracks every create/update/delete with user, timestamp, object repr, and action type. Viewable per-object ("History" button) and globally.
**Flask Admin:** No built-in equivalent.

**Rebase today:** `entity_history` package exists but tracks field-level diffs. There's no centralized, queryable **audit log** view showing "User X changed field Y on Record Z at time T" across the entire system. The Django-style "Recent Actions" dashboard widget is also absent.

---

### 6. Customizable Admin Dashboard / Home Page Widgets
**Django:** Third-party packages (Grappelli, Jazzmin, JET) offer fully configurable dashboards with charts, recent activity, quick links, stats counters.
**Flask Admin:** Dashboard via custom index view.

**Rebase today:** `ContentHomePage` and `StudioHomePage` exist but appear to be static. There's no widget system for users/admins to add KPI cards, charts, recent-activity feeds, or quicklinks to the home screen.

---

## 🟠 Medium-Impact Missing Features

### 7. Fieldsets / Grouped Form Sections
**Django:** `fieldsets` organizes the edit form into collapsible, titled sections (e.g., "General Info", "SEO", "Advanced"). Each section can have its own `description` and `classes`.

**Rebase today:** Properties are rendered flat. No native concept of grouping fields into named, collapsible sections within the entity form editor. (Collections have `properties`, but there is no `fieldsets` grouping.)

---

### 8. Read-Only Fields on Forms
**Django:** `readonly_fields` displays fields as non-editable text in the form, useful for computed values, timestamps, auto-IDs.

**Rebase today:** Properties can be configured as `readOnly` in TypeScript, but it's unclear if there's a declarative per-form-field read-only attribute exposed in the Studio UI or collection config.

---

### 9. `list_display` Callable / Computed Columns
**Django:** `list_display` can include methods that compute derived values (e.g., full name from first+last, formatted currency). These show in the table but aren't real DB columns.

**Rebase today:** Collection table columns map to actual properties. There's no easy mechanism for developers to add computed/virtual columns (e.g., `fullName`) that display in the table without being persisted.

---

### 10. Drag-and-Drop Reordering
**Django (third-party):** `django-admin-sortable2` enables drag-and-drop row ordering in the list view, persisting sort order to an integer column.
**Flask Admin:** No built-in support.

**Rebase today:** Not supported. Collections render in their natural or sorted order — no drag-and-drop to manually reorder items in the list view.

---

### 11. Save As New / Duplicate Record
**Django 5.2:** `save_as` adds a "Save as new" button, creating a copy of the current record.

**Rebase today:** No "Duplicate" or "Save as new" button on entity forms. Users must manually re-enter data to create a copy.

---

### 12. Object-Level Permissions (Row-Level in the UI)
**Django:** Granular `has_view_permission`, `has_change_permission`, `has_delete_permission`, `has_add_permission` per model and per object. Can restrict what specific users see or edit.
**Flask Admin:** `is_accessible()` method per view.

**Rebase today:** RLS exists at the Postgres level and there's a roles system, but the frontend doesn't appear to enforce fine-grained per-collection or per-record permission checks (e.g., "editors can only edit their own records", "viewers can't see salary column").

---

### 13. Prepopulated / Auto-Slug Fields
**Django:** `prepopulated_fields` auto-generates slug fields from title fields in real time as the user types.

**Rebase today:** No auto-slugification or dependent-field auto-population in the form editor.

---

## 🟡 Lower-Impact but Nice-to-Have Features

### 14. Autocomplete for Foreign Key / Relation Fields
**Django:** `autocomplete_fields` provides AJAX-powered search for FK fields, critical when a related table has 10K+ rows.
**Flask Admin:** AJAX FK loaders.

**Rebase today:** Relation fields may use a popup selector, but AJAX-powered type-ahead autocomplete for large tables would improve UX significantly.

---

### 15. Date Hierarchy Navigation
**Django:** `date_hierarchy` adds a drill-down date navigation bar (Year → Month → Day) at the top of the list view.

**Rebase today:** No equivalent date-based drill-down navigation.

---

### 16. CSV/JSON/TSV Export with Column Selection
**Django (third-party):** `django-import-export` provides format selection, field mapping, and preview before export.
**Flask Admin:** TSV and JSON export.

**Rebase today:** `data_export` package exists, but it's unclear if users can select which columns to export, choose formats (CSV vs JSON vs Excel), or preview before downloading.

---

### 17. Model-Level Help Text / Documentation
**Django:** Every field can have `help_text` shown below the input. Models can have descriptions shown at the top of the form.

**Rebase today:** Properties support `description` in the config, but having richer per-field contextual help (tooltips, inline documentation links) in the Studio UI would match Django's developer experience.

---

### 18. Admin Honeypot / Login Security
**Django (third-party):** `django-admin-honeypot` sets up a decoy login page to detect intrusion attempts. `django-two-factor-auth` adds 2FA.

**Rebase today:** Auth supports email + Google login, but no 2FA, rate limiting display, or honeypot is visible.

---

## ✅ Where Rebase Already Wins

For context, here's what Rebase has that **neither Django Admin nor Flask Admin offer** natively:

| Feature | Rebase | Django Admin | Flask Admin |
|---|---|---|---|
| **SQL Editor** in admin | ✅ | ❌ | Limited (Redis CLI) |
| **RLS Policy Editor** | ✅ | ❌ | ❌ |
| **Schema-as-Code (AST)** | ✅ | ❌ | ❌ |
| **AI Data Enhancement** | ✅ | ❌ | ❌ |
| **Realtime WebSockets** | ✅ | ❌ | ❌ |
| **Visual Collection Builder** | ✅ | ❌ | ❌ |
| **MCP Server** | ✅ | ❌ | ❌ |
| **Rich Text Editor** (Notion-like) | ✅ | ❌ | ❌ |
| **Media Manager** | ✅ | Basic | Basic |
| **Self-hosted Docker** | ✅ | Manual | Manual |
| **TypeScript-native** | ✅ | Python | Python |

---

## Recommended Priority Order

If I had to pick the **top 5** to implement first for maximum impact:

1. **Bulk / Batch Actions** — table stakes for any admin panel
2. **Inline Editing of Related Records** — key for one-to-many workflows
3. **Rich Filterable Sidebar** — power users need this daily
4. **Audit Log Dashboard** — compliance & team trust
5. **Dashboard Widgets** — first impression + daily utility
