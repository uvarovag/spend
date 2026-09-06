# Project references

@docs/data-constraints.md
@docs/ux-guidelines.md
@docs/app-overview.md
@docs/planned-features.md

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Architecture: FSD (Feature-Sliced Design)

Roles are already occupied by Expo Router, so keep only the layers actually needed:

All layers live inside `src/`, including routing:

```
src/
├── app/          # Expo Router = app layer (providers, layout, routes — route files stay thin, just render a page)
├── pages/         # screen content, one folder per screen, rendered by the matching app/ route file
├── widgets/       # compositions of several features/entities (add when needed)
├── features/      # user actions: add-transaction, edit-category, etc.
├── entities/      # business entities: transaction, category, account
└── shared/        # ui-kit, hooks, lib, api, constants — reusable, no business logic
```

Rules:

- `pages/` is a required layer from the start, not optional. Every `app/` route file stays thin (layout/params wiring only) and renders the matching `pages/<name>` slice.
- Do not create `processes` — the layer is deprecated in FSD; cross-page scenarios belong in `features` or `entities`.
- Inside each slice, add only the segments you actually use (`ui/`, `model/`, `lib/`). Don't pre-create `api/`, `config/`, etc. "just in case" — add a segment only when there is real code for it.
- Each slice exposes a flat `index.ts` public API; everything else in the slice is private.
- Import rule: lower layers never import from higher layers (`shared` never imports from `entities`, `entities` never imports from `features`, etc.).
- It's fine to start with just `app/` + `pages/` + `shared/` and add `entities`/`features`/`widgets` layers as real business logic appears — don't scaffold empty layers ahead of need.

## State management: Redux Toolkit

- Chosen state layer for entities' business logic is **Redux Toolkit** (RTK), replacing the current custom `createStore`/`useStore` (`shared/lib/create-store.ts`, `shared/lib/use-store.ts`) as the migration in `business-logic-plan.md` (project root) is carried out. Each entity's slice (`createSlice`/`createEntityAdapter`) lives in that entity's own `model/`, same as today's per-entity store — RTK doesn't change slice ownership, only its implementation.
- Store setup, typed `useAppDispatch`/`useAppSelector`, and the lazy slice-injection helper (via RTK's `combineSlices`) live in `shared/lib/store.ts` — this is framework wiring, not business logic, so it's allowed in `shared` even though entity reducers get injected into it. This exists specifically so entities' non-hook functions (`createAccount`, `updateAccount`, …) can dispatch without importing anything from `app/` (which would break the "lower layers never import from higher layers" rule).
- **RTK Query is reserved for the future network/sync layer** (`docs/planned-features.md`, "синхронизация с сервером") — do not build `createApi` endpoints or start any network code now; recording this as the intended tool is not authorization to start that work.
- Ephemeral, non-domain UI state (theme, language, last-used-account, draft filters, picked-category) stays on the existing lightweight `createValueStore` — not moved into Redux. It's simple, feature-local, and already works; migrating it would be ceremony with no benefit (see lean-code rule below).

## Local persistence: expo-sqlite + Drizzle ORM

- Chosen local database is **expo-sqlite** with **Drizzle ORM** — full step-by-step plan in `business-logic-plan.md` (project root). Redux stays the in-memory source of truth for the UI; SQLite is a write-through persistence layer underneath it (hydrate Redux from SQLite on app start, write every mutation through to SQLite in the background).
- Same placement pattern as the Redux store: each entity's table definition (`sqliteTable(...)`) lives in that entity's own `model/schema.ts`; the DB connection, full assembled schema, and migration runner live in `shared/lib/db.ts` — framework wiring, not business logic. `shared/lib/db.ts` and `shared/lib/store.ts` both import from `entities/*/index.ts` to assemble the schema/reducer — this is the one accepted, deliberate exception to "lower layers never import from higher layers" (composition, not business logic), not a precedent for other shared → entities imports.
- Because SQLite writes are inherently async, entity mutation functions (`createAccount`, `updateTransaction`, …) become `async`/return `Promise<void>` once persistence lands — the only allowed change to the "keep function signatures as a contract" rule (`docs/app-overview.md`).
- Settings (theme/language/last-used-account/etc., on `createValueStore`) also get write-through persistence via `expo-sqlite/kv-store`, not a relational table — they're flat key-value prefs, not entities with invariants.
- `entities/*/model/mock-data.ts` is dev-only seed data for an empty local DB (`__DEV__`), not shipped as the real app's starting dataset — a new user starts with zero accounts/categories/transactions.

# Code style

- Write lean code: only what's explicitly requested. No extra logic, no abstractions or configurability added "just in case" — see `docs/planned-features.md` for concrete examples of what NOT to build preemptively in this project.
- Avoid abbreviations (`msg`, `fmt`, `sep`, `cfg`) — use full names (`message`, `outputFormat`, `separator`, `config`). Exception: short names in loops and short array-callback bodies — single-letter counters (`i`, `j`, `k`) and single-letter element names (`data.map((d) => ...)`, `transactions.map((t) => ...)`).
- Generic type parameters are named by role, one letter: `T` for the primary/only parameter, `R` for a return/result type distinct from `T`, `K`/`V` for key/value, `E` for element. Already the convention in this codebase — `useStore<T, R>` (`shared/lib/use-store.ts`), `DistributiveOmit<T, K>` (`entities/transaction/model/types.ts`), `SegmentedSwitcher<T extends string>` — keep following it for new generics rather than picking arbitrary names.
- Naming follows the Google TypeScript Style Guide.
- Code identifiers, comments, and any thrown/logged error text are in English — matches the codebase today (see e.g. `entities/account/model/use-accounts.ts` comments). This is different from user-facing UI text: that's bilingual through `shared/i18n/locales/{en,ru}.json` (see `docs/app-overview.md`), never hardcoded in one language — don't write literal English or Russian strings directly into a component.
- Section-separator comments in code: only between large logical blocks of a file, not between every function. One consistent format, single line: `// ----- <Section name> ---…---` (dashes out to ~79 columns), no `=`, no multi-line "frames" — already used in `shared/lib/system-colors.ts`, follow the same style if a file grows large enough to need it (most files in this codebase don't).
