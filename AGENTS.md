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

- **Redux Toolkit** (RTK) is the state layer for entities' business logic — the migration off the old custom `createStore`/`useStore` (`shared/lib/create-store.ts`, `shared/lib/use-store.ts`) is done for all three entities (see `business-logic-plan.md`, Steps 2–4). Each entity's slice (`createSlice`/`createEntityAdapter`) lives in that entity's own `model/`, same as the old per-entity store — RTK didn't change slice ownership, only its implementation. `create-store.ts`/`use-store.ts` themselves are **not** removed — `createValueStore` (ephemeral UI state, see below) still runs on them.
- `shared/lib/store.ts` does only `configureStore`/`combineReducers` over the reducers exported from `entities/*/index.ts`, plus the `RootState`/`AppDispatch` types — three entities didn't justify RTK's lazy `combineSlices` injection helper, so it's plain `combineReducers` (see `business-logic-plan.md`, Step 1, "Архитектурные решения" section 1, for the reasoning).
- Typed `useAppDispatch`/`useAppSelector` and the non-hook `dispatch`/`getState` live in a **separate** `shared/lib/store-bridge.ts`, not in `store.ts` itself — entities' non-hook mutation functions (`createAccount`, `updateAccount`, …) import from there. Importing `store.ts` directly from an entity file would create a real circular `require()` (`store.ts` → `entities/*/index.ts` → entity file → `store.ts`) that Metro doesn't resolve safely; `store-bridge.ts` only takes `AppDispatch`/`RootState` via `import type` (erased at compile time), so it carries no runtime dependency on `store.ts`. `store.ts` calls `registerStore(store)` once, after creating the real store, to make the bridge live. Full account of how this was found: `business-logic-plan.md`, Step 1.
- **RTK Query is reserved for the future network/sync layer** (`docs/planned-features.md`, "синхронизация с сервером") — do not build `createApi` endpoints or start any network code now; recording this as the intended tool is not authorization to start that work.
- Ephemeral, non-domain UI state (theme, language, last-used-account, draft filters, picked-category) stays on the existing lightweight `createValueStore` — not moved into Redux. It's simple, feature-local, and already works; migrating it would be ceremony with no benefit (see lean-code rule below).

## Local persistence: expo-sqlite + Drizzle ORM

- Local database is **expo-sqlite** with **Drizzle ORM** — done end to end, full step-by-step account in `business-logic-plan.md` (project root). Redux is the in-memory source of truth for the UI; SQLite is the write-through persistence layer underneath it (Redux hydrated from SQLite on app start in `app/_layout.tsx`, every mutation written through to SQLite in the background from the entity's own mutation function).
- Same placement pattern as the Redux store: each entity's table definition (`sqliteTable(...)`) lives in that entity's own `model/schema.ts`; the DB connection, full assembled schema, and migration runner live in `shared/lib/db.ts` — framework wiring, not business logic. `shared/lib/db.ts` and `shared/lib/store.ts` both import from `entities/*/index.ts` to assemble the schema/reducer — this is the one accepted, deliberate exception to "lower layers never import from higher layers" (composition, not business logic), not a precedent for other shared → entities imports.
- Same reason as `store-bridge.ts` above: entity files read the Drizzle `db` instance through a separate `shared/lib/db-bridge.ts` (`getDatabase()`/`registerDatabase()`), not by importing `shared/lib/db.ts` directly — that import would create the same kind of circular `require()` (`db.ts` → `entities/*/index.ts` → entity file → `db.ts`) once entity files need `db` for write-through writes.
- Because SQLite writes are inherently async, entity mutation functions (`createAccount`, `updateTransaction`, …) are `async`/return `Promise<void>` — the one allowed change to the "keep function signatures as a contract" rule (`docs/app-overview.md`). A background write failure is logged (`console.error`) and surfaced via `shared/lib/error-notifications.ts` (an in-app banner, `shared/ui/error-banner.tsx`) — the promise itself never rejects, and the already-applied optimistic Redux update is never rolled back.
- Settings (theme/language/last-used-account) also get write-through persistence via `expo-sqlite/kv-store`, not a relational table — they're flat key-value prefs, not entities with invariants. Not every `createValueStore` needs this — `createValueStore(initialState, persistKey?)`'s second argument is opt-in, and transient, non-setting values (`picked-account-store.ts`, `picked-category-store.ts`, `feed-filters-store.ts`) deliberately omit it (see the comment at each call site for why).
- `entities/*/model/mock-data.ts` is dev-only seed data for an empty local DB (`__DEV__`), not shipped as the real app's starting dataset — a new user starts with zero accounts/categories/transactions.
- Non-route helper code does not belong directly under `src/app/`: Expo Router scans every file placed straight inside `src/app/` as a route candidate (a leading underscore in the filename does **not** exempt it — only the reserved `_layout` name is special-cased), so a plain helper file there logs a "missing default export" warning and can fail to resolve at runtime. Keep composition that's specific to app startup (e.g. the DB-hydration effect) as a local, unexported function inside `_layout.tsx` itself instead of a sibling file.

# Code style

- Write lean code: only what's explicitly requested. No extra logic, no abstractions or configurability added "just in case" — see `docs/planned-features.md` for concrete examples of what NOT to build preemptively in this project.
- Avoid abbreviations (`msg`, `fmt`, `sep`, `cfg`) — use full names (`message`, `outputFormat`, `separator`, `config`). Exception: short names in loops and short array-callback bodies — single-letter counters (`i`, `j`, `k`) and single-letter element names (`data.map((d) => ...)`, `transactions.map((t) => ...)`).
- Generic type parameters are named by role, one letter: `T` for the primary/only parameter, `R` for a return/result type distinct from `T`, `K`/`V` for key/value, `E` for element. Already the convention in this codebase — `useStore<T, R>` (`shared/lib/use-store.ts`), `DistributiveOmit<T, K>` (`entities/transaction/model/types.ts`), `SegmentedSwitcher<T extends string>` — keep following it for new generics rather than picking arbitrary names.
- Naming follows the Google TypeScript Style Guide.
- Code identifiers, comments, and any thrown/logged error text are in English — matches the codebase today (see e.g. `entities/account/model/use-accounts.ts` comments). This is different from user-facing UI text: that's bilingual through `shared/i18n/locales/{en,ru}.json` (see `docs/app-overview.md`), never hardcoded in one language — don't write literal English or Russian strings directly into a component.
- Section-separator comments in code: only between large logical blocks of a file, not between every function. One consistent format, single line: `// ----- <Section name> ---…---` (dashes out to ~79 columns), no `=`, no multi-line "frames" — already used in `shared/lib/system-colors.ts`, follow the same style if a file grows large enough to need it (most files in this codebase don't).
