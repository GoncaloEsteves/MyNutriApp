# Nutritionist Dashboard — Appointment Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the nutritionist dashboard real — pick a nutritionist from a HomePage modal, then list that nutritionist's appointments across Pending/Accepted/Rejected tabs with working Accept/Reject actions wired to the backend.

**Architecture:** Backend gains an `AppointmentBlueprint` so `appointments#index` returns service/status info. Frontend follows the existing `api → hook → page` layering: a new `getNutritionistAppointments` + `useAppointments`, a presentational `AppointmentCard`, a `NutritionistPickerModal` on the HomePage, and a rewritten `NutritionistPage` that fetches once and filters by status client-side. Accept/Reject PATCH returns the updated record, which is swapped into local state so the card moves tabs.

**Tech Stack:** Rails 8.1 + Blueprinter + Minitest/fixtures (backend); React 19 + React Router 6 + react-i18next + axios, Jest + Testing Library (frontend).

## Global Constraints

- **Do NOT commit or push automatically.** Every task's final step stages changes (`git add`) and pauses for the user to review; the user runs the commit. (User standing rule.)
- **Do NOT create any new git branch this session.** Work on the current `main` working tree. (User instruction.)
- **Run the relevant tests at the end of each task** and confirm green before staging. (User standing rule.)
- **All collaborative/code text in English.** (User standing rule.)
- Backend tests run from `backend_api/`: `bin/rails test <path>`.
- Frontend tests run from `frontend_client/`: `npm test -- --watchAll=false <path>`.
- Appointment `status` serializes to its string label (`"pending"|"accepted"|"rejected"`).
- There is **no online/in-person flag**; the card "type" line is `service_type_name · location_name`.

---

## File Structure

**Backend**
- `app/blueprints/appointment_blueprint.rb` (new) — serializes one appointment + its service type/location.
- `app/controllers/api/appointments_controller.rb` (modify `index` only).
- `test/controllers/api/appointments_controller_test.rb` (add index field assertions).

**Frontend**
- `src/api/appointments.js` (add 3 functions).
- `src/api/appointments.test.js` (extend; broaden the `client` mock).
- `src/hooks/useAppointments.js` (new) + `src/hooks/useAppointments.test.js` (new).
- `src/components/AppointmentCard.jsx` (new) + `src/components/AppointmentCard.test.jsx` (new).
- `src/components/NutritionistPickerModal.jsx` (new) + `src/components/NutritionistPickerModal.test.jsx` (new).
- `src/pages/HomePage.jsx` (open picker instead of navigating) + `src/pages/HomePage.test.jsx` (new).
- `src/App.js` (route `/dashboard/:id`).
- `src/pages/NutritionistPage.jsx` (rewrite) + `src/pages/NutritionistPage.test.jsx` (rewrite).
- `src/locales/en/translation.json`, `src/locales/pt/translation.json` (i18n keys — added additively, old keys removed only in the final task).
- Delete `src/components/RequestCard.jsx`, `src/components/RequestModal.jsx` (final task).

i18n keys are added **additively** in early tasks so existing tests/components stay green; the orphaned `RequestCard`/`RequestModal`/`PendingRequests` keys are removed only in Task 7 alongside the component deletions.

---

## Task 1: Backend — AppointmentBlueprint + enriched index

**Files:**
- Create: `backend_api/app/blueprints/appointment_blueprint.rb`
- Modify: `backend_api/app/controllers/api/appointments_controller.rb:6-12` (`index`)
- Test: `backend_api/test/controllers/api/appointments_controller_test.rb`

**Interfaces:**
- Produces: `GET /api/nutritionists/:id/appointments` returns a JSON array of
  `{ id, patient_name, patient_email, scheduled_date, status, service_type_name, location_name }`.

- [ ] **Step 1: Write the failing test**

Add this test to `backend_api/test/controllers/api/appointments_controller_test.rb` (after the existing index test, before `# --- create ---`):

```ruby
  test "GET index includes service type, location and string status per appointment" do
    john = nutritionists(:john)
    get "/api/nutritionists/#{john.id}/appointments"
    assert_response :ok
    body = JSON.parse(response.body)
    appt = body.find { |a| a["patient_name"] == "Alice Walker" }
    assert_equal "Online", appt["service_type_name"]
    assert_equal "London", appt["location_name"]
    assert_equal "pending", appt["status"]
  end
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `backend_api/`): `bin/rails test test/controllers/api/appointments_controller_test.rb`
Expected: FAIL — the new test errors with `NoMethodError`/`nil` on `appt["service_type_name"]` (bare payload has no such key).

- [ ] **Step 3: Create the blueprint**

Create `backend_api/app/blueprints/appointment_blueprint.rb`:

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

- [ ] **Step 4: Update the index action**

In `backend_api/app/controllers/api/appointments_controller.rb`, replace the `index` method body (lines 7-12):

```ruby
  # GET /nutritionists/1/appointments
  def index
    @appointments = Appointment.joins(:nutritionist_service)
      .where(nutritionist_services: { nutritionist_id: @nutritionist.id })
      .includes(nutritionist_service: { service: [ :service_type, :location ] })

    render json: AppointmentBlueprint.render(@appointments)
  end
```

- [ ] **Step 5: Run tests to verify they pass**

Run (from `backend_api/`): `bin/rails test test/controllers/api/appointments_controller_test.rb`
Expected: PASS — all tests green (the original index test still passes because `patient_name` remains present).

- [ ] **Step 6: Stage and request review**

```bash
git add backend_api/app/blueprints/appointment_blueprint.rb backend_api/app/controllers/api/appointments_controller.rb backend_api/test/controllers/api/appointments_controller_test.rb
```
Then pause for the user to review before committing (do not commit automatically).

---

## Task 2: Frontend API — appointment fetch/accept/reject functions

**Files:**
- Modify: `frontend_client/src/api/appointments.js`
- Test: `frontend_client/src/api/appointments.test.js`

**Interfaces:**
- Produces:
  - `getNutritionistAppointments(nutritionistId, signal) => Promise<Appointment[]>`
  - `acceptAppointment(id, signal) => Promise<Appointment>`
  - `rejectAppointment(id, signal) => Promise<Appointment>`
  - Each resolves to `response.data`.

- [ ] **Step 1: Write the failing tests**

In `frontend_client/src/api/appointments.test.js`, replace the mock setup block (lines 1-9) so the mocked client exposes `get`, `post`, and `patch`:

```js
import client from './client';
import {
  requestAppointment,
  getNutritionistAppointments,
  acceptAppointment,
  rejectAppointment,
} from './appointments';

jest.mock('./client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

beforeEach(() => jest.clearAllMocks());
```

Then append these describe blocks to the end of the file:

```js
describe('getNutritionistAppointments', () => {
  it('GETs the nested appointments path', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionistAppointments(7);
    expect(client.get).toHaveBeenCalledWith('/nutritionists/7/appointments', {
      signal: undefined,
    });
  });

  it('returns response.data', async () => {
    const data = [{ id: 1, status: 'pending' }];
    client.get.mockResolvedValue({ data });
    const result = await getNutritionistAppointments(7);
    expect(result).toEqual(data);
  });

  it('passes the signal through', async () => {
    client.get.mockResolvedValue({ data: [] });
    const signal = new AbortController().signal;
    await getNutritionistAppointments(7, signal);
    expect(client.get).toHaveBeenCalledWith('/nutritionists/7/appointments', { signal });
  });
});

describe('acceptAppointment', () => {
  it('PATCHes the accept path and returns data', async () => {
    const data = { id: 3, status: 'accepted' };
    client.patch.mockResolvedValue({ data });
    const result = await acceptAppointment(3);
    expect(client.patch).toHaveBeenCalledWith('/appointments/3/accept', null, {
      signal: undefined,
    });
    expect(result).toEqual(data);
  });
});

describe('rejectAppointment', () => {
  it('PATCHes the reject path and returns data', async () => {
    const data = { id: 3, status: 'rejected' };
    client.patch.mockResolvedValue({ data });
    const result = await rejectAppointment(3);
    expect(client.patch).toHaveBeenCalledWith('/appointments/3/reject', null, {
      signal: undefined,
    });
    expect(result).toEqual(data);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/api/appointments.test.js`
Expected: FAIL — `getNutritionistAppointments`/`acceptAppointment`/`rejectAppointment` are not exported.

- [ ] **Step 3: Implement the functions**

Append to `frontend_client/src/api/appointments.js`:

```js
export function getNutritionistAppointments(nutritionistId, signal) {
  return client
    .get(`/nutritionists/${nutritionistId}/appointments`, { signal })
    .then(r => r.data);
}

export function acceptAppointment(id, signal) {
  return client
    .patch(`/appointments/${id}/accept`, null, { signal })
    .then(r => r.data);
}

export function rejectAppointment(id, signal) {
  return client
    .patch(`/appointments/${id}/reject`, null, { signal })
    .then(r => r.data);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/api/appointments.test.js`
Expected: PASS — all describe blocks green, including the existing `requestAppointment` ones.

- [ ] **Step 5: Stage and request review**

```bash
git add frontend_client/src/api/appointments.js frontend_client/src/api/appointments.test.js
```
Pause for user review before committing.

---

## Task 3: Frontend hook — useAppointments

**Files:**
- Create: `frontend_client/src/hooks/useAppointments.js`
- Test: `frontend_client/src/hooks/useAppointments.test.js`

**Interfaces:**
- Consumes: `getNutritionistAppointments(id, signal)` from `../api/appointments`.
- Produces: `useAppointments(nutritionistId) => { data: Appointment[], loading: boolean, error: Error|null, refetch: () => void }`. `data` defaults to `[]`.

- [ ] **Step 1: Write the failing tests**

Create `frontend_client/src/hooks/useAppointments.test.js`:

```js
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAppointments } from './useAppointments';
import * as api from '../api/appointments';

jest.mock('../api/appointments');

const mockData = [{ id: 1, patient_name: 'Alice', status: 'pending' }];

beforeEach(() => jest.clearAllMocks());

test('returns loading=true and empty data initially', () => {
  api.getNutritionistAppointments.mockReturnValue(new Promise(() => {}));
  const { result } = renderHook(() => useAppointments(1));
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toEqual([]);
  expect(result.current.error).toBeNull();
});

test('returns data after a successful fetch', async () => {
  api.getNutritionistAppointments.mockResolvedValue(mockData);
  const { result } = renderHook(() => useAppointments(1));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual(mockData);
  expect(result.current.error).toBeNull();
});

test('returns error when the fetch fails', async () => {
  api.getNutritionistAppointments.mockRejectedValue(new Error('Boom'));
  const { result } = renderHook(() => useAppointments(99));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.data).toEqual([]);
});

test('refetches when refetch is called', async () => {
  api.getNutritionistAppointments.mockResolvedValue(mockData);
  const { result } = renderHook(() => useAppointments(1));
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.refetch());
  await waitFor(() =>
    expect(api.getNutritionistAppointments).toHaveBeenCalledTimes(2),
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/hooks/useAppointments.test.js`
Expected: FAIL — `useAppointments` module does not exist.

- [ ] **Step 3: Implement the hook**

Create `frontend_client/src/hooks/useAppointments.js`:

```js
import { useState, useEffect, useCallback } from 'react';
import { getNutritionistAppointments } from '../api/appointments';

export function useAppointments(nutritionistId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getNutritionistAppointments(nutritionistId, controller.signal)
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'CanceledError') {
          setError(err);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [nutritionistId, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { data, loading, error, refetch };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/hooks/useAppointments.test.js`
Expected: PASS — 4 tests green.

- [ ] **Step 5: Stage and request review**

```bash
git add frontend_client/src/hooks/useAppointments.js frontend_client/src/hooks/useAppointments.test.js
```
Pause for user review before committing.

---

## Task 4: Frontend component — AppointmentCard (+ additive i18n)

**Files:**
- Create: `frontend_client/src/components/AppointmentCard.jsx`
- Test: `frontend_client/src/components/AppointmentCard.test.jsx`
- Modify: `frontend_client/src/locales/en/translation.json`, `frontend_client/src/locales/pt/translation.json` (additive)

**Interfaces:**
- Consumes: `Appointment` shape `{ id, patient_name, patient_email, scheduled_date, status, service_type_name, location_name }`; `Avatar`, `CalendarIcon`, `ClockIcon` from `../utils/*`; `C` from `../utils/consts`.
- Produces: `<AppointmentCard appointment onAccept onReject busy />`. When `onAccept`/`onReject` are provided, renders Accept/Reject buttons (disabled while `busy`); otherwise renders a read-only status badge. Buttons call `onAccept(appointment.id)` / `onReject(appointment.id)`.

- [ ] **Step 1: Add the i18n keys (additive)**

In `frontend_client/src/locales/en/translation.json`, inside the `"NutritionistPage"` object, add these three keys (place them after `"AppointmentRejected"`):

```json
        "Accept" : "Accept",
        "Reject" : "Reject",
        "Status" : {
            "pending" : "Pending",
            "accepted" : "Accepted",
            "rejected" : "Rejected"
        },
```

In `frontend_client/src/locales/pt/translation.json`, inside `"NutritionistPage"`, add:

```json
        "Accept" : "Aceitar",
        "Reject" : "Rejeitar",
        "Status" : {
            "pending" : "Pendente",
            "accepted" : "Aceite",
            "rejected" : "Rejeitada"
        },
```

- [ ] **Step 2: Write the failing test**

Create `frontend_client/src/components/AppointmentCard.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentCard } from './AppointmentCard';

const appt = {
  id: 5,
  patient_name: 'Alice Walker',
  patient_email: 'alice@example.com',
  scheduled_date: '2026-07-15T10:00:00.000Z',
  status: 'pending',
  service_type_name: 'Online',
  location_name: 'London',
};

test('renders patient name and the service type · location line', () => {
  render(<AppointmentCard appointment={appt} />);
  expect(screen.getByText('Alice Walker')).toBeInTheDocument();
  expect(screen.getByText(/Online · London/)).toBeInTheDocument();
});

test('shows Accept and Reject buttons when handlers are provided', () => {
  render(<AppointmentCard appointment={appt} onAccept={() => {}} onReject={() => {}} />);
  expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
});

test('calls onAccept with the appointment id', async () => {
  const onAccept = jest.fn();
  render(<AppointmentCard appointment={appt} onAccept={onAccept} onReject={() => {}} />);
  await userEvent.click(screen.getByRole('button', { name: /accept/i }));
  expect(onAccept).toHaveBeenCalledWith(5);
});

test('disables the action buttons when busy', () => {
  render(<AppointmentCard appointment={appt} onAccept={() => {}} onReject={() => {}} busy />);
  expect(screen.getByRole('button', { name: /accept/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /reject/i })).toBeDisabled();
});

test('renders a read-only status badge and no buttons when no handlers', () => {
  render(<AppointmentCard appointment={{ ...appt, status: 'accepted' }} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByText('Accepted')).toBeInTheDocument();
});
```

- [ ] **Step 3: Run test to verify it fails**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/components/AppointmentCard.test.jsx`
Expected: FAIL — `AppointmentCard` module does not exist.

- [ ] **Step 4: Implement the component**

Create `frontend_client/src/components/AppointmentCard.jsx`:

```jsx
import { Avatar } from "../utils/Avatar";
import { CalendarIcon } from "../utils/CalendarIcon";
import { ClockIcon } from "../utils/ClockIcon";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";

const STATUS_COLORS = {
  pending: C.orange,
  accepted: C.green,
  rejected: C.red,
};

function formatDateTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

export function AppointmentCard({ appointment, onAccept, onReject, busy }) {
  const { t } = useTranslation();
  const actionable = Boolean(onAccept && onReject);
  const { date, time } = formatDateTime(appointment.scheduled_date);

  return (
    <div style={{
      background: C.white,
      borderRadius: 10,
      border: `1px solid ${C.border}`,
      padding: "22px 20px",
      display: "flex",
      flexDirection: "column",
      flex: "1 1 220px",
      minWidth: 220,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <Avatar name={appointment.patient_name} size={52} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 2 }}>
            {appointment.patient_name}
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>
            {`${appointment.service_type_name} · ${appointment.location_name}`}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.muted, marginBottom: 6 }}>
            <CalendarIcon />{date}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.muted }}>
            <ClockIcon />{time}
          </div>
        </div>
        {!actionable && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.white,
            background: STATUS_COLORS[appointment.status],
            borderRadius: 12,
            padding: "3px 10px",
            whiteSpace: "nowrap",
          }}>
            {t(`NutritionistPage.Status.${appointment.status}`)}
          </span>
        )}
      </div>

      {actionable && (
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={() => onAccept(appointment.id)}
            disabled={busy}
            style={{
              flex: 1,
              background: C.green,
              color: C.white,
              border: "none",
              borderRadius: 7,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.5 : 1,
            }}
          >
            {t("NutritionistPage.Accept")}
          </button>
          <button
            onClick={() => onReject(appointment.id)}
            disabled={busy}
            style={{
              flex: 1,
              background: C.white,
              color: C.red,
              border: `1px solid ${C.red}`,
              borderRadius: 7,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.5 : 1,
            }}
          >
            {t("NutritionistPage.Reject")}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/components/AppointmentCard.test.jsx`
Expected: PASS — 5 tests green.

- [ ] **Step 6: Stage and request review**

```bash
git add frontend_client/src/components/AppointmentCard.jsx frontend_client/src/components/AppointmentCard.test.jsx frontend_client/src/locales/en/translation.json frontend_client/src/locales/pt/translation.json
```
Pause for user review before committing.

---

## Task 5: Frontend component — NutritionistPickerModal (+ additive i18n)

**Files:**
- Create: `frontend_client/src/components/NutritionistPickerModal.jsx`
- Test: `frontend_client/src/components/NutritionistPickerModal.test.jsx`
- Modify: `frontend_client/src/locales/en/translation.json`, `frontend_client/src/locales/pt/translation.json` (additive)

**Interfaces:**
- Consumes: `useNutritionists({ searchBy, location })` from `../hooks/useNutritionists` (returns `{ data, loading, error, refetch }`); `useNavigate` from `react-router-dom`; `SkeletonCard`; `Avatar`; `C`.
- Produces: `<NutritionistPickerModal onClose />`. Lists nutritionists; clicking a row calls `navigate('/dashboard/' + id)` then `onClose()`.

- [ ] **Step 1: Add the i18n keys (additive)**

In `frontend_client/src/locales/en/translation.json`, inside `"NutritionistPage"`, add:

```json
        "Picker" : {
            "Title" : "Select a nutritionist",
            "Error" : "Failed to load nutritionists. Please try again.",
            "Retry" : "Retry",
            "Close" : "Close"
        },
```

In `frontend_client/src/locales/pt/translation.json`, inside `"NutritionistPage"`, add:

```json
        "Picker" : {
            "Title" : "Selecione um nutricionista",
            "Error" : "Falha ao carregar nutricionistas. Por favor, tente novamente.",
            "Retry" : "Tentar novamente",
            "Close" : "Fechar"
        },
```

- [ ] **Step 2: Write the failing test**

Create `frontend_client/src/components/NutritionistPickerModal.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NutritionistPickerModal } from './NutritionistPickerModal';
import * as hook from '../hooks/useNutritionists';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('../hooks/useNutritionists');

beforeEach(() => jest.clearAllMocks());

function renderModal(onClose = () => {}) {
  render(
    <MemoryRouter>
      <NutritionistPickerModal onClose={onClose} />
    </MemoryRouter>,
  );
}

test('lists the nutritionists', () => {
  hook.useNutritionists.mockReturnValue({
    data: [{ id: 1, name: 'John Smith' }, { id: 2, name: 'Emma Brown' }],
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
  renderModal();
  expect(screen.getByText('John Smith')).toBeInTheDocument();
  expect(screen.getByText('Emma Brown')).toBeInTheDocument();
});

test('navigates to the dashboard for the picked nutritionist and closes', async () => {
  const onClose = jest.fn();
  hook.useNutritionists.mockReturnValue({
    data: [{ id: 2, name: 'Emma Brown' }],
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
  renderModal(onClose);
  await userEvent.click(screen.getByText('Emma Brown'));
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard/2');
  expect(onClose).toHaveBeenCalled();
});

test('shows an error with retry when loading fails', () => {
  const refetch = jest.fn();
  hook.useNutritionists.mockReturnValue({
    data: [], loading: false, error: new Error('x'), refetch,
  });
  renderModal();
  expect(screen.getByText(/failed to load nutritionists/i)).toBeInTheDocument();
});
```

- [ ] **Step 3: Run test to verify it fails**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/components/NutritionistPickerModal.test.jsx`
Expected: FAIL — `NutritionistPickerModal` module does not exist.

- [ ] **Step 4: Implement the component**

Create `frontend_client/src/components/NutritionistPickerModal.jsx`:

```jsx
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar } from "../utils/Avatar";
import { SkeletonCard } from "./SkeletonCard";
import { C } from "../utils/consts";
import { useNutritionists } from "../hooks/useNutritionists";

export function NutritionistPickerModal({ onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useNutritionists({ searchBy: "", location: "" });

  function pick(id) {
    navigate(`/dashboard/${id}`);
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 12,
          padding: "28px 32px",
          width: 420,
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 18 }}>
          {t("NutritionistPage.Picker.Title")}
        </div>

        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ color: C.red, marginBottom: 12, fontSize: 14 }}>
              {t("NutritionistPage.Picker.Error")}
            </div>
            <button
              onClick={refetch}
              style={{
                background: C.green, color: C.white, border: "none",
                borderRadius: 6, padding: "8px 22px", fontSize: 13,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              {t("NutritionistPage.Picker.Retry")}
            </button>
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.map(n => (
              <button
                key={n.id}
                onClick={() => pick(n.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: C.white, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "10px 14px", cursor: "pointer",
                  textAlign: "left", width: "100%",
                }}
                onMouseOver={e => { e.currentTarget.style.background = C.greenLight; }}
                onMouseOut={e => { e.currentTarget.style.background = C.white; }}
              >
                <Avatar name={n.name} size={40} />
                <span style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{n.name}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 18, width: "100%", background: C.white, color: C.muted,
            border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 0",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          {t("NutritionistPage.Picker.Close")}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/components/NutritionistPickerModal.test.jsx`
Expected: PASS — 3 tests green.

- [ ] **Step 6: Stage and request review**

```bash
git add frontend_client/src/components/NutritionistPickerModal.jsx frontend_client/src/components/NutritionistPickerModal.test.jsx frontend_client/src/locales/en/translation.json frontend_client/src/locales/pt/translation.json
```
Pause for user review before committing.

---

## Task 6: Wire the HomePage to the picker + route change

**Files:**
- Modify: `frontend_client/src/pages/HomePage.jsx`
- Modify: `frontend_client/src/App.js`
- Test: `frontend_client/src/pages/HomePage.test.jsx` (new)

**Interfaces:**
- Consumes: `NutritionistPickerModal` from `../components/NutritionistPickerModal`.
- Produces: HomePage nutritionist card opens the picker modal; dashboard route is `/dashboard/:id`.

- [ ] **Step 1: Write the failing test**

Create `frontend_client/src/pages/HomePage.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import * as hook from '../hooks/useNutritionists';

jest.mock('../hooks/useNutritionists');

beforeEach(() => jest.clearAllMocks());

test('opens the nutritionist picker when the nutritionist card is clicked', async () => {
  hook.useNutritionists.mockReturnValue({
    data: [{ id: 1, name: 'John Smith' }],
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
  render(<MemoryRouter><HomePage /></MemoryRouter>);

  expect(screen.queryByText('Select a nutritionist')).not.toBeInTheDocument();
  await userEvent.click(screen.getByText("I'm a nutritionist"));
  expect(screen.getByText('Select a nutritionist')).toBeInTheDocument();
  expect(screen.getByText('John Smith')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/pages/HomePage.test.jsx`
Expected: FAIL — clicking the card currently navigates; "Select a nutritionist" is never rendered.

- [ ] **Step 3: Update HomePage**

In `frontend_client/src/pages/HomePage.jsx`:

Replace the import block (lines 1-5) and add the modal import + `useState`:

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "../components/Navbar";
import { HomeCard } from "../components/HomeCard";
import { NutritionistPickerModal } from "../components/NutritionistPickerModal";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";
```

Add picker state at the top of the component body (just after `const { t } = useTranslation();`):

```jsx
  const [pickerOpen, setPickerOpen] = useState(false);
```

Change the nutritionist `HomeCard` `onClick` (currently `onClick={() => navigate('/dashboard')}`) to:

```jsx
          onClick={() => setPickerOpen(true)}
```

Render the modal — add this immediately before the closing `</div>` of the outermost wrapper (after the footer `<p>...</p>`):

```jsx
      {pickerOpen && (
        <NutritionistPickerModal onClose={() => setPickerOpen(false)} />
      )}
```

- [ ] **Step 4: Update the route**

In `frontend_client/src/App.js`, change the dashboard route:

```jsx
      <Route path="/dashboard/:id" element={<NutritionistPage />} />
```

- [ ] **Step 5: Run tests to verify they pass**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/pages/HomePage.test.jsx src/App.test.js`
Expected: PASS — the new HomePage test passes and `App.test.js` (home renders both cards) stays green.

- [ ] **Step 6: Stage and request review**

```bash
git add frontend_client/src/pages/HomePage.jsx frontend_client/src/App.js frontend_client/src/pages/HomePage.test.jsx
```
Pause for user review before committing.

---

## Task 7: Rewrite the NutritionistPage (tabs + Accept/Reject) + cleanup

**Files:**
- Modify (rewrite): `frontend_client/src/pages/NutritionistPage.jsx`
- Modify (rewrite): `frontend_client/src/pages/NutritionistPage.test.jsx`
- Modify: `frontend_client/src/locales/en/translation.json`, `frontend_client/src/locales/pt/translation.json` (add page keys, remove orphaned keys)
- Delete: `frontend_client/src/components/RequestCard.jsx`, `frontend_client/src/components/RequestModal.jsx`

**Interfaces:**
- Consumes: `useParams` (`react-router-dom`); `useAppointments(id)`; `acceptAppointment(id)`, `rejectAppointment(id)` from `../api/appointments`; `AppointmentCard`; `SkeletonCard`; `Navbar`; `C`.

- [ ] **Step 1: Add the page i18n keys (additive) and remove orphaned ones**

In `frontend_client/src/locales/en/translation.json`, replace the entire `"NutritionistPage"` object with (this keeps the keys added in Tasks 4–5 and drops the now-unused `RequestCard`/`RequestModal`/`PendingRequests`):

```json
    "NutritionistPage" : {
        "Title" : "Appointments",
        "Subtitle" : "Review and manage your appointment requests",
        "Tabs" : {
            "Pending" : "Pending",
            "Accepted" : "Accepted",
            "Rejected" : "Rejected"
        },
        "Status" : {
            "pending" : "Pending",
            "accepted" : "Accepted",
            "rejected" : "Rejected"
        },
        "Accept" : "Accept",
        "Reject" : "Reject",
        "Empty" : {
            "pending" : "No pending requests — you're all caught up! 🎉",
            "accepted" : "No accepted appointments yet.",
            "rejected" : "No rejected appointments."
        },
        "Error" : "Failed to load appointments. Please try again.",
        "Retry" : "Retry",
        "ActionFailed" : "Something went wrong. Please try again.",
        "AppointmentAccepted" : "Appointment accepted!",
        "AppointmentRejected" : "Appointment rejected.",
        "Picker" : {
            "Title" : "Select a nutritionist",
            "Error" : "Failed to load nutritionists. Please try again.",
            "Retry" : "Retry",
            "Close" : "Close"
        }
    },
```

In `frontend_client/src/locales/pt/translation.json`, replace the entire `"NutritionistPage"` object with:

```json
    "NutritionistPage" : {
        "Title" : "Consultas",
        "Subtitle" : "Reveja e faça a gestão dos seus pedidos de consulta",
        "Tabs" : {
            "Pending" : "Pendentes",
            "Accepted" : "Aceites",
            "Rejected" : "Rejeitadas"
        },
        "Status" : {
            "pending" : "Pendente",
            "accepted" : "Aceite",
            "rejected" : "Rejeitada"
        },
        "Accept" : "Aceitar",
        "Reject" : "Rejeitar",
        "Empty" : {
            "pending" : "Não há pedidos pendentes — está tudo em dia! 🎉",
            "accepted" : "Ainda não há consultas aceites.",
            "rejected" : "Não há consultas rejeitadas."
        },
        "Error" : "Falha ao carregar as consultas. Por favor, tente novamente.",
        "Retry" : "Tentar novamente",
        "ActionFailed" : "Algo correu mal. Por favor, tente novamente.",
        "AppointmentAccepted" : "Consulta aceite!",
        "AppointmentRejected" : "Consulta rejeitada.",
        "Picker" : {
            "Title" : "Selecione um nutricionista",
            "Error" : "Falha ao carregar nutricionistas. Por favor, tente novamente.",
            "Retry" : "Tentar novamente",
            "Close" : "Fechar"
        }
    },
```

- [ ] **Step 2: Write the failing tests (rewrite the test file)**

Replace the entire contents of `frontend_client/src/pages/NutritionistPage.test.jsx`:

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NutritionistPage } from './NutritionistPage';
import * as appointmentsHook from '../hooks/useAppointments';
import * as appointmentsApi from '../api/appointments';

jest.mock('../hooks/useAppointments');
jest.mock('../api/appointments');

const base = {
  service_type_name: 'Online',
  location_name: 'London',
  scheduled_date: '2026-07-15T10:00:00.000Z',
};
const appts = [
  { ...base, id: 1, patient_name: 'Alice Pending', patient_email: 'a@x.com', status: 'pending' },
  { ...base, id: 2, patient_name: 'Bob Accepted', patient_email: 'b@x.com', status: 'accepted' },
  { ...base, id: 3, patient_name: 'Carol Rejected', patient_email: 'c@x.com', status: 'rejected' },
];

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/dashboard/9']}>
      <Routes>
        <Route path="/dashboard/:id" element={<NutritionistPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  appointmentsHook.useAppointments.mockReturnValue({
    data: appts, loading: false, error: null, refetch: jest.fn(),
  });
});

test('shows the pending appointments by default', () => {
  renderPage();
  expect(screen.getByText('Alice Pending')).toBeInTheDocument();
  expect(screen.queryByText('Bob Accepted')).not.toBeInTheDocument();
});

test('switches to the Accepted tab', async () => {
  renderPage();
  await userEvent.click(screen.getByRole('button', { name: /accepted/i }));
  expect(screen.getByText('Bob Accepted')).toBeInTheDocument();
  expect(screen.queryByText('Alice Pending')).not.toBeInTheDocument();
});

test('accepting a pending appointment calls the API, moves it, and shows a toast', async () => {
  appointmentsApi.acceptAppointment.mockResolvedValue({ ...appts[0], status: 'accepted' });
  renderPage();
  await userEvent.click(screen.getByRole('button', { name: /^accept$/i }));
  expect(appointmentsApi.acceptAppointment).toHaveBeenCalledWith(1);
  await waitFor(() =>
    expect(screen.queryByText('Alice Pending')).not.toBeInTheDocument(),
  );
  expect(screen.getByText('Appointment accepted!')).toBeInTheDocument();
});

test('rejecting a pending appointment calls the API and shows a toast', async () => {
  appointmentsApi.rejectAppointment.mockResolvedValue({ ...appts[0], status: 'rejected' });
  renderPage();
  await userEvent.click(screen.getByRole('button', { name: /^reject$/i }));
  expect(appointmentsApi.rejectAppointment).toHaveBeenCalledWith(1);
  await waitFor(() =>
    expect(screen.getByText('Appointment rejected.')).toBeInTheDocument(),
  );
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/pages/NutritionistPage.test.jsx`
Expected: FAIL — the current page renders hardcoded data and has no tabs/`AppointmentCard` wiring.

- [ ] **Step 4: Rewrite the page**

Replace the entire contents of `frontend_client/src/pages/NutritionistPage.jsx`:

```jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SkeletonCard } from "../components/SkeletonCard";
import { AppointmentCard } from "../components/AppointmentCard";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";
import { useAppointments } from "../hooks/useAppointments";
import { acceptAppointment, rejectAppointment } from "../api/appointments";

const TABS = ["pending", "accepted", "rejected"];

export function NutritionistPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data, loading, error, refetch } = useAppointments(id);

  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { setItems(data); }, [data]);

  function showToast(msg, color) {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2800);
  }

  function applyResult(updated) {
    setItems(list => list.map(a => (a.id === updated.id ? updated : a)));
  }

  async function handleAccept(appointmentId) {
    setBusyId(appointmentId);
    try {
      const updated = await acceptAppointment(appointmentId);
      applyResult(updated);
      showToast(t("NutritionistPage.AppointmentAccepted"), C.green);
    } catch {
      showToast(t("NutritionistPage.ActionFailed"), C.red);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(appointmentId) {
    setBusyId(appointmentId);
    try {
      const updated = await rejectAppointment(appointmentId);
      applyResult(updated);
      showToast(t("NutritionistPage.AppointmentRejected"), C.red);
    } catch {
      showToast(t("NutritionistPage.ActionFailed"), C.red);
    } finally {
      setBusyId(null);
    }
  }

  const visible = items.filter(a => a.status === activeTab);

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: "36px auto", padding: "0 20px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0, marginBottom: 4 }}>
          {t("NutritionistPage.Title")}
        </h1>
        <p style={{ fontSize: 13, color: C.sub, margin: 0, marginBottom: 20 }}>
          {t("NutritionistPage.Subtitle")}
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {TABS.map(tab => {
            const count = items.filter(a => a.status === tab).length;
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: active ? C.green : C.white,
                  color: active ? C.white : C.muted,
                  border: `1px solid ${active ? C.green : C.border}`,
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t(`NutritionistPage.Tabs.${tab.charAt(0).toUpperCase() + tab.slice(1)}`)} ({count})
              </button>
            );
          })}
        </div>

        <div style={{
          background: C.white,
          borderRadius: 12,
          border: `1px solid ${C.border}`,
          padding: "20px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        }}>
          {loading && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}

          {!loading && error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ color: C.red, marginBottom: 12, fontSize: 15 }}>
                {t("NutritionistPage.Error")}
              </div>
              <button
                onClick={refetch}
                style={{
                  background: C.green, color: C.white, border: "none",
                  borderRadius: 6, padding: "9px 24px", fontSize: 13,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                {t("NutritionistPage.Retry")}
              </button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div style={{ textAlign: "center", color: "#bbb", padding: "40px 0", fontSize: 15 }}>
              {t(`NutritionistPage.Empty.${activeTab}`)}
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {visible.map(appt =>
                activeTab === "pending" ? (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    busy={busyId === appt.id}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ) : (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: toast.color, color: C.white, padding: "11px 26px",
          borderRadius: 8, fontSize: 14, fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)", zIndex: 200,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run (from `frontend_client/`): `npm test -- --watchAll=false src/pages/NutritionistPage.test.jsx`
Expected: PASS — 4 tests green.

- [ ] **Step 6: Delete the orphaned components**

```bash
git rm frontend_client/src/components/RequestCard.jsx frontend_client/src/components/RequestModal.jsx
```

(There are no tests for these components, so nothing else references them after the rewrite.)

- [ ] **Step 7: Run the full frontend suite**

Run (from `frontend_client/`): `npm test -- --watchAll=false`
Expected: PASS — entire suite green (confirms no lingering imports of the deleted components or removed i18n keys).

- [ ] **Step 8: Stage and request review**

```bash
git add frontend_client/src/pages/NutritionistPage.jsx frontend_client/src/pages/NutritionistPage.test.jsx frontend_client/src/locales/en/translation.json frontend_client/src/locales/pt/translation.json
```
(The `git rm` from Step 6 is already staged.) Pause for user review before committing.

---

## Final verification

- [ ] Backend suite green: from `backend_api/`, `bin/rails test`.
- [ ] Frontend suite green: from `frontend_client/`, `npm test -- --watchAll=false`.
- [ ] Manual smoke (optional): start backend + `npm start`, from HomePage click "I'm a nutritionist", pick a nutritionist, verify the three tabs load real appointments and Accept/Reject move cards between tabs.

---

## Self-Review

**Spec coverage:**
- HomePage modal to select a nutritionist → Task 5 (modal) + Task 6 (wiring). ✓
- Route carries selection via `/dashboard/:id` → Task 6. ✓
- Integrate `appointments#index` to list → Task 1 (blueprint) + Tasks 2/3 (api/hook) + Task 7 (render). ✓
- Three status tabs → Task 7. ✓
- Accept/Reject wired to backend endpoints → Task 2 (api) + Task 4 (buttons) + Task 7 (handlers). ✓
- `AppointmentBlueprint` enrichment (service type + location) → Task 1. ✓
- Retire `RequestCard`/`RequestModal` + mock → Task 7. ✓
- i18n en + pt → Tasks 4, 5, 7. ✓
- Tests: backend index assertions (Task 1); api (Task 2); hook (Task 3); AppointmentCard (Task 4); picker (Task 5); HomePage (Task 6); NutritionistPage rewrite (Task 7). ✓

**Placeholder scan:** No TBD/TODO; every code step contains full code. ✓

**Type consistency:** `getNutritionistAppointments`/`acceptAppointment`/`rejectAppointment` names match across Tasks 2, 3, 7. `useAppointments` returns `{ data, loading, error, refetch }` (Task 3) consumed identically in Task 7. `AppointmentCard` prop names (`appointment`, `onAccept`, `onReject`, `busy`) match between Task 4 and Task 7. Status strings (`pending`/`accepted`/`rejected`) consistent across blueprint, badge, tabs, and `Empty`/`Status` i18n keys. ✓
