# Nutritionist Dashboard — Appointment Management

**Date:** 2026-06-30
**Status:** Approved design, pending implementation plan

## Summary

Turn the nutritionist dashboard (`/dashboard`) from a hardcoded mock into a real,
data-driven view. A nutritionist is selected from a modal on the HomePage (no
authentication yet), and the dashboard lists that nutritionist's appointments —
split into **Pending / Accepted / Rejected** tabs — wiring the Accept and Reject
actions to the existing backend endpoints.

## Goals

- Select a nutritionist from a modal launched on the HomePage.
- Show a nutritionist's appointments grouped by status across three tabs.
- Accept / Reject pending appointments through the real backend endpoints.

## Non-goals

- Authentication / authorization (selection stands in for login for now).
- Pagination, search, or sorting of appointments.
- The "reject overlapping appointments" / email TODOs already noted in the
  backend controller.
- Any online vs in-person concept — the data model has no such flag (see
  *Data shapes* below).

## Context (current state)

- **Backend** (`backend_api`, Rails 8.1, Minitest + fixtures):
  - `Api::AppointmentsController#index` → `GET /api/nutritionists/:id/appointments`
    currently `render json: @appointments` (bare AR columns, no service info).
  - `#accept` / `#reject` → `PATCH /api/appointments/:id/accept|reject`, already
    working and tested.
  - `Appointment` `enum :status, { pending: 0, accepted: 1, rejected: 2 }`;
    `belongs_to :nutritionist_service`. AR enums serialize to their string label.
  - Serialization elsewhere uses **Blueprinter** (`NutritionistBlueprint`,
    `ServiceBlueprint`).
- **Frontend** (`frontend_client`, CRA + React Router + react-i18next, Jest +
  Testing Library):
  - Layered pattern: `api/*.js` (axios `client`) → `hooks/use*.js`
    (`AbortController`, `loading/error/refetch`) → page component.
  - `NutritionistPage` (`/dashboard`) renders hardcoded `initialRequests` via
    `RequestCard` → `RequestModal` (Accept/Reject only update local state).
  - HomePage's nutritionist card navigates directly to `/dashboard`.
  - `useNutritionists()` already exists and returns the nutritionist list.

## Approach

**Single fetch + client-side tab filtering.** On dashboard mount, fetch *all* of
the nutritionist's appointments once, hold them in state, and derive the three
tab lists and their counts by filtering on `status`. Accept/Reject PATCH returns
the updated record; we replace that item in local state so it moves to its new
tab without a refetch.

Rejected alternatives: per-tab fetching (the index has no status filter — extra
backend work + 3× requests) and full refetch after each action (extra request +
UI flash).

## Data shapes

There is **no online/in-person flag** in the schema. A `Service` has a
`service_type` (name) and a `location` (name). The card "type" line is derived as
`service_type_name · location_name`.

Enriched appointment payload (new `AppointmentBlueprint`):

```json
{
  "id": 1,
  "patient_name": "Alice Walker",
  "patient_email": "alice@example.com",
  "scheduled_date": "2026-07-15T10:00:00.000Z",
  "status": "pending",
  "service_type_name": "Online",
  "location_name": "London"
}
```

`patient_name` stays present, so the existing index controller test (which maps
`a["patient_name"]`) remains green.

## Detailed design

### 1. Routing & nutritionist picker (frontend)

- `App.js`: change the dashboard route to `/dashboard/:id`.
- New `components/NutritionistPickerModal.jsx`:
  - Overlay modal (same visual language as `RequestModal` /
    `AppointmentRequestModal`).
  - Lists nutritionists from `useNutritionists()` (no query args); handles
    loading (skeletons) and error (retry) states.
  - Each row is clickable → `navigate('/dashboard/' + id)` then closes.
  - Has a close/cancel affordance.
- `HomePage.jsx`: nutritionist `HomeCard` `onClick` opens the picker modal
  instead of navigating. Local `useState` holds modal open/closed.
- Bare `/dashboard` (no id) is intentionally not reachable from the UI.

### 2. Backend — `AppointmentBlueprint` + enriched index

- New `app/blueprints/appointment_blueprint.rb`:

  ```ruby
  class AppointmentBlueprint < Blueprinter::Base
    fields :id, :patient_name, :patient_email, :scheduled_date, :status

    field :service_type_name do |appointment|
      appointment.nutritionist_service.service.service_type.name
    end

    field :location_name do |appointment|
      appointment.nutritionist_service.service.location.name
    end
  end
  ```

- `Api::AppointmentsController#index`: render through the blueprint and eager-load
  associations to avoid N+1:

  ```ruby
  @appointments = Appointment
    .joins(:nutritionist_service)
    .where(nutritionist_services: { nutritionist_id: @nutritionist.id })
    .includes(nutritionist_service: { service: [:service_type, :location] })

  render json: AppointmentBlueprint.render(@appointments)
  ```

- `accept` / `reject` unchanged.

### 3. Frontend API + hook

- `api/appointments.js` — add:
  - `getNutritionistAppointments(nutritionistId, signal)` →
    `GET /nutritionists/:id/appointments`.
  - `acceptAppointment(id, signal)` → `PATCH /appointments/:id/accept`.
  - `rejectAppointment(id, signal)` → `PATCH /appointments/:id/reject`.
  - Each returns `response.data`.
- New `hooks/useAppointments.js` — mirrors `useNutritionist`: `AbortController`,
  `{ data, loading, error, refetch }`, re-fetches on `id`/`tick` change.

### 4. Dashboard UI (`NutritionistPage`)

- Read `:id` via `useParams`; call `useAppointments(id)`.
- States: loading → `SkeletonCard`s; error → message + Retry (`refetch`);
  per-tab empty → friendly message.
- Tab bar: **Pending / Accepted / Rejected** with counts; `useState` for active
  tab. The visible list is `appointments.filter(a => a.status === activeTab)`.
- **Local working copy** of the appointments list in state (seeded from the
  hook's data) so Accept/Reject can mutate item status in place.
- Pending cards: inline **Accept** / **Reject** buttons (styling from the current
  `RequestModal` buttons). While a card's PATCH is in flight, its buttons are
  disabled (track the in-flight appointment id). On success, replace the item in
  local state with the returned record (it moves tabs) and show the existing
  success/rejection toast. On failure, show an error toast and leave the card.
- Accepted/Rejected cards: read-only with a status badge.
- A small date/time formatter renders `scheduled_date` (date line + time line),
  reusing `Avatar` / `CalendarIcon` / `ClockIcon`.

### 5. Components

- New `components/NutritionistPickerModal.jsx` (see §1).
- New `components/AppointmentCard.jsx`: renders one appointment (name, type line,
  date/time, status badge). Optional `onAccept(id)` / `onReject(id)` and a
  `busy` flag; when handlers are absent the card is read-only.
- Tab bar kept inline in `NutritionistPage` (small, page-specific).
- **Remove** `components/RequestCard.jsx`, `components/RequestModal.jsx`, and the
  `initialRequests` mock — orphaned after this change.

### 6. i18n

Add keys (both `en` and `pt`) under `NutritionistPage`:

- Tab labels: `Tabs.Pending`, `Tabs.Accepted`, `Tabs.Rejected`.
- Empty states per tab, error + retry strings.
- `Accept`, `Reject` button labels (or reuse existing `RequestModal.Accept/Reject`).
- Error toast on action failure.
- Picker modal: title, loading/error/retry, close.

Reuse existing `NutritionistPage.AppointmentAccepted` / `AppointmentRejected`
toasts.

## Testing (TDD)

**Backend** (`test/controllers/api/appointments_controller_test.rb`):

- Extend the index test to assert the enriched fields are present
  (`service_type_name`, `location_name`) and that `status` is the string label.
- Existing index/accept/reject/create tests remain green.
- Fixtures already provide `pending_one` (status 0) and `accepted_one`
  (status 1); add a `rejected` fixture if a rejected-tab assertion needs one.

**Frontend** (Jest + Testing Library, `client` mocked):

- `api/appointments.test.js`: add tests for the three new functions (URL,
  body, signal pass-through, returns `data`).
- `hooks/useAppointments.test.js` (new): loading → data, error path, `refetch`.
- `components/NutritionistPickerModal.test.jsx` (new): renders the list, row
  click navigates to `/dashboard/:id`.
- `components/AppointmentCard.test.jsx` (new): renders content; with handlers
  shows Accept/Reject; without handlers is read-only.
- `pages/NutritionistPage.test.jsx` (**rewrite**): mock `useAppointments`;
  cover tab switching, counts, Accept/Reject calling the API + moving the card +
  toast.

## Files touched

**Backend**
- `app/blueprints/appointment_blueprint.rb` (new)
- `app/controllers/api/appointments_controller.rb` (index)
- `test/controllers/api/appointments_controller_test.rb`
- `test/fixtures/appointments.yml` (maybe add a rejected fixture)

**Frontend**
- `src/App.js`
- `src/pages/HomePage.jsx`
- `src/pages/NutritionistPage.jsx` (rewrite)
- `src/components/NutritionistPickerModal.jsx` (new)
- `src/components/AppointmentCard.jsx` (new)
- `src/api/appointments.js`
- `src/hooks/useAppointments.js` (new)
- `src/locales/en/translation.json`, `src/locales/pt/translation.json`
- Tests as listed above
- Remove `src/components/RequestCard.jsx`, `src/components/RequestModal.jsx`

## Open questions

None outstanding. Card layout details (read-only vs actionable) follow existing
component styles.
