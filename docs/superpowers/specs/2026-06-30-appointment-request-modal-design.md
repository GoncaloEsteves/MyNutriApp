# AppointmentRequestModal — Design

**Date:** 2026-06-30
**Status:** Approved (pending implementation)

## Goal

Let a patient request an appointment from the `PatientPage`. Each professional is
rendered as a `ProfessionalCard` with a "Schedule appointment" button. Clicking it
opens a modal where the patient picks one of that nutritionist's services, enters
their name and email, picks a date/time, and submits. The request is created via the
existing backend endpoint and starts in `pending` status.

## Backend contract (existing — no changes)

- **Route:** `POST /api/nutritionists/:nutritionist_id/services/:service_id/appointments`
- **Body:** `{ "appointment": { "patient_name", "patient_email", "scheduled_date" } }`
- **Behavior:** `Api::AppointmentsController#create` resolves the `NutritionistService`
  from `(nutritionist_id, service_id)`; returns `404 { error: "NUTRITIONISTSERVICE.NOTFOUND" }`
  if that pairing doesn't exist. On success returns `201` with the appointment JSON.
  Creating a request also auto-rejects other pending requests for the same
  `patient_email`.
- **`status`:** column defaults to `0` (`pending`); the client omits it.
- **Validations:** `patient_name`, `patient_email`, `scheduled_date` are all
  `presence: true`. Failures return `422` with the model errors.

## Data already available on the client

`getNutritionists` / `getNutritionist` return (via `NutritionistBlueprint`):

```json
{
  "id": 1,
  "name": "Mary",
  "services": [
    { "id": 5, "price": 50, "duration": 60,
      "service_type_name": "SERVICETYPE.CLINICAPPOINTMENT",
      "location_name": "Porto" }
  ]
}
```

So the service dropdown is populated from the clicked nutritionist's own `services`
with **no extra fetch**. `service_type_name` is an i18n key already translated in
`ProfessionalCard` via `t(service_type_name)`.

## Architecture (Approach A — self-contained modal owned by `ProfessionalCard`)

```
ProfessionalCard (owns isOpen state; existing Schedule button toggles it)
  └── AppointmentRequestModal nutritionist={pro} onClose={fn}
        ├── owns all form + submission state internally
        └── api/appointments.js → requestAppointment(nutritionistId, serviceId, payload, signal)
              └── api/client.js (axios)
```

Rationale: the modal needs the nutritionist's `services`, which the card already has,
so state lives there with no prop-drilling. Success is shown in-modal, removing any
need to lift feedback to the page. Mirrors the existing `RequestModal` + `api/*`
patterns.

## Files

**New**
- `frontend_client/src/api/appointments.js`
  `requestAppointment(nutritionistId, serviceId, payload, signal)` →
  `client.post('/nutritionists/{nid}/services/{sid}/appointments', { appointment: payload }, { signal }).then(r => r.data)`.
  Mirrors `api/nutritionists.js`.
- `frontend_client/src/components/AppointmentRequestModal.jsx`
- `frontend_client/src/api/appointments.test.js`
- `frontend_client/src/components/AppointmentRequestModal.test.jsx`

**Modified**
- `frontend_client/src/components/ProfessionalCard.jsx` — add `isOpen` state, wire the
  existing Schedule button `onClick`, render the modal with `nutritionist={pro}`.
- `frontend_client/src/locales/en/translation.json`
- `frontend_client/src/locales/pt/translation.json`

## Component contract

`<AppointmentRequestModal nutritionist={pro} onClose={fn} />`

- Renders `null` when not open (parent controls mount, like `RequestModal`).
- Overlay + click-outside-to-close + `stopPropagation`, reusing the `RequestModal`
  visual pattern (fixed inset, centered card).
- Owns all form/submission state internally.

## Form fields

| Field         | Control                          | Notes |
|---------------|----------------------------------|-------|
| Service       | `<select>`                       | options from `nutritionist.services`; label `{t(service_type_name)} · {location_name} · from {price}€ · {duration} min`; value = `service.id`; placeholder "Select a service" |
| Patient name  | `<input type="text">`            | required |
| Patient email | `<input type="email">`           | required + format check |
| Date & time   | `<input type="datetime-local">`  | `min` = now; future-only |

## View states

1. **Form** (default) — fields + Submit/Cancel; Submit disabled until valid.
2. **Submitting** — Submit shows a "sending" label and is disabled.
3. **Success** — content swaps to a confirmation message + Close button.
4. **Error** — inline error banner above the buttons; form stays editable. Covers both
   backend (`422`/`404`) and network failures.

## Validation (client-side)

- **Required:** service, name, email, date all non-empty → gates Submit.
- **Email format:** simple regex (`@` + domain).
- **Future-only:** `min` attr on the datetime input **and** a submit-time guard, since
  the attr alone does not block typed values.

## Submit / data flow

- `scheduled_date` is sent as `new Date(value).toISOString()` (UTC), because
  `datetime-local` yields a timezone-less local string.
- Payload: `{ patient_name, patient_email, scheduled_date }` — `status` omitted.
- `201` → Success view. Error → inline Error, modal stays open.

## i18n

New block `PatientPage.AppointmentRequestModal` in **both** `en` and `pt`:

- `Title` — "Schedule appointment with {{name}}"
- `ServiceLabel`, `ServicePlaceholder`, `ServiceOption` ("{{type}} · {{location}} · from {{price}}€ · {{duration}} min")
- `NameLabel`, `NamePlaceholder`
- `EmailLabel`, `EmailPlaceholder`
- `DateLabel`
- `Submit`, `Cancel`, `Close`, `Sending`
- `SuccessTitle`, `SuccessMessage`
- `Errors.Required`, `Errors.InvalidEmail`, `Errors.PastDate`, `Errors.SubmitFailed`

## Testing (TDD during implementation)

**`api/appointments.test.js`**
- POSTs the correct URL with `{ appointment: {...} }` body.
- Returns `response.data`.
- Passes the `signal` through.

**`AppointmentRequestModal.test.jsx`**
- Renders one option per `nutritionist.services` entry.
- Submit disabled until all fields valid.
- Invalid email blocks submit.
- Past date blocks submit.
- Successful submit calls `requestAppointment` with `(nutritionist.id, serviceId, payload)`
  and shows the Success view.
- Backend error shows the inline error and keeps the modal open.
- Cancel / Close / overlay click calls `onClose`.

**`ProfessionalCard.test.jsx`** (new)
- Clicking "Schedule appointment" opens the modal.

## Out of scope (YAGNI)

- No date-picker library (native `datetime-local`).
- No patient authentication / pre-filled identity (no patient session exists).
- No page-level toast/banner system (success is in-modal).
- No reuse on `NutritionistDetailPage` yet (would be the trigger for extracting a
  `useAppointmentRequest` hook — Approach C — later).
