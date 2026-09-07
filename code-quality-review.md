# Ревью кода: DRY / KISS / YAGNI / low coupling / high cohesion

Дата: 2026-09-08. Ревью всего `src/` под пятью критериями из `AGENTS.md` («Code style»): DRY, KISS, YAGNI, низкая связанность (low coupling), высокая связность (high cohesion). Не проверялись корректность/баги — только качество структуры кода.

Методология: пять параллельных прицельных прогонов (каждый читал реальный код, а не угадывал по именам, и верифицировал находку чтением обоих/всех задействованных файлов):

1. Преждевременная абстракция / неиспользуемая обобщённость.
2. Мёртвый код / избыточная сложность под гипотетические сценарии.
3. Дублирование логики (DRY) в `entities/features/pages`.
4. Нарушения направления импортов FSD и утечки приватного API слайсов (low coupling).
5. Модули с несвязанными ответственностями (high cohesion).

**Итог: 11 подтверждённых находок, ни одна не критична — все чинятся точечно, без рефакторинга архитектуры.** Отдельно — то, что проверили и не нашли ничего (см. «Что уже в порядке» в конце).

---

## Находки

### 1. Мёртвый generic-параметр — `useStore<T, R>`

**Файл:** `src/shared/lib/use-store.ts:15`

`useStore<T, R>` принимает селектор `(state: T) => R`, но во всём проекте у него ровно один вызывающий — `create-value-store.ts`, и он всегда передаёт селектор-тождество `(state) => state`, то есть `R` всегда равно `T`. Это осколок дореформенной архитектуры: до перехода entity-сторов на Redux Toolkit `useStore` вызывался с настоящими проецирующими селекторами (`useAccounts()`, `useCategories(kind)` и т.п.) — сейчас все три entity используют `useAppSelector`, а `useStore` остался только под `createValueStore`.

**Почему это важно:** любой, кто читает файл, вынужден понимать общий контракт «селектор + два типа», хотя сейчас это чистый passthrough — лишняя когнитивная нагрузка без пользы.

### 2. Мёртвая ветка — `isEqual`'s array-сравнение

**Файл:** `src/shared/lib/use-store.ts:9`

Ветка `Array.isArray(...)` с поэлементным сравнением в `isEqual` недостижима: ни одно значение, хранимое через `createValueStore` (`ThemePreference`, `FeedFilters`, `string | null`, `boolean`, `ErrorNotification | null`, `PickedAccount | null`), не является массивом.

**Почему это важно:** тот же файл, тот же корень проблемы, что и находка 1 — мёртвая ветка с комментарием, объясняющим сценарий, который сейчас не может произойти.

### 3. Неиспользуемый проп — `ModalHeader.rightAction`

**Файл:** `src/shared/ui/modal-header.tsx:9` (слот рендера — строка 30)

`rightAction` не передаётся ни на одном из 9 мест использования `ModalHeader`. `docs/ux-guidelines.md` (раздел A2) уже фиксирует, что сценарий, под который это добавлялось (кнопка «Сбросить»/«Готово» в шапке фильтров Ленты), был убран в пользу нижнего блока кнопок — проп остался как «вдруг понадобится», что прямо запрещено правилом lean-code в `AGENTS.md`.

### 4. Неиспользуемый экспорт — `useAppDispatch`

**Файл:** `src/shared/lib/store-bridge.ts:38`

`useAppDispatch` экспортируется, но нигде не вызывается — все три entity's мутации (`createAccount`, `updateAccount` и т.п.) используют не-хуковый `dispatch` из того же файла (они выполняются вне React-компонентов), а `useAppSelector` (соседний экспорт) используется. Подтверждено: `grep -rn "useAppDispatch" src` находит только объявление.

### 5. Дублирование логики выбора категории/счёта — add-transaction ↔ transaction-detail

**Файлы:** `src/pages/add-transaction/ui/add-transaction-screen.tsx:38`, `src/pages/transaction-detail/ui/transaction-detail-screen.tsx:42`

Блок «отреагировать на выбор, вернувшийся из pick-category/pick-account» — `useAccount(form.accountId)`, `usePickedCategoryId()`/`usePickedAccount()`, `categoryManuallySetRef`, `handleSelectCategory`, оба `useEffect`, читающие сторы выбора и очищающие их (`clearPickedCategoryId()`/`clearPickedAccount()`, проверка `requestId === 'account'`) — скопирован побайтово между `AmountTransactionForm` и `EditAmountTransactionForm`.

**Почему это важно:** если поменяется контракт `picked-account-store.ts`/`picked-category-store.ts` (новый `requestId`, другая логика очистки), или найдётся баг в очистке устаревшего выбора — нужно чинить в обоих местах синхронно. Ничего не сигнализирует о том, что эти два блока связаны, кроме визуального сходства при чтении.

### 6. Тройное дублирование алгоритма «частота по ключу за N дней»

**Файлы:** `src/entities/transaction/model/account-role.ts:27` (`rankAccountsByRoleFrequency`), `src/features/add-transaction/model/use-frequent-categories.ts:7` (`useFrequentCategories`), `src/features/transfer/model/use-transfer-form.ts:15` (`findMostFrequentTransferPair`)

Все три реализуют одну и ту же схему: `windowStart = Date.now() - N * 24 * 60 * 60 * 1000`, затем фильтр + накопление в `Map<string, number>` — но каждый раз заново, с разным ключом (accountId / categoryId / пара счетов). `docs/ux-guidelines.md` уже фиксирует, что окно в 7 дней должно быть одной переиспользуемой константой (`accountFrequencyWindowInDays`) — константа действительно общая, а вот сам алгоритм подсчёта — нет.

**Почему это важно:** если правило ранжирования изменится (например, учитывать вес по давности, или исключать архивные счета), это придётся исправить в трёх независимых местах — пропуск одного тихо рассинхронизирует одну фичу (дефолтный счёт / сортировка pick-account / дефолтная пара перевода) с двумя другими, и никакой тест/тип это не поймает.

### 7. Дублирование валидации имени — account-form ↔ category-form

**Файлы:** `src/features/account-form/ui/account-form-fields.tsx:33`, `src/features/category-form/ui/category-form-fields.tsx`

Оба объявляют идентичный `[name, setName]` + `[nameError, setNameError]`, идентичный `handleChangeName` (записать текст, сбросить ошибку) и идентичную проверку в начале `handleSave`: `if (name.trim().length === 0) { setNameError(t('...nameRequired')); return; }`.

**Почему это важно:** `docs/ux-guidelines.md` (раздел E) документирует это поведение как общее правило для любого обязательного текстового поля — но реализовано оно копипастой, а не общим хуком, так что при появлении третьей формы с обязательным именем (или при правке валидации, например для обрезки пробелов) нет очевидного места для переиспользования, и правка легко забывается в одном из двух существующих мест.

### 8–10. Публичный экспорт dev-фикстур из трёх entity index.ts

**Файлы:** `src/entities/account/index.ts:15` (`mockAccounts`), `src/entities/category/index.ts:12` (`mockCategories`), `src/entities/transaction/index.ts:15` (`mockTransactions`)

Все три экспортируются через публичный `index.ts` слайса, но реально используются только внутри своего же слайса (`use-accounts.ts`/`use-categories.ts`/`use-transactions.ts`, в ветке `__DEV__`-сидирования `hydrateAccounts`/`hydrateCategories`/`hydrateTransactions`) — и используются они там через **относительный** импорт (`./mock-data`), не через собственный публичный API. Внешних потребителей нет ни у одного из трёх.

**Почему это важно:** `AGENTS.md` прямо называет `mock-data.ts` дев-фикстурой, а не частью контракта сущности («не шипится как стартовые данные реального пользователя, свободна менять форму»). Публичный экспорт расширяет контракт слайса без реальной необходимости и создаёт риск, что кто-то снаружи случайно завяжется на форму фикстур.

### 11. Календарная логика в UI-файле вместо `model/` — pick-date

**Файл:** `src/pages/pick-date/ui/pick-date-screen.tsx:17` (`addMonths`, `withDay`, `getCalendarWeeks`, строки 17–52)

Чистая, не зависящая от React/JSX логика построения сетки календаря (с понедельника первым, паддингом до 5–6 строк) лежит прямо в `ui/`-файле экрана. Все остальные экраны с сопоставимой по сложности производной логикой (`pages/home/model/use-home-summary.ts`, `pages/feed/model/use-feed-items.ts`, `pages/transaction-detail/model/use-edit-transaction-form.ts`, `pages/balance-detail/model/*`) держат её в своём `model/` — `pick-date` из этого правила выпадает, при этом сам же импортирует мелкие чистые функции дат из `shared/lib/format-date.ts`, но не выносит туда/в свой `model/` свою собственную, более сложную календарную математику.

**Почему это важно:** `getCalendarWeeks` — ветвистая, юнит-тестируемая логика без зависимости от рендера. Живя в `ui/`, она не тестируется без RN/Expo Router окружения, и любой будущий экран с похожей потребностью (например, календарь для запланированной фичи регулярных операций, см. `docs/planned-features.md`) её не обнаружит и с высокой вероятностью скопирует заново — то есть нарушение DRY, которое пока не проявилось только потому, что второго потребителя ещё не было.

---

## План исправлений

Порядок — от самого дешёвого/безопасного к тому, что требует чуть больше аккуратности. Все пункты — рефакторинг без изменения поведения, тестами (`jest`) и `tsc`/`eslint` можно проверить после каждого шага.

1. **Удалить мёртвый код в `use-store.ts`** (находки 1+2): убрать `R`-параметр и `isEqual`'s array-ветку, `useStore<T>` — только с identity-поведением, `create-value-store.ts` поправить под новую сигнатуру.
2. **Удалить `rightAction` из `ModalHeader`** (находка 3): убрать проп, слот рендера и связанную разметку `w-20 items-end`.
3. **Удалить `useAppDispatch` из `store-bridge.ts`** (находка 4).
4. **Убрать `mockAccounts`/`mockCategories`/`mockTransactions` из публичных `index.ts`** (находки 8–10): три entity уже импортируют их относительно — просто убрать строку экспорта из каждого `index.ts`.
5. **Вынести календарную математику `pick-date-screen.tsx` в `pages/pick-date/model/`** (находка 11): новый файл `use-calendar-weeks.ts` (или `calendar-grid.ts`) с `addMonths`/`withDay`/`getCalendarWeeks`, экран импортирует готовый результат.
6. **Общий хук валидации обязательного текстового поля** (находка 7): вынести `name`/`nameError`/`handleChangeName`/проверку при сохранении в `shared/lib` или общий хук `useRequiredNameField(initialName, requiredMessage)`, использовать в `account-form-fields.tsx` и `category-form-fields.tsx`.
7. **Общий хелпер «ранжировать по частоте за N дней»** (находка 6): один helper вида `rankByFrequencyWithinWindow<T>(items, getKey, getDate, windowStart)` в `entities/transaction/model/`, на который переводятся `rankAccountsByRoleFrequency`, `useFrequentCategories`, `findMostFrequentTransferPair` — самый рискованный пункт плана (три места с разными ключами/типами), делать последним и с прогоном существующих тестов на все три фичи.
8. **Общий хук реакции на pick-category/pick-account** (находка 5): вынести повторяющийся блок из `add-transaction-screen.tsx`/`transaction-detail-screen.tsx` в общий хук (например `usePickedTransactionFields` в `features/add-transaction/model/` или новом общем месте) — тоже требует аккуратности из-за тонких различий между create/edit сценариями, делать после пункта 7.

Пункты 1–5 — почти нулевой риск (либо удаление мёртвого кода, либо чистый перенос без изменения поведения). Пункты 6–8 — настоящий рефакторинг с общими хелперами, стоит делать по одному с прогоном `jest`/`tsc`/`eslint` и ручной проверкой на симуляторе между шагами.

---

## Что уже в порядке (проверено и не нашли нарушений)

- **Направление импортов FSD** — ни одного нарушения. Единственные обращения «снизу вверх» — уже задокументированное исключение (`shared/lib/store.ts`/`db.ts` → `entities/*` ради сборки reducer/schema). Ни один слайс не читает внутренности другого слайса напрямую — везде только через `index.ts`.
- **Взаимосвязь фич/сущностей друг с другом** — ни одной сестринской связи `features → features`, `entities → entities` (кроме уже документированного структурно-типизированного случая `account-role.ts`), `widgets → widgets`.
- **RTK Query / сетевой слой** — не начат преждевременно, как и предписано `docs/planned-features.md`.
- **Поля про запас** (`recurring`, `memberId`, `deviceId`, `updatedAt` и т.п.) — не найдены нигде в схемах/типах.
- **Единственный generic**, который стоило бы проверить на преждевременность (`rankAccountsByRoleFrequency<T extends {id:string}>`) — подтверждён как осознанный компромисс ради обхода кросс-слайсового импорта, уже описанный в `docs/app-overview.md`.
- **Формы create/edit transfer** — уже правильно шарят общую логику через `useTransferFormCore` (в отличие от находки 5 выше, где два других экрана этого не делают).
- **Большинство «крупных» файлов** в `pages/*`/`features/*` — при чтении оказались одной цельной задачей (форма с несколькими полями, CRUD+персистентность одной сущности), не смесью разных ответственностей.
