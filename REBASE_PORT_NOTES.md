# Rebase → FireCMS frontend port — status & plan

Branch: `rebase-frontend-port`. Goal: bring Rebase's frontend improvements into
FireCMS **with no API-breaking changes at any level**, each change guarded by a
regression test.

Reference fork: `/Users/francesco/rebase` (FireCMS is its `upstream`).
Fork point: `24c82709` (2026-02-24). Rebase is ~836 commits ahead, FireCMS ~225.
Drift is **bidirectional** — this is a reimplementation-with-reference job, not a
cherry-pick (paths + packages were renamed: `@firecms/*` → `@rebasepro/*`,
`firecms_core` split into `packages/app` + `packages/common` + `packages/forms`,
`collection_editor`/`entity_history` folded into `packages/admin`).

## Done on this branch (safe, additive, tested)

1. **UI test harness** — jest + jsdom + testing-library for `@firecms/ui`
   (the jest config already referenced a `styleMock` that didn't exist), plus an
   **API-surface test** (`packages/ui/test/api-surface.test.ts`) that locks the
   public export contract so accidental removals fail CI.
2. **`FilterChip`** — new toggle chip for filter presets (net-new component).
3. **`useDebounceCallback`** — new hook that debounces a *function call*
   (complements the existing value-debounce `useDebounceValue`), hardened with a
   stable callback ref + unmount cleanup.
4. **`Chip` `smallest` size** — new optional enum value; existing sizes/default
   locked by regression test.

All 123 UI tests pass; `packages/ui` typechecks clean.

## Evaluated and deliberately NOT ported

- **Component visual redesigns** (`Button`, `Chip` recolor, `Tabs`, `Select`,
  `TextField`, …): Rebase reworked colors/radius/shadow/spacing. These change
  appearance for *every* existing consumer — a visual break — with **no new
  props**. Skipped under the no-breaking-changes rule. (`Button` e.g. is purely
  `rounded-md`→`rounded-lg`, shadow removal, hover-brightness; no API delta.)
- **`ErrorBoundary`, `CircularProgressCenter`**: already exist in `firecms_core`.
  Rebase merely *relocated* them into the UI kit. Adding UI-kit copies would risk
  duplicate-export conflicts.
- **`VirtualTable*`, collection views (`ListView`/`CardView`/`KanbanView`/…)**:
  Rebase moved these from the app into the UI kit and extracted editable cells.
  FireCMS already has all of this in `firecms_core` (Kanban, card, table, view
  toggle). Relocation, not new capability.
- **App-level components** (`*Binding`, `*StudioView`, RLS/Admin/DataDriver
  contexts): part of Rebase's headless-binding + BaaS architecture, coupled to
  its backend. Porting = adopting that architecture = large breaking changes.

## Remaining value, gated on decisions (not safe to port unattended)

These are real frontend improvements but each needs a translation layer
(`packages/app` → `firecms_core`) and, more importantly, can't be regression
-tested cheaply (they need heavy FireCMS context mocking) — so they violate the
"tests before changes" rule if done blind. Recommend tackling with the app
runnable for manual verification:

- Search state → URL sync (`b6f40f86f`) — extends the URL-filter sync already at
  our fork point; additive.
- Side-panel navigation-blocking fix (`229a628d8`, `6f0664166`) — bug fix.
- `EntityEditView` tab-mount optimization (`08e916cdb`).
- Collection-view + side-navigation scroll fixes (`d6e104b23`, `b4222f3fb`,
  `33aae6c14`).
- Status-field inference improvement (`6f0664166`).
- Schema-drift banner + collection-list preview polish (`0a14d4dab`).

## Architectural (design decision required, out of scope for a UI sync)

Headless forms & headless collection editor (`71889aa71`, `bc8857873`),
properties/relations/references overlap refactor (`cf3cac69b`, `6ab1ac071`),
multi-datasource architecture (`2a283e096`). Better designs, but breaking to
FireCMS's public API and partly in service of Rebase's backend. Needs a
convergence decision (keep forks separate vs. adopt Rebase's package structure)
before any porting.

## Open questions for Francesco (biggest lever first)

1. **Does "no API-breaking changes" also forbid visual changes?** Rebase's
   largest frontend delta is a **visual restyle** of the UI kit (Button/Tabs/Chip
   recolors, `rounded-md`→`rounded-lg`, shadow removal, hover-brightness, new
   disabled opacities). These keep the **API identical** (same props, same
   exports) but change how every consumer *looks*. I did **not** apply them
   unattended — a sweeping restyle I can't eyeball is hard to un-surprise, and
   some Rebase classes reference tokens that may not map 1:1 in FireCMS. If you
   want the visual polish, say so and I'll port it component-by-component (one
   commit each, API locked by tests, easy to revert individually). This is the
   fastest way to get "a lot of the frontend improvements" landed.
2. Is a re-convergence of the two repos on the table? If yes, Tier-2/3 porting is
   the wrong project — adopting Rebase's package structure in FireCMS is.
3. The `Chip` `outlined` prop is currently public but a **no-op** in FireCMS;
   Rebase implements it. Implementing it changes visuals only for callers who
   already pass `outlined` — do you consider that a break or a bug-fix?
