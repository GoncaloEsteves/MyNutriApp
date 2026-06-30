# AppointmentRequestModal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a patient open a modal from a `ProfessionalCard`, pick one of that nutritionist's services, enter name/email, pick a future date/time, and submit an appointment request to the existing backend endpoint.

**Architecture:** Approach A — a self-contained `AppointmentRequestModal` owned by `ProfessionalCard`. The card holds open/close state; the modal owns all form + submission state and calls a new `api/appointments.js` helper. Success and error are shown inside the modal. Mirrors the existing `RequestModal` + `api/*` patterns.

**Tech Stack:** React 19, Create React App (`react-scripts` 5), `axios`, `react-i18next`, Jest + React Testing Library. Native `<input type="datetime-local">` (no new dependencies).

## Global Constraints

- **No new npm dependencies.** Use native `datetime-local`; follow the plain inline-styled component style already in the repo.
- **Endpoint:** `POST /nutritionists/:nutritionist_id/services/:service_id/appointments`; request body shape **exactly** `{ appointment: { patient_name, patient_email, scheduled_date } }`. **Omit `status`** (backend defaults it to `pending`).
- **`scheduled_date`** is sent as UTC ISO: `new Date(localValue).toISOString()`.
- **i18n:** every new user-facing string is added to **both** `locales/en/translation.json` and `locales/pt/translation.json`. New keys live under `PatientPage.AppointmentRequestModal`.
- **`service_type_name`** values are full i18n keys (e.g. `"SERVICETYPE.CLINICAPPOINTMENT"`) and are translated with `t(service_type_name)`.
- **Test run command (CRA, run-once):** `npm test -- --watchAll=false <path>` (run from `frontend_client/`).
- **Commits (project rule):** the commit steps below stage and commit, but per the user's global rule *"never commit automatically"*, the executor must **pause for user review before running each commit step**.

---

### Task 1: API helper `requestAppointment`

**Files:**
- Create: `frontend_client/src/api/appointments.js`
- Test: `frontend_client/src/api/appointments.test.js`

**Interfaces:**
- Consumes: the default axios instance from `frontend_client/src/api/client.js` (has `.post`).
- Produces: `requestAppointment(nutritionistId, serviceId, payload, signal) => Promise<object>` where `payload` is `{ patient_name, patient_email, scheduled_date }`; resolves to `response.data`.

- [ ] **Step 1: Write the failing test**

Create `frontend_client/src/api/appointments.test.js`:

```js
import client from './client';
import { requestAppointment } from './appointments';

jest.mock('./client', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

beforeEach(() => jest.clearAllMocks());

describe('requestAppointment', () => {
  it('POSTs to the nested appointments path with the appointment payload', async () => {
    client.post.mockResolvedValue({ data: { id: 9, status: 'pending' } });
    const payload = {
      patient_name: 'John Doe',
      patient_email: 'john@example.com',
      scheduled_date: '2026-07-01T13:00:00.000Z',
    };
    await requestAppointment(3, 5, payload);
    expect(client.post).toHaveBeenCalledWith(
      '/nutritionists/3/services/5/appointments',
      { appointment: payload },
      { signal: undefined },
    );
  });

  it('returns response.data', async () => {
    const data = { id: 9, status: 'pending' };
    client.post.mockResolvedValue({ data });
    const result = await requestAppointment(1, 2, {});
    expect(result).toEqual(data);
  });

  it('passes the signal through', async () => {
    client.post.mockResolvedValue({ data: {} });
    const signal = new AbortController().signal;
    await requestAppointment(1, 2, {}, signal);
    expect(client.post).toHaveBeenCalledWith(
      '/nutritionists/1/services/2/appointments',
      { appointment: {} },
      { signal },
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/api/appointments.test.js`
Expected: FAIL — `requestAppointment` is not exported / module not found.

- [ ] **Step 3: Write minimal implementation**

Create `frontend_client/src/api/appointments.js`:

```js
import client from './client';

export function requestAppointment(nutritionistId, serviceId, payload, signal) {
  return client
    .post(
      `/nutritionists/${nutritionistId}/services/${serviceId}/appointments`,
      { appointment: payload },
      { signal },
    )
    .then(r => r.data);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/api/appointments.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit** *(pause for user review first — project rule)*

```bash
git add frontend_client/src/api/appointments.js frontend_client/src/api/appointments.test.js
git commit -m "feat: add requestAppointment API helper"
```

---

### Task 2: AppointmentRequestModal component

**Files:**
- Create: `frontend_client/src/components/AppointmentRequestModal.jsx`
- Test: `frontend_client/src/components/AppointmentRequestModal.test.jsx`
- Modify: `frontend_client/src/locales/en/translation.json` (add `PatientPage.AppointmentRequestModal`)
- Modify: `frontend_client/src/locales/pt/translation.json` (add `PatientPage.AppointmentRequestModal`)

**Interfaces:**
- Consumes: `requestAppointment(nutritionistId, serviceId, payload, signal)` from Task 1.
- Produces: `AppointmentRequestModal({ nutritionist, onClose })` — named export. `nutritionist` is `{ id, name, services: [{ id, price, duration, service_type_name, location_name }] }`. Renders `null` when `nutritionist` is falsy. Calls `onClose()` on overlay click, Cancel, and Close.

- [ ] **Step 1: Add i18n keys (en)**

In `frontend_client/src/locales/en/translation.json`, add an `AppointmentRequestModal` block **inside** the existing `"PatientPage"` object (e.g. right after the `"ProfessionalCard"` block — remember the trailing comma on the preceding block):

```json
"AppointmentRequestModal" : {
    "Title" : "Schedule appointment with {{name}}",
    "ServiceLabel" : "Service",
    "ServicePlaceholder" : "Select a service",
    "ServiceOption" : "{{type}} · {{location}} · from {{price}}€ · {{duration}} min",
    "NameLabel" : "Your name",
    "NamePlaceholder" : "Full name",
    "EmailLabel" : "Your email",
    "EmailPlaceholder" : "you@example.com",
    "DateLabel" : "Date & time",
    "Submit" : "Request appointment",
    "Cancel" : "Cancel",
    "Close" : "Close",
    "Sending" : "Sending…",
    "SuccessTitle" : "Request sent!",
    "SuccessMessage" : "Your appointment request was sent. The nutritionist will confirm it shortly.",
    "Errors" : {
        "InvalidEmail" : "Please enter a valid email.",
        "PastDate" : "Please choose a date in the future.",
        "SubmitFailed" : "Something went wrong. Please try again."
    }
}
```

- [ ] **Step 2: Add i18n keys (pt)**

In `frontend_client/src/locales/pt/translation.json`, add the matching block inside `"PatientPage"`:

```json
"AppointmentRequestModal" : {
    "Title" : "Agendar consulta com {{name}}",
    "ServiceLabel" : "Serviço",
    "ServicePlaceholder" : "Selecione um serviço",
    "ServiceOption" : "{{type}} · {{location}} · a partir de {{price}}€ · {{duration}} min",
    "NameLabel" : "O seu nome",
    "NamePlaceholder" : "Nome completo",
    "EmailLabel" : "O seu email",
    "EmailPlaceholder" : "voce@exemplo.com",
    "DateLabel" : "Data e hora",
    "Submit" : "Pedir consulta",
    "Cancel" : "Cancelar",
    "Close" : "Fechar",
    "Sending" : "A enviar…",
    "SuccessTitle" : "Pedido enviado!",
    "SuccessMessage" : "O seu pedido de consulta foi enviado. O nutricionista irá confirmá-lo em breve.",
    "Errors" : {
        "InvalidEmail" : "Introduza um email válido.",
        "PastDate" : "Escolha uma data no futuro.",
        "SubmitFailed" : "Algo correu mal. Por favor, tente novamente."
    }
}
```

- [ ] **Step 3: Write the failing tests**

Create `frontend_client/src/components/AppointmentRequestModal.test.jsx`:

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentRequestModal } from './AppointmentRequestModal';
import * as api from '../api/appointments';

jest.mock('../api/appointments');

const nutritionist = {
  id: 7,
  name: 'Mary Jane',
  services: [
    { id: 5, price: 50, duration: 45, service_type_name: 'SERVICETYPE.CLINICAPPOINTMENT', location_name: 'Porto' },
    { id: 8, price: 30, duration: 30, service_type_name: 'SERVICETYPE.ONLINEAPPOINTMENT', location_name: 'Lisboa' },
  ],
};

const FUTURE = '2099-01-01T10:00';
const PAST = '2000-01-01T10:00';

function renderModal(props = {}) {
  const onClose = jest.fn();
  render(<AppointmentRequestModal nutritionist={nutritionist} onClose={onClose} {...props} />);
  return { onClose };
}

async function fillValidForm() {
  await userEvent.selectOptions(screen.getByLabelText('Service'), '5');
  await userEvent.type(screen.getByLabelText('Your name'), 'John Doe');
  await userEvent.type(screen.getByLabelText('Your email'), 'john@example.com');
  fireEvent.change(screen.getByLabelText('Date & time'), { target: { value: FUTURE } });
}

beforeEach(() => jest.clearAllMocks());

test('returns null when no nutritionist is provided', () => {
  const { container } = render(<AppointmentRequestModal nutritionist={null} onClose={jest.fn()} />);
  expect(container).toBeEmptyDOMElement();
});

test('renders one option per service with translated type, location, price and duration', () => {
  renderModal();
  expect(
    screen.getByRole('option', { name: 'Clinic Appointment · Porto · from 50€ · 45 min' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('option', { name: 'Online Appointment · Lisboa · from 30€ · 30 min' })
  ).toBeInTheDocument();
});

test('Submit is disabled until all fields are valid', async () => {
  renderModal();
  const submit = screen.getByRole('button', { name: 'Request appointment' });
  expect(submit).toBeDisabled();
  await fillValidForm();
  expect(submit).toBeEnabled();
});

test('invalid email shows a hint and keeps Submit disabled', async () => {
  renderModal();
  await userEvent.selectOptions(screen.getByLabelText('Service'), '5');
  await userEvent.type(screen.getByLabelText('Your name'), 'John Doe');
  await userEvent.type(screen.getByLabelText('Your email'), 'not-an-email');
  fireEvent.change(screen.getByLabelText('Date & time'), { target: { value: FUTURE } });
  expect(screen.getByText('Please enter a valid email.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Request appointment' })).toBeDisabled();
});

test('past date shows a hint and keeps Submit disabled', async () => {
  renderModal();
  await userEvent.selectOptions(screen.getByLabelText('Service'), '5');
  await userEvent.type(screen.getByLabelText('Your name'), 'John Doe');
  await userEvent.type(screen.getByLabelText('Your email'), 'john@example.com');
  fireEvent.change(screen.getByLabelText('Date & time'), { target: { value: PAST } });
  expect(screen.getByText('Please choose a date in the future.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Request appointment' })).toBeDisabled();
});

test('successful submit calls requestAppointment with the right args and shows success', async () => {
  api.requestAppointment.mockResolvedValue({ id: 1, status: 'pending' });
  renderModal();
  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: 'Request appointment' }));

  await waitFor(() =>
    expect(api.requestAppointment).toHaveBeenCalledWith(7, '5', {
      patient_name: 'John Doe',
      patient_email: 'john@example.com',
      scheduled_date: new Date(FUTURE).toISOString(),
    })
  );
  expect(await screen.findByText('Request sent!')).toBeInTheDocument();
});

test('backend error shows an inline error and keeps the form open', async () => {
  api.requestAppointment.mockRejectedValue(new Error('boom'));
  renderModal();
  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: 'Request appointment' }));

  expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Request appointment' })).toBeInTheDocument();
});

test('Cancel calls onClose', async () => {
  const { onClose } = renderModal();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onClose).toHaveBeenCalled();
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test -- --watchAll=false src/components/AppointmentRequestModal.test.jsx`
Expected: FAIL — component module not found.

- [ ] **Step 5: Implement the component**

Create `frontend_client/src/components/AppointmentRequestModal.jsx`:

```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { requestAppointment } from "../api/appointments";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nowLocalDatetime() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
};
const cardStyle = {
  background: "#fff", borderRadius: 12, padding: "32px 36px",
  width: 420, maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
};
const labelStyle = { fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 4, display: "block" };
const fieldStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 6,
  border: "1px solid #d4dadf", fontSize: 14, outline: "none", boxSizing: "border-box",
};
const hintStyle = { color: "#e05a5a", fontSize: 12, marginTop: 4 };
const primaryBtnStyle = {
  flex: 1, background: "#2e9e82", color: "#fff", border: "none",
  borderRadius: 7, padding: "10px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
};
const secondaryBtnStyle = {
  flex: 1, background: "#fff", color: "#666", border: "1px solid #ccc",
  borderRadius: 7, padding: "10px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
};

export function AppointmentRequestModal({ nutritionist, onClose }) {
  const { t } = useTranslation();
  const [serviceId, setServiceId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [phase, setPhase] = useState("form"); // "form" | "submitting" | "success"
  const [submitError, setSubmitError] = useState(null);

  if (!nutritionist) return null;

  const tk = k => t(`PatientPage.AppointmentRequestModal.${k}`);

  const emailValid = EMAIL_RE.test(email);
  const dateFuture = scheduledAt !== "" && new Date(scheduledAt).getTime() > Date.now();
  const isValid = serviceId !== "" && name.trim() !== "" && emailValid && dateFuture;
  const busy = phase === "submitting";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || busy) return;
    setPhase("submitting");
    setSubmitError(null);
    try {
      await requestAppointment(nutritionist.id, serviceId, {
        patient_name: name.trim(),
        patient_email: email.trim(),
        scheduled_date: new Date(scheduledAt).toISOString(),
      });
      setPhase("success");
    } catch {
      setPhase("form");
      setSubmitError(tk("Errors.SubmitFailed"));
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        {phase === "success" ? (
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#2e9e82", marginBottom: 10 }}>
              {tk("SuccessTitle")}
            </div>
            <div style={{ fontSize: 14, color: "#555", marginBottom: 24 }}>
              {tk("SuccessMessage")}
            </div>
            <button type="button" onClick={onClose} style={{ ...primaryBtnStyle, width: "100%" }}>
              {tk("Close")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222", marginBottom: 20 }}>
              {t("PatientPage.AppointmentRequestModal.Title", { name: nutritionist.name })}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="ar-service">{tk("ServiceLabel")}</label>
              <select id="ar-service" value={serviceId}
                onChange={e => setServiceId(e.target.value)} style={fieldStyle}>
                <option value="">{tk("ServicePlaceholder")}</option>
                {nutritionist.services.map(s => (
                  <option key={s.id} value={s.id}>
                    {t("PatientPage.AppointmentRequestModal.ServiceOption", {
                      type: t(s.service_type_name),
                      location: s.location_name,
                      price: s.price,
                      duration: s.duration,
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="ar-name">{tk("NameLabel")}</label>
              <input id="ar-name" type="text" value={name}
                onChange={e => setName(e.target.value)}
                placeholder={tk("NamePlaceholder")} style={fieldStyle} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="ar-email">{tk("EmailLabel")}</label>
              <input id="ar-email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={tk("EmailPlaceholder")} style={fieldStyle} />
              {email !== "" && !emailValid && (
                <div style={hintStyle}>{tk("Errors.InvalidEmail")}</div>
              )}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle} htmlFor="ar-date">{tk("DateLabel")}</label>
              <input id="ar-date" type="datetime-local" value={scheduledAt}
                min={nowLocalDatetime()}
                onChange={e => setScheduledAt(e.target.value)} style={fieldStyle} />
              {scheduledAt !== "" && !dateFuture && (
                <div style={hintStyle}>{tk("Errors.PastDate")}</div>
              )}
            </div>

            {submitError && (
              <div style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>{submitError}</div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={!isValid || busy}
                style={{ ...primaryBtnStyle,
                  opacity: (!isValid || busy) ? 0.5 : 1,
                  cursor: (!isValid || busy) ? "not-allowed" : "pointer" }}>
                {busy ? tk("Sending") : tk("Submit")}
              </button>
              <button type="button" onClick={onClose} style={secondaryBtnStyle}>
                {tk("Cancel")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- --watchAll=false src/components/AppointmentRequestModal.test.jsx`
Expected: PASS (8 tests).

- [ ] **Step 7: Commit** *(pause for user review first — project rule)*

```bash
git add frontend_client/src/components/AppointmentRequestModal.jsx \
        frontend_client/src/components/AppointmentRequestModal.test.jsx \
        frontend_client/src/locales/en/translation.json \
        frontend_client/src/locales/pt/translation.json
git commit -m "feat: add AppointmentRequestModal with validation and i18n"
```

---

### Task 3: Wire the modal into `ProfessionalCard`

**Files:**
- Modify: `frontend_client/src/components/ProfessionalCard.jsx`
- Test: `frontend_client/src/components/ProfessionalCard.test.jsx` (create)

**Interfaces:**
- Consumes: `AppointmentRequestModal({ nutritionist, onClose })` from Task 2.
- Produces: no new exports; the existing "Schedule appointment" button now opens the modal with `nutritionist={pro}`.

- [ ] **Step 1: Write the failing test**

Create `frontend_client/src/components/ProfessionalCard.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProfessionalCard } from './ProfessionalCard';

jest.mock('./AppointmentRequestModal', () => ({
  AppointmentRequestModal: ({ nutritionist }) => (
    <div data-testid="appt-modal">{nutritionist.name}</div>
  ),
}));

const pro = {
  id: 7,
  name: 'Mary Jane',
  services: [
    { id: 5, price: 50, duration: 45, service_type_name: 'SERVICETYPE.CLINICAPPOINTMENT', location_name: 'Porto' },
  ],
};

function renderCard() {
  render(<MemoryRouter><ProfessionalCard pro={pro} /></MemoryRouter>);
}

test('the modal is not shown initially', () => {
  renderCard();
  expect(screen.queryByTestId('appt-modal')).not.toBeInTheDocument();
});

test('clicking Schedule appointment opens the modal for this nutritionist', async () => {
  renderCard();
  await userEvent.click(screen.getByRole('button', { name: 'Schedule appointment' }));
  expect(screen.getByTestId('appt-modal')).toHaveTextContent('Mary Jane');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/components/ProfessionalCard.test.jsx`
Expected: FAIL — clicking the button does nothing; `appt-modal` never appears.

- [ ] **Step 3: Implement the wiring**

In `frontend_client/src/components/ProfessionalCard.jsx`:

1. Update the imports at the top — add `useState` and the modal import:

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../utils/Avatar";
import { TagBadge } from "../utils/TagBadge";
import { CalendarIcon } from "../utils/CalendarIcon";
import { LocationIcon } from "../utils/LocationIcon";
import { useTranslation } from "react-i18next";
import { AppointmentRequestModal } from "./AppointmentRequestModal";
```

2. Add state at the top of the component body, right after `const navigate = useNavigate();`:

```jsx
  const [scheduling, setScheduling] = useState(false);
```

3. Wire the existing "Schedule appointment" button by adding an `onClick` (the button currently has only `style`, `onMouseOver`, `onMouseOut`):

```jsx
        <button style={{
          background: "#f0a080",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "9px 18px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
          onClick={() => setScheduling(true)}
          onMouseOver={e => e.target.style.background = "#e08a65"}
          onMouseOut={e => e.target.style.background = "#f0a080"}
        >
          {t("PatientPage.ProfessionalCard.ScheduleAppointment")}
        </button>
```

4. Render the modal as the last child inside the component's root `<div>` (just before its closing `</div>`):

```jsx
      {scheduling && (
        <AppointmentRequestModal
          nutritionist={pro}
          onClose={() => setScheduling(false)}
        />
      )}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --watchAll=false src/components/ProfessionalCard.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full frontend test suite**

Run: `npm test -- --watchAll=false`
Expected: PASS — all suites green (existing `PatientPage`, `nutritionists` API, plus the three new suites).

- [ ] **Step 6: Commit** *(pause for user review first — project rule)*

```bash
git add frontend_client/src/components/ProfessionalCard.jsx \
        frontend_client/src/components/ProfessionalCard.test.jsx
git commit -m "feat: open AppointmentRequestModal from ProfessionalCard"
```

---

## Self-Review

**Spec coverage:**
- Service dropdown from the nutritionist's own services → Task 2 (select + options). ✓
- Name + email inputs → Task 2. ✓
- Date/time picker (native `datetime-local`) → Task 2. ✓
- Backend integration (`{ appointment: {...} }`, status omitted, UTC ISO) → Task 1 + Task 2 submit. ✓
- In-modal success view → Task 2 (`phase === "success"`). ✓
- Validation: all required (Submit gating), email format, future-only → Task 2. ✓
- i18n en + pt → Task 2 steps 1–2. ✓
- Trigger from `ProfessionalCard` button → Task 3. ✓
- Tests for API, modal, and card → all three tasks. ✓

**Deviation from spec (intentional):** the spec listed an `Errors.Required` string. Required-ness is instead conveyed by the disabled Submit button (no per-field "required" copy), so `Errors.Required` is omitted to avoid an unused string. Email and past-date each still get an inline hint. Flag for the user during spec/plan review.

**Placeholder scan:** no TBD/TODO; every code and test step contains complete content.

**Type/name consistency:** `requestAppointment(nutritionistId, serviceId, payload, signal)` is defined in Task 1 and called identically in Task 2. `AppointmentRequestModal({ nutritionist, onClose })` is defined in Task 2 and consumed identically in Task 3. The select value is a string (`'5'`), matched in the success-submit assertion (`toHaveBeenCalledWith(7, '5', …)`).
