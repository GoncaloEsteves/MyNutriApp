# Nutritionist API Integration — Design

**Date:** 2026-06-29
**Status:** Approved (pending spec review)

## Goal

Replace the hardcoded nutritionist data in the patient-facing frontend with live
data from the Rails backend's `Api::NutritionistsController`, covering both
endpoints:

- `GET /api/nutritionists` (`index`) — list with optional `searchBy` and
  `location` query params (server-side filtering).
- `GET /api/nutritionists/:id` (`show`) — single nutritionist detail.

## Backend contract (existing, unchanged)

`NutritionistBlueprint` / `ServiceBlueprint` produce:

```json
{
  "id": 1,
  "name": "Mary Jane",
  "services": [
    {
      "id": 1,
      "price": 25.0,
      "duration": 45,
      "service_type_name": "Online Appointment",
      "location_name": "Leiria"
    }
  ]
}
```

`index` returns an array of these; `show` returns a single object. There is **no
pagination metadata** in the response — `index` is a flat array.

Note: `service_type_name` from the API is already a code (e.g.
`SERVICETYPE.ONLINEAPPOINTMENT`), matching the frontend's existing i18n keys, so
`ProfessionalCard`'s `t(...)` translation works unchanged. No mapping needed.

## Decisions

| Topic | Decision |
|-------|----------|
| Endpoints | `index` + `show` |
| Filtering | Server-side via `searchBy` + `location` params |
| Routing | Introduce `react-router-dom` with real URLs |
| Detail entry | Repurpose the card's **Website** button → "View profile" link |
| Detail content | Minimal placeholder (name + `#id`) for now |
| API base URL | `process.env.REACT_APP_API_URL`, dev default `http://localhost:4000/api` |
| Loading/error UX | `SkeletonCard` while loading; i18n error message + Retry |
| Data layer | Axios client module + thin custom hooks (Approach B) |
| Search trigger | Submit on Search-button click / Enter (no live debounce) |
| Pagination | Render all returned results; drop the hardcoded `Pagination` for now |

## Architecture

### Data layer

- `src/api/client.js` — shared axios instance:
  `axios.create({ baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api" })`.
- `src/api/nutritionists.js`:
  - `getNutritionists({ searchBy, location } = {}, signal)` — builds query
    params (omitting empty values), returns `response.data`.
  - `getNutritionist(id, signal)` — returns `response.data`.
  - Both accept an `AbortSignal` for cancellation.
- `src/hooks/useNutritionists.js` — `useNutritionists({ searchBy, location })`
  returns `{ data, loading, error, refetch }`. Fetches on mount and when the
  committed search params change; aborts in-flight requests on unmount/change.
- `src/hooks/useNutritionist.js` — `useNutritionist(id)` returns
  `{ data, loading, error, refetch }`. Same abort behaviour.

### Routing

Introduce `react-router-dom`:

- `index.js` wraps `<App />` in `<BrowserRouter>`.
- `App.js` becomes a `<Routes>` table:
  - `/` → `HomePage`
  - `/patient` → `PatientPage`
  - `/dashboard` → `NutritionistPage` (existing professional dashboard)
  - `/nutritionists/:id` → `NutritionistDetailPage` (new)
- Replace the `onHome` / `onPatient` / `onNutritionist` callback props with
  `useNavigate` / `<Link>`. Affected: `App.js`, `HomePage`, `PatientPage`,
  `NutritionistPage`, `Navbar`.

The new patient-facing detail page is named `NutritionistDetailPage` to avoid
collision with the existing `NutritionistPage` (the professional's dashboard).

### PatientPage

- Remove the hardcoded `professionals` array and client-side `.filter()`.
- Local state: `searchInput`, `locationInput` (controlled inputs) and committed
  `{ searchBy, location }` query state.
- Clicking **Search** or pressing **Enter** commits the inputs into the query
  state, triggering `useNutritionists` to refetch with those params.
- Render states:
  - loading → a few `SkeletonCard`s
  - error → i18n error message + **Retry** button (calls `refetch`)
  - empty (`data.length === 0`) → existing "No professionals found" message
  - success → `data.map(pro => <ProfessionalCard ... />)`
- Remove the hardcoded `<Pagination total={6} />`.

### ProfessionalCard

- Repurpose the **Website** button into a **View profile** link/button that
  navigates to `/nutritionists/:id` (via `useNavigate` or `<Link>`).
- **Schedule appointment** button is left unchanged (booking is out of scope).

### NutritionistDetailPage

- Reads `:id` from the route, calls `useNutritionist(id)`.
- Renders `Navbar`, a back link to `/patient`, and the placeholder body
  (name + `#id`).
- Loading → `SkeletonCard`; error → i18n message + Retry.

## i18n

Add keys in both `en` and `pt` `translation.json`:

- `PatientPage.ProfessionalCard.ViewProfile`
- `PatientPage.Error` (list load failure)
- `PatientPage.Retry`
- `PatientPage.Loading` (if needed alongside skeletons)
- New `NutritionistDetailPage` section: `Back`, `Error`, `Retry`, `Loading`.

## Error handling

- Network/non-2xx responses surface as `error` from the hooks.
- UI shows a friendly translated message plus a **Retry** that re-invokes the
  fetch. No raw error strings shown to users.
- Requests are aborted on unmount / param change to avoid setting state on
  unmounted components.

## Testing strategy

- **api/nutritionists** — unit test param-building (empty values omitted) and
  URL/shape, with axios mocked.
- **hooks** — test loading → data, error path, and refetch, with the api module
  mocked.
- **PatientPage** (update existing [PatientPage.test.jsx]) — mock the
  `api/nutritionists` module:
  - renders skeletons then cards on successful load
  - clicking Search / pressing Enter refetches with the right `searchBy` /
    `location` params
  - error state renders the message + Retry, and Retry refetches
  - empty result renders the "No professionals found" message
- **NutritionistDetailPage** — mock the api module; assert loading → placeholder
  content, and error → message.
- All tests run via `react-scripts test` (jest + Testing Library, already set up).

## Environment / config

- Add `.env.example` documenting `REACT_APP_API_URL` (e.g.
  `http://localhost:4000/api`).
- CORS already allows `localhost:3000` (the frontend origin); Rails runs on
  `:4000` in dev. No backend changes required.

## Out of scope

- Booking / Schedule-appointment flow.
- Backend pagination support.
- Auth.

## Open questions / known limitations

1. **Pagination** is dropped until the backend exposes paging metadata.
