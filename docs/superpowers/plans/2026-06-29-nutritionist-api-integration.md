# Nutritionist API Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded nutritionist data in the patient frontend with live data from the Rails API, add react-router-dom with real URLs, and build a minimal nutritionist detail page.

**Architecture:** Shared axios client → named API functions → thin custom hooks that expose `{ data, loading, error, refetch }` → pages consume hooks. react-router-dom (BrowserRouter in index.js, Routes/Route in App.js) replaces the current useState-based page switching and callback props.

**Tech Stack:** React 19, react-router-dom (to install), axios (already installed), react-i18next, Jest + React Testing Library (already configured via CRA).

## Global Constraints

- CRA project — test command: `npm test -- --watchAll=false` from `frontend_client/`
- All i18n copy must exist in both `src/locales/en/translation.json` and `src/locales/pt/translation.json`
- API base URL via `process.env.REACT_APP_API_URL`; dev default `http://localhost:4000/api`
- Backend CORS allows `localhost:3000` (frontend origin) — no backend changes needed
- Never commit real secrets; `.env` is gitignored, `.env.example` is tracked
- No new dependencies beyond `react-router-dom`
- Follow existing inline-style pattern (no CSS modules or Tailwind)
- `service_type_name` from the API is already a code (e.g. `SERVICETYPE.ONLINEAPPOINTMENT`) — no mapping needed

---

## File Map

**New files:**
- `frontend_client/src/api/client.js` — shared axios instance
- `frontend_client/src/api/nutritionists.js` — `getNutritionists` and `getNutritionist` functions
- `frontend_client/src/api/nutritionists.test.js` — unit tests for the API functions
- `frontend_client/src/hooks/useNutritionists.js` — hook: list fetch with abort
- `frontend_client/src/hooks/useNutritionists.test.js`
- `frontend_client/src/hooks/useNutritionist.js` — hook: single fetch with abort
- `frontend_client/src/hooks/useNutritionist.test.js`
- `frontend_client/src/pages/NutritionistDetailPage.jsx` — patient-facing detail page
- `frontend_client/src/pages/NutritionistDetailPage.test.jsx`
- `frontend_client/.env.example` — documents `REACT_APP_API_URL`

**Modified files:**
- `frontend_client/src/index.js` — wrap App in BrowserRouter
- `frontend_client/src/App.js` — Routes/Route table (replaces useState switch)
- `frontend_client/src/components/Navbar.jsx` — remove `onHome` prop, use `useNavigate`
- `frontend_client/src/components/ProfessionalCard.jsx` — repurpose Website → View profile
- `frontend_client/src/components/SkeletonCard.jsx` — add `data-testid="skeleton-card"`
- `frontend_client/src/pages/HomePage.jsx` — remove callback props, use `useNavigate`
- `frontend_client/src/pages/PatientPage.jsx` — full rewrite: live data, server search
- `frontend_client/src/pages/PatientPage.test.jsx` — full rewrite
- `frontend_client/src/pages/NutritionistPage.jsx` — remove `onHome` prop
- `frontend_client/src/pages/NutritionistPage.test.jsx` — add MemoryRouter wrapper
- `frontend_client/src/locales/en/translation.json` — new keys
- `frontend_client/src/locales/pt/translation.json` — new keys

---

## Task 1: Install react-router-dom and refactor routing

**Files:**
- Modify: `frontend_client/src/index.js`
- Modify: `frontend_client/src/App.js`
- Modify: `frontend_client/src/components/Navbar.jsx`
- Modify: `frontend_client/src/pages/HomePage.jsx`
- Modify: `frontend_client/src/pages/PatientPage.jsx` (prop removal only)
- Modify: `frontend_client/src/pages/NutritionistPage.jsx` (prop removal only)
- Modify: `frontend_client/src/pages/NutritionistPage.test.jsx`
- Modify: `frontend_client/src/pages/PatientPage.test.jsx` (MemoryRouter only)
- Modify: `frontend_client/src/App.test.js` (MemoryRouter only)

**Interfaces:**
- Produces: `<BrowserRouter>` context in index.js; `<Routes>` in App.js with paths `/`, `/patient`, `/dashboard`, `/nutritionists/:id` (placeholder); `useNavigate` in Navbar, HomePage

- [ ] **Step 1: Install react-router-dom**

```bash
cd frontend_client
npm install react-router-dom
```

Expected output: react-router-dom added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Update existing tests to use MemoryRouter (tests still pass — this is prep)**

`frontend_client/src/pages/NutritionistPage.test.jsx` — full file replacement:
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NutritionistPage } from './NutritionistPage';

function renderPage() {
  render(<MemoryRouter><NutritionistPage /></MemoryRouter>);
}

test('renders all pending request cards', () => {
  renderPage();
  expect(screen.getByText('Francisco Neves')).toBeInTheDocument();
  expect(screen.getByText('Ana Costa')).toBeInTheDocument();
  expect(screen.getByText('Miguel Santos')).toBeInTheDocument();
});

test('opens the modal for the clicked request', async () => {
  renderPage();
  const answerButtons = screen.getAllByRole('button', { name: /answer request/i });
  await userEvent.click(answerButtons[0]);
  expect(screen.getByText('Francisco Neves')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
});

test('accept removes the request and shows success toast', async () => {
  renderPage();
  const answerButtons = screen.getAllByRole('button', { name: /answer request/i });
  await userEvent.click(answerButtons[0]);
  await userEvent.click(screen.getByRole('button', { name: /accept/i }));
  expect(screen.queryByText('Francisco Neves')).not.toBeInTheDocument();
  expect(screen.getByText('Appointment accepted!')).toBeInTheDocument();
});

test('reject removes the request and shows rejection toast', async () => {
  renderPage();
  const answerButtons = screen.getAllByRole('button', { name: /answer request/i });
  await userEvent.click(answerButtons[0]);
  await userEvent.click(screen.getByRole('button', { name: /reject/i }));
  expect(screen.queryByText('Francisco Neves')).not.toBeInTheDocument();
  expect(screen.getByText('Appointment rejected.')).toBeInTheDocument();
});
```

`frontend_client/src/pages/PatientPage.test.jsx` — update render only (keep assertions for now):
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PatientPage } from './PatientPage';

jest.mock('../components/ProfessionalCard', () => ({
  ProfessionalCard: ({ pro }) => <div>{pro.name}</div>,
}));

function renderPage() {
  render(<MemoryRouter><PatientPage /></MemoryRouter>);
}

test('renders all professionals on load', () => {
  renderPage();
  expect(screen.getByText('Mary Jane')).toBeInTheDocument();
  expect(screen.getByText('Carlos Mendes')).toBeInTheDocument();
  expect(screen.getByText('Sofia Reis')).toBeInTheDocument();
});

test('filters by name', async () => {
  renderPage();
  await userEvent.type(screen.getByPlaceholderText('Name or service'), 'Mary');
  expect(screen.getByText('Mary Jane')).toBeInTheDocument();
  expect(screen.queryByText('Carlos Mendes')).not.toBeInTheDocument();
  expect(screen.queryByText('Sofia Reis')).not.toBeInTheDocument();
});

test('filters by location_name via the search box', async () => {
  renderPage();
  await userEvent.type(screen.getByPlaceholderText('Name or service'), 'Lisboa');
  expect(screen.getByText('Carlos Mendes')).toBeInTheDocument();
  expect(screen.queryByText('Mary Jane')).not.toBeInTheDocument();
  expect(screen.queryByText('Sofia Reis')).not.toBeInTheDocument();
});

test('shows no-results message when nothing matches', async () => {
  renderPage();
  await userEvent.type(screen.getByPlaceholderText('Name or service'), 'zzz');
  expect(screen.queryByText('Mary Jane')).not.toBeInTheDocument();
  expect(screen.queryByText('Carlos Mendes')).not.toBeInTheDocument();
  expect(screen.queryByText('Sofia Reis')).not.toBeInTheDocument();
  expect(screen.getByText('No professionals found.')).toBeInTheDocument();
});
```

Open `frontend_client/src/App.test.js`. If it renders `<App />`, wrap it in `<MemoryRouter>` from `react-router-dom` and remove any callback props.

- [ ] **Step 3: Run tests to confirm they still pass before routing changes**

```bash
cd frontend_client
npm test -- --watchAll=false
```

Expected: all tests pass.

- [ ] **Step 4: Implement routing — index.js, App.js, Navbar, HomePage, NutritionistPage, PatientPage**

`frontend_client/src/index.js`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
```

`frontend_client/src/App.js`:
```jsx
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PatientPage } from './pages/PatientPage';
import { NutritionistPage } from './pages/NutritionistPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/patient" element={<PatientPage />} />
      <Route path="/dashboard" element={<NutritionistPage />} />
      <Route path="/nutritionists/:id" element={<div>Nutritionist detail — coming soon</div>} />
    </Routes>
  );
}
```

`frontend_client/src/components/Navbar.jsx`:
```jsx
import { useNavigate } from 'react-router-dom';
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <nav
      style={{
        background: C.green,
        padding: "0 32px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <button
        onClick={() => navigate('/')}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: C.white,
          fontWeight: 700,
          fontSize: 20,
          padding: 0,
        }}
      >
        {t("AppName")}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ color: C.white, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          {t("Navbar.KnowOurSoftware")}
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
```

`frontend_client/src/pages/HomePage.jsx` — remove `onPatient`/`onNutritionist` props, use `useNavigate`:
```jsx
import { useNavigate } from 'react-router-dom';
import { Navbar } from "../components/Navbar";
import { HomeCard } from "../components/HomeCard";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <Navbar />

      <div style={{ background: C.green, padding: "48px 32px 56px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 30,
            padding: "6px 18px",
            marginBottom: 20
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span style={{ fontSize: 12, color: "#fff", fontWeight: 600, letterSpacing: 0.5 }}>TRUSTED NUTRITION PLATFORM</span>
        </div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: C.white,
            margin: "0 0 12px",
            letterSpacing: -0.5,
            lineHeight: 1.2
          }}
        >
          {t("HomePage.Welcome")}<span style={{ fontStyle: "italic" }}>{t("AppName")}</span>
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.82)",
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.6
          }}
        >
          {t("HomePage.Description")}
        </p>
      </div>

      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 40, marginBottom: -1 }}
      >
        <path d="M0,0 C360,40 1080,0 1440,40 L1440,0 Z" fill={C.green} />
      </svg>

      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "48px 24px 64px",
          display: "flex",
          gap: 24,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <HomeCard
          title={t("HomePage.HomeCard.PatientTitle")}
          description={t("HomePage.HomeCard.PatientDescription")}
          cta={t("HomePage.HomeCard.PatientCta")}
          accent={C.green}
          onClick={() => navigate('/patient')}
          icon={(hov) => (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke={hov ? C.white : C.green} strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        />
        <HomeCard
          title={t("HomePage.HomeCard.NutritionistTitle")}
          description={t("HomePage.HomeCard.NutritionistDescription")}
          cta={t("HomePage.HomeCard.NutritionistCta")}
          accent={C.orange}
          onClick={() => navigate('/dashboard')}
          icon={(hov) => (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke={hov ? C.white : C.orange} strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )}
        />
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", paddingBottom: 32 }}>
        © {new Date().getFullYear()} {t("AppName")} · {t("HomePage.FooterNote")}
      </p>
    </div>
  );
}
```

`frontend_client/src/pages/NutritionistPage.jsx` — remove `{ onHome }` prop and update Navbar call:
- Remove `{ onHome }` from the function signature: `export function NutritionistPage() {`
- Change `<Navbar onHome={onHome} />` to `<Navbar />`

`frontend_client/src/pages/PatientPage.jsx` — remove `{ onHome }` prop and update Navbar call only (data wiring happens in Task 5):
- Remove `{ onHome }` from the function signature: `export function PatientPage() {`
- Change `<Navbar onHome={onHome} />` to `<Navbar />`

- [ ] **Step 5: Run all tests**

```bash
cd frontend_client
npm test -- --watchAll=false
```

Expected: all tests pass. If App.test.js fails with a routing error, wrap its `<App />` render in `<MemoryRouter>`.

- [ ] **Step 6: Commit**

```bash
git add frontend_client/src/index.js frontend_client/src/App.js \
  frontend_client/src/components/Navbar.jsx \
  frontend_client/src/pages/HomePage.jsx \
  frontend_client/src/pages/PatientPage.jsx \
  frontend_client/src/pages/NutritionistPage.jsx \
  frontend_client/src/pages/NutritionistPage.test.jsx \
  frontend_client/src/pages/PatientPage.test.jsx \
  frontend_client/package.json frontend_client/package-lock.json
git commit -m "feat: introduce react-router-dom with URL-based routing"
```

---

## Task 2: Add i18n keys

**Files:**
- Modify: `frontend_client/src/locales/en/translation.json`
- Modify: `frontend_client/src/locales/pt/translation.json`

**Interfaces:**
- Produces: translation keys `PatientPage.ProfessionalCard.ViewProfile`, `PatientPage.Error`, `PatientPage.Retry`, `NutritionistDetailPage.Back`, `NutritionistDetailPage.Error`, `NutritionistDetailPage.Retry`

- [ ] **Step 1: Add keys to English translation**

`frontend_client/src/locales/en/translation.json` — add the new keys into the existing structure:
```json
{
    "AppName" : "MyNutriApp",
    "Navbar": {
        "KnowOurSoftware": "Are you a nutrition professional? Get to know our software"
    },
    "HomePage" : {
        "Welcome" : "Welcome to ",
        "Description" : "Whether you're looking for expert guidance or managing your practice, choose how you'd like to continue.",
        "FooterNote" : "All rights reserved",
        "HomeCard" : {
            "PatientTitle" : "I'm a patient",
            "PatientDescription" : "Find a dietitian or nutritionist near you, check availability, and book your first appointment.",
            "PatientCta" : "Find a professional",
            "NutritionistTitle" : "I'm a nutritionist",
            "NutritionistDescription" : "Manage your agenda, review pending appointment requests, and stay on top of your clients' needs.",
            "NutritionistCta" : "Go to my dashboard"
        }
    },
    "PatientPage" : {
        "ProfessionalCard" : {
            "ScheduleAppointment" : "Schedule appointment",
            "Website" : "Website",
            "ViewProfile" : "View profile",
            "MoreAppointmentOptions" : "{{value}} and {{count}} more",
            "PriceRange" : "From {{min}}€"
        },
        "Search" : {
            "Button" : "Search",
            "Placeholder" : "Name or service",
            "LocationPlaceholder" : "Location"
        },
        "NoProfessionalsFound" : "No professionals found.",
        "Error" : "Failed to load professionals. Please try again.",
        "Retry" : "Retry"
    },
    "NutritionistDetailPage" : {
        "Back" : "Back to search",
        "Error" : "Failed to load nutritionist profile. Please try again.",
        "Retry" : "Retry"
    },
    "NutritionistPage" : {
        "RequestCard" : {
            "AnswerRequest" : "Answer request"
        },
        "RequestModal" : {
            "Accept" : "Accept",
            "Reject" : "Reject"
        },
        "AppointmentAccepted" : "Appointment accepted!",
        "AppointmentRejected" : "Appointment rejected.",
        "PendingRequests" : {
            "Title" : "Pending Requests",
            "Description" : "Accept or reject new pending requests",
            "NoPendingRequests" : "No pending requests — you're all caught up! 🎉"
        }
    },
    "SERVICETYPE" : {
        "HOMEAPPOINTMENT" : "At-Home Appointment",
        "CLINICAPPOINTMENT" : "Clinic Appointment",
        "ONLINEAPPOINTMENT" : "Online Appointment"
    }
}
```

- [ ] **Step 2: Add keys to Portuguese translation**

`frontend_client/src/locales/pt/translation.json`:
```json
{
    "AppName" : "MyNutriApp",
    "Navbar": {
        "KnowOurSoftware": "Você é um profissional da nutrição? Conheça nosso software"
    },
    "HomePage" : {
        "Welcome" : "Bem-vindos a ",
        "Description" : "Estejas a procura de orientação ou a gerir o teu trabalho, escolhe como queres continuar.",
        "FooterNote" : "Direitos reservados",
        "HomeCard" : {
            "PatientTitle" : "Sou paciente",
            "PatientDescription" : "Encontra um nutricionista perto de ti, verifica a disponibilidade e marca a tua primeira consulta.",
            "PatientCta" : "Encontra um profissional",
            "NutritionistTitle" : "Sou um nutricionista",
            "NutritionistDescription" : "Gere a tua agenda, revê pedidos pendentes e continua em cima das necessidades dos teus clientes.",
            "NutritionistCta" : "Ir para a minha página"
        }
    },
    "PatientPage" : {
        "ProfessionalCard" : {
            "ScheduleAppointment" : "Agendar consulta",
            "Website" : "Site",
            "ViewProfile" : "Ver perfil",
            "MoreAppointmentOptions_one" : "{{value}} e {{count}} outra",
            "MoreAppointmentOptions_other" : "{{value}} e {{count}} outras",
            "PriceRange" : "A partir de {{min}}€"
        },
        "Search" : {
            "Button" : "Procura",
            "Placeholder" : "Nome ou serviço",
            "LocationPlaceholder" : "Localização"
        },
        "NoProfessionalsFound" : "Não foram encontrados profissionais.",
        "Error" : "Falha ao carregar profissionais. Por favor, tente novamente.",
        "Retry" : "Tentar novamente"
    },
    "NutritionistDetailPage" : {
        "Back" : "Voltar à pesquisa",
        "Error" : "Falha ao carregar o perfil do nutricionista. Por favor, tente novamente.",
        "Retry" : "Tentar novamente"
    },
    "NutritionistPage" : {
        "RequestCard" : {
            "AnswerRequest" : "Responder solicitação"
        },
        "RequestModal" : {
            "Accept" : "Aceitar",
            "Reject" : "Rejeitar"
        },
        "AppointmentAccepted" : "Consulta aceite!",
        "AppointmentRejected" : "Consulta rejeitada.",
        "PendingRequests" : {
            "Title" : "Solicitações Pendentes",
            "Description" : "Aceitar ou rejeitar novas solicitações pendentes",
            "NoPendingRequests" : "Não há solicitações pendentes — tens tudo a dia! 🎉"
        }
    },
    "SERVICETYPE" : {
        "HOMEAPPOINTMENT" : "Consulta ao Domicílio",
        "CLINICAPPOINTMENT" : "Consulta em Clínica",
        "ONLINEAPPOINTMENT" : "Consulta Online"
    }
}
```

- [ ] **Step 3: Run tests (no test file for i18n, verify existing tests still pass)**

```bash
cd frontend_client
npm test -- --watchAll=false
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend_client/src/locales/en/translation.json \
  frontend_client/src/locales/pt/translation.json
git commit -m "feat: add i18n keys for ViewProfile, error/retry states, and detail page"
```

---

## Task 3: API layer

**Files:**
- Create: `frontend_client/src/api/client.js`
- Create: `frontend_client/src/api/nutritionists.js`
- Create: `frontend_client/src/api/nutritionists.test.js`
- Create: `frontend_client/.env.example`

**Interfaces:**
- Produces:
  - `getNutritionists({ searchBy?: string, location?: string }, signal?: AbortSignal): Promise<Nutritionist[]>`
  - `getNutritionist(id: string|number, signal?: AbortSignal): Promise<Nutritionist>`
  - Where `Nutritionist = { id: number, name: string, services: Service[] }`
  - Where `Service = { id: number, price: number, duration: number, service_type_name: string, location_name: string }`

- [ ] **Step 1: Write the failing tests**

Create `frontend_client/src/api/nutritionists.test.js`:
```js
import client from './client';
import { getNutritionists, getNutritionist } from './nutritionists';

jest.mock('./client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

beforeEach(() => jest.clearAllMocks());

describe('getNutritionists', () => {
  it('fetches /nutritionists with no params when called with empty strings', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionists({ searchBy: '', location: '' });
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: {},
      signal: undefined,
    });
  });

  it('includes searchBy in params when non-empty', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionists({ searchBy: 'Mary', location: '' });
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: { searchBy: 'Mary' },
      signal: undefined,
    });
  });

  it('includes location in params when non-empty', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionists({ searchBy: '', location: 'Porto' });
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: { location: 'Porto' },
      signal: undefined,
    });
  });

  it('includes both params when both non-empty', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionists({ searchBy: 'Mary', location: 'Porto' });
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: { searchBy: 'Mary', location: 'Porto' },
      signal: undefined,
    });
  });

  it('returns response.data', async () => {
    const mockData = [{ id: 1, name: 'Mary', services: [] }];
    client.get.mockResolvedValue({ data: mockData });
    const result = await getNutritionists({});
    expect(result).toEqual(mockData);
  });

  it('passes the signal to the request', async () => {
    client.get.mockResolvedValue({ data: [] });
    const signal = new AbortController().signal;
    await getNutritionists({ searchBy: 'Mary' }, signal);
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: { searchBy: 'Mary' },
      signal,
    });
  });
});

describe('getNutritionist', () => {
  it('fetches /nutritionists/:id', async () => {
    const mockData = { id: 1, name: 'Mary', services: [] };
    client.get.mockResolvedValue({ data: mockData });
    const result = await getNutritionist(1);
    expect(client.get).toHaveBeenCalledWith('/nutritionists/1', { signal: undefined });
    expect(result).toEqual(mockData);
  });

  it('passes the signal to the request', async () => {
    client.get.mockResolvedValue({ data: {} });
    const signal = new AbortController().signal;
    await getNutritionist(42, signal);
    expect(client.get).toHaveBeenCalledWith('/nutritionists/42', { signal });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd frontend_client
npm test -- --watchAll=false --testPathPattern=api/nutritionists
```

Expected: FAIL — `Cannot find module './nutritionists'` and `Cannot find module './client'`.

- [ ] **Step 3: Create client.js**

`frontend_client/src/api/client.js`:
```js
import axios from 'axios';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
});

export default client;
```

- [ ] **Step 4: Create nutritionists.js**

`frontend_client/src/api/nutritionists.js`:
```js
import client from './client';

export function getNutritionists({ searchBy, location } = {}, signal) {
  const params = {};
  if (searchBy) params.searchBy = searchBy;
  if (location) params.location = location;
  return client.get('/nutritionists', { params, signal }).then(r => r.data);
}

export function getNutritionist(id, signal) {
  return client.get(`/nutritionists/${id}`, { signal }).then(r => r.data);
}
```

- [ ] **Step 5: Create .env.example**

`frontend_client/.env.example`:
```
# URL of the Rails API (no trailing slash)
REACT_APP_API_URL=http://localhost:4000/api
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd frontend_client
npm test -- --watchAll=false --testPathPattern=api/nutritionists
```

Expected: all 8 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend_client/src/api/client.js \
  frontend_client/src/api/nutritionists.js \
  frontend_client/src/api/nutritionists.test.js \
  frontend_client/.env.example
git commit -m "feat: add axios API client and nutritionist API functions"
```

---

## Task 4: Data hooks

**Files:**
- Create: `frontend_client/src/hooks/useNutritionists.js`
- Create: `frontend_client/src/hooks/useNutritionists.test.js`
- Create: `frontend_client/src/hooks/useNutritionist.js`
- Create: `frontend_client/src/hooks/useNutritionist.test.js`

**Interfaces:**
- Consumes: `getNutritionists` and `getNutritionist` from `../api/nutritionists`
- Produces:
  - `useNutritionists({ searchBy: string, location: string }): { data: Nutritionist[], loading: boolean, error: Error|null, refetch: () => void }`
  - `useNutritionist(id: string|number): { data: Nutritionist|null, loading: boolean, error: Error|null, refetch: () => void }`

- [ ] **Step 1: Write failing tests for useNutritionists**

Create `frontend_client/src/hooks/useNutritionists.test.js`:
```jsx
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNutritionists } from './useNutritionists';
import * as api from '../api/nutritionists';

jest.mock('../api/nutritionists');

const mockData = [{ id: 1, name: 'Mary', services: [] }];

beforeEach(() => jest.clearAllMocks());

test('returns loading=true and empty data initially', () => {
  api.getNutritionists.mockReturnValue(new Promise(() => {}));
  const { result } = renderHook(() =>
    useNutritionists({ searchBy: '', location: '' })
  );
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toEqual([]);
  expect(result.current.error).toBeNull();
});

test('returns data after successful fetch', async () => {
  api.getNutritionists.mockResolvedValue(mockData);
  const { result } = renderHook(() =>
    useNutritionists({ searchBy: '', location: '' })
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual(mockData);
  expect(result.current.error).toBeNull();
});

test('returns error when fetch fails', async () => {
  api.getNutritionists.mockRejectedValue(new Error('Network Error'));
  const { result } = renderHook(() =>
    useNutritionists({ searchBy: '', location: '' })
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.data).toEqual([]);
});

test('refetches when refetch is called', async () => {
  api.getNutritionists.mockResolvedValue(mockData);
  const { result } = renderHook(() =>
    useNutritionists({ searchBy: '', location: '' })
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.refetch());
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(2));
});

test('refetches when search params change', async () => {
  api.getNutritionists.mockResolvedValue(mockData);
  const { result, rerender } = renderHook(
    ({ searchBy, location }) => useNutritionists({ searchBy, location }),
    { initialProps: { searchBy: '', location: '' } }
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  rerender({ searchBy: 'Mary', location: '' });
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(2));
  expect(api.getNutritionists).toHaveBeenLastCalledWith(
    { searchBy: 'Mary', location: '' },
    expect.anything()
  );
});
```

- [ ] **Step 2: Write failing tests for useNutritionist**

Create `frontend_client/src/hooks/useNutritionist.test.js`:
```jsx
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNutritionist } from './useNutritionist';
import * as api from '../api/nutritionists';

jest.mock('../api/nutritionists');

const mockData = { id: 1, name: 'Mary', services: [] };

beforeEach(() => jest.clearAllMocks());

test('returns loading=true and null data initially', () => {
  api.getNutritionist.mockReturnValue(new Promise(() => {}));
  const { result } = renderHook(() => useNutritionist(1));
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeNull();
});

test('returns data after successful fetch', async () => {
  api.getNutritionist.mockResolvedValue(mockData);
  const { result } = renderHook(() => useNutritionist(1));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual(mockData);
  expect(result.current.error).toBeNull();
});

test('returns error when fetch fails', async () => {
  api.getNutritionist.mockRejectedValue(new Error('Not Found'));
  const { result } = renderHook(() => useNutritionist(99));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.data).toBeNull();
});

test('refetches when refetch is called', async () => {
  api.getNutritionist.mockResolvedValue(mockData);
  const { result } = renderHook(() => useNutritionist(1));
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.refetch());
  await waitFor(() => expect(api.getNutritionist).toHaveBeenCalledTimes(2));
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd frontend_client
npm test -- --watchAll=false --testPathPattern=hooks/useNutritionist
```

Expected: FAIL — `Cannot find module './useNutritionists'` and `Cannot find module './useNutritionist'`.

- [ ] **Step 4: Implement useNutritionists**

Create `frontend_client/src/hooks/useNutritionists.js`:
```js
import { useState, useEffect, useCallback } from 'react';
import { getNutritionists } from '../api/nutritionists';

export function useNutritionists({ searchBy, location }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getNutritionists({ searchBy, location }, controller.signal)
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
  }, [searchBy, location, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { data, loading, error, refetch };
}
```

- [ ] **Step 5: Implement useNutritionist**

Create `frontend_client/src/hooks/useNutritionist.js`:
```js
import { useState, useEffect, useCallback } from 'react';
import { getNutritionist } from '../api/nutritionists';

export function useNutritionist(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getNutritionist(id, controller.signal)
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
  }, [id, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { data, loading, error, refetch };
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd frontend_client
npm test -- --watchAll=false --testPathPattern=hooks/useNutritionist
```

Expected: all 9 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend_client/src/hooks/useNutritionists.js \
  frontend_client/src/hooks/useNutritionists.test.js \
  frontend_client/src/hooks/useNutritionist.js \
  frontend_client/src/hooks/useNutritionist.test.js
git commit -m "feat: add useNutritionists and useNutritionist data hooks"
```

---

## Task 5: PatientPage with live data

**Files:**
- Modify: `frontend_client/src/components/SkeletonCard.jsx` (add data-testid)
- Modify: `frontend_client/src/pages/PatientPage.jsx` (full rewrite)
- Modify: `frontend_client/src/pages/PatientPage.test.jsx` (full rewrite)

**Interfaces:**
- Consumes: `useNutritionists({ searchBy, location })` from `../hooks/useNutritionists`
- Consumes i18n keys: `PatientPage.Error`, `PatientPage.Retry`, `PatientPage.NoProfessionalsFound`, `PatientPage.Search.*`

- [ ] **Step 1: Add data-testid to SkeletonCard for testability**

`frontend_client/src/components/SkeletonCard.jsx` — add `data-testid="skeleton-card"` to the outer div:
```jsx
export function SkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e8edf0",
        padding: "22px 20px",
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        flex: "1 1 220px",
        minWidth: 180,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#e8edf0",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
        <div style={{ height: 12, background: "#e8edf0", borderRadius: 6, width: "70%" }} />
        <div style={{ height: 10, background: "#f0f3f4", borderRadius: 6, width: "50%" }} />
        <div style={{ height: 10, background: "#f0f3f4", borderRadius: 6, width: "60%", marginTop: 4 }} />
        <div style={{ height: 10, background: "#f0f3f4", borderRadius: 6, width: "40%" }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write failing tests for PatientPage**

`frontend_client/src/pages/PatientPage.test.jsx` — full replacement:
```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PatientPage } from './PatientPage';
import * as api from '../api/nutritionists';

jest.mock('../api/nutritionists');
jest.mock('../components/ProfessionalCard', () => ({
  ProfessionalCard: ({ pro }) => <div data-testid="pro-card">{pro.name}</div>,
}));

const mockProfessionals = [
  { id: 1, name: 'Mary Jane', services: [] },
  { id: 2, name: 'Carlos Mendes', services: [] },
];

function renderPage() {
  render(<MemoryRouter><PatientPage /></MemoryRouter>);
}

beforeEach(() => jest.clearAllMocks());

test('shows skeleton cards while loading', () => {
  api.getNutritionists.mockReturnValue(new Promise(() => {}));
  renderPage();
  expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
  expect(screen.queryByTestId('pro-card')).not.toBeInTheDocument();
});

test('renders professionals after successful load', async () => {
  api.getNutritionists.mockResolvedValue(mockProfessionals);
  renderPage();
  await waitFor(() => expect(screen.getByText('Mary Jane')).toBeInTheDocument());
  expect(screen.getByText('Carlos Mendes')).toBeInTheDocument();
  expect(screen.queryAllByTestId('skeleton-card')).toHaveLength(0);
});

test('shows no-results message when list is empty', async () => {
  api.getNutritionists.mockResolvedValue([]);
  renderPage();
  await waitFor(() =>
    expect(screen.getByText('No professionals found.')).toBeInTheDocument()
  );
});

test('shows error message and Retry button on fetch failure', async () => {
  api.getNutritionists.mockRejectedValue(new Error('Network Error'));
  renderPage();
  await waitFor(() =>
    expect(screen.getByText('Failed to load professionals. Please try again.')).toBeInTheDocument()
  );
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});

test('Retry button triggers a new fetch', async () => {
  api.getNutritionists
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValue(mockProfessionals);
  renderPage();
  await waitFor(() => screen.getByRole('button', { name: /retry/i }));
  await userEvent.click(screen.getByRole('button', { name: /retry/i }));
  await waitFor(() => expect(screen.getByText('Mary Jane')).toBeInTheDocument());
});

test('Search button commits query and triggers refetch with searchBy param', async () => {
  api.getNutritionists.mockResolvedValue([]);
  renderPage();
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(1));
  await userEvent.type(screen.getByPlaceholderText('Name or service'), 'Mary');
  await userEvent.click(screen.getByRole('button', { name: /search/i }));
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(2));
  expect(api.getNutritionists).toHaveBeenLastCalledWith(
    { searchBy: 'Mary', location: '' },
    expect.anything()
  );
});

test('Search button commits location param', async () => {
  api.getNutritionists.mockResolvedValue([]);
  renderPage();
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(1));
  await userEvent.type(screen.getByPlaceholderText('Location'), 'Porto');
  await userEvent.click(screen.getByRole('button', { name: /search/i }));
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(2));
  expect(api.getNutritionists).toHaveBeenLastCalledWith(
    { searchBy: '', location: 'Porto' },
    expect.anything()
  );
});

test('pressing Enter in the name input commits query', async () => {
  api.getNutritionists.mockResolvedValue([]);
  renderPage();
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(1));
  await userEvent.type(screen.getByPlaceholderText('Name or service'), 'Carlos{Enter}');
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(2));
  expect(api.getNutritionists).toHaveBeenLastCalledWith(
    { searchBy: 'Carlos', location: '' },
    expect.anything()
  );
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd frontend_client
npm test -- --watchAll=false --testPathPattern=pages/PatientPage
```

Expected: FAIL — skeleton card tests fail (PatientPage still uses hardcoded data).

- [ ] **Step 4: Rewrite PatientPage to use live data**

`frontend_client/src/pages/PatientPage.jsx`:
```jsx
import { useState } from "react";
import { ProfessionalCard } from "../components/ProfessionalCard";
import { SkeletonCard } from "../components/SkeletonCard";
import { Navbar } from "../components/Navbar";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";
import { useNutritionists } from "../hooks/useNutritionists";

export function PatientPage() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [query, setQuery] = useState({ searchBy: "", location: "" });

  const { data, loading, error, refetch } = useNutritionists(query);

  function commitSearch() {
    setQuery({ searchBy: searchInput, location: locationInput });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") commitSearch();
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <Navbar />
      <div style={{ background: C.green, padding: "20px 32px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 10 }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("PatientPage.Search.Placeholder")}
            style={{
              flex: 2,
              padding: "11px 16px",
              borderRadius: 6,
              border: "none",
              fontSize: 14,
              outline: "none",
              color: "#333",
              background: C.white,
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: C.white,
              borderRadius: 6,
              padding: "0 12px",
              gap: 8,
            }}
          >
            <input
              value={locationInput}
              onChange={e => setLocationInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("PatientPage.Search.LocationPlaceholder")}
              style={{ flex: 1, border: "none", fontSize: 14, outline: "none", color: "#333" }}
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button
            onClick={commitSearch}
            style={{
              background: C.orange,
              color: C.white,
              border: "none",
              borderRadius: 6,
              padding: "11px 28px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t("PatientPage.Search.Button")}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "28px auto", padding: "0 16px" }}>
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ color: C.red, marginBottom: 12, fontSize: 15 }}>
              {t("PatientPage.Error")}
            </div>
            <button
              onClick={refetch}
              style={{
                background: C.green,
                color: C.white,
                border: "none",
                borderRadius: 6,
                padding: "9px 24px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("PatientPage.Retry")}
            </button>
          </div>
        )}
        {!loading && !error && data.length === 0 && (
          <div style={{ textAlign: "center", color: "#aaa", padding: "60px 0", fontSize: 16 }}>
            {t("PatientPage.NoProfessionalsFound")}
          </div>
        )}
        {!loading && !error && data.map(pro => (
          <ProfessionalCard key={pro.id} pro={pro} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd frontend_client
npm test -- --watchAll=false --testPathPattern=pages/PatientPage
```

Expected: all 8 tests PASS.

- [ ] **Step 6: Run full test suite**

```bash
cd frontend_client
npm test -- --watchAll=false
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add frontend_client/src/components/SkeletonCard.jsx \
  frontend_client/src/pages/PatientPage.jsx \
  frontend_client/src/pages/PatientPage.test.jsx
git commit -m "feat: wire PatientPage to live API with server-side search and loading/error states"
```

---

## Task 6: ProfessionalCard ViewProfile button

**Files:**
- Modify: `frontend_client/src/components/ProfessionalCard.jsx`

**Interfaces:**
- Consumes: `pro.id` (number) for the navigation target `/nutritionists/:id`
- Consumes i18n key: `PatientPage.ProfessionalCard.ViewProfile`

- [ ] **Step 1: Write failing test**

There is no existing test file for ProfessionalCard. Create `frontend_client/src/components/ProfessionalCard.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProfessionalCard } from './ProfessionalCard';

const pro = {
  id: 7,
  name: 'Ana Lima',
  services: [
    {
      id: 1,
      price: 30,
      duration: 45,
      service_type_name: 'SERVICETYPE.ONLINEAPPOINTMENT',
      location_name: 'Lisboa',
    },
  ],
};

function renderCard() {
  render(
    <MemoryRouter initialEntries={['/patient']}>
      <Routes>
        <Route path="/patient" element={<ProfessionalCard pro={pro} />} />
        <Route path="/nutritionists/:id" element={<div>Detail page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

test('renders nutritionist name', () => {
  renderCard();
  expect(screen.getByText('Ana Lima')).toBeInTheDocument();
});

test('View profile button navigates to /nutritionists/:id', async () => {
  renderCard();
  await userEvent.click(screen.getByRole('button', { name: /view profile/i }));
  expect(screen.getByText('Detail page')).toBeInTheDocument();
});

test('Schedule appointment button is still present', () => {
  renderCard();
  expect(screen.getByRole('button', { name: /schedule appointment/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend_client
npm test -- --watchAll=false --testPathPattern=components/ProfessionalCard
```

Expected: FAIL — `Unable to find an accessible element with the role "button" and name /view profile/i`.

- [ ] **Step 3: Update ProfessionalCard to replace the Website button**

`frontend_client/src/components/ProfessionalCard.jsx`:
```jsx
import { useNavigate } from "react-router-dom";
import { Avatar } from "../utils/Avatar";
import { TagBadge } from "../utils/TagBadge";
import { CalendarIcon } from "../utils/CalendarIcon";
import { LocationIcon } from "../utils/LocationIcon";
import { useTranslation } from "react-i18next";

export function ProfessionalCard({ pro }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const servicesLocations = [...new Set(pro.services.map(s => s.location_name))].join(", ");

  const serviceTypesSet = [...new Set(pro.services.map(s => s.service_type_name))];
  let serviceTypes = t(serviceTypesSet.sort()[0]);

  if (pro.services.length > 1)
    serviceTypes = t("PatientPage.ProfessionalCard.MoreAppointmentOptions", {
      value: serviceTypes,
      count: pro.services.length - 1,
    });

  const min = pro.services.reduce((acc, s) => (s.price < acc ? s.price : acc), Number.MAX_SAFE_INTEGER);
  const priceRange = t("PatientPage.ProfessionalCard.PriceRange", { min });

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: "1px solid #e8edf0",
      padding: "22px 28px",
      marginBottom: 16,
      display: "flex",
      alignItems: "flex-start",
      gap: 20,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <Avatar name={pro.name} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 6 }}>
          <TagBadge type={"follow-up"} label={"Follow-up"} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#2e9e82", marginBottom: 2 }}>
          {pro.name}
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>
          #{pro.id}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 0" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <LocationIcon />
              <span style={{ fontSize: 13, color: "#2e9e82", fontWeight: 600 }}>{servicesLocations}</span>
            </div>
          </div>
          <div style={{ paddingLeft: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <CalendarIcon />
              <span style={{ fontSize: 13, color: "#555" }}>{serviceTypes}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#555" }}>{priceRange}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
        <button
          style={{
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
          onMouseOver={e => e.target.style.background = "#e08a65"}
          onMouseOut={e => e.target.style.background = "#f0a080"}
        >
          {t("PatientPage.ProfessionalCard.ScheduleAppointment")}
        </button>
        <button
          onClick={() => navigate(`/nutritionists/${pro.id}`)}
          style={{
            background: "#e8f5f3",
            color: "#2e9e82",
            border: "1px solid #b2dfdb",
            borderRadius: 6,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
          onMouseOver={e => { e.target.style.background = "#d0eeea"; }}
          onMouseOut={e => { e.target.style.background = "#e8f5f3"; }}
        >
          {t("PatientPage.ProfessionalCard.ViewProfile")}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd frontend_client
npm test -- --watchAll=false --testPathPattern=components/ProfessionalCard
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Run full test suite**

```bash
cd frontend_client
npm test -- --watchAll=false
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add frontend_client/src/components/ProfessionalCard.jsx \
  frontend_client/src/components/ProfessionalCard.test.jsx
git commit -m "feat: replace Website button with View profile navigation in ProfessionalCard"
```

---

## Task 7: NutritionistDetailPage

**Files:**
- Create: `frontend_client/src/pages/NutritionistDetailPage.jsx`
- Create: `frontend_client/src/pages/NutritionistDetailPage.test.jsx`
- Modify: `frontend_client/src/App.js` (replace placeholder route with real component)

**Interfaces:**
- Consumes: `useParams` from react-router-dom to read `:id`
- Consumes: `useNutritionist(id)` from `../hooks/useNutritionist`
- Consumes i18n keys: `NutritionistDetailPage.Back`, `NutritionistDetailPage.Error`, `NutritionistDetailPage.Retry`

- [ ] **Step 1: Write failing tests**

Create `frontend_client/src/pages/NutritionistDetailPage.test.jsx`:
```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NutritionistDetailPage } from './NutritionistDetailPage';
import * as api from '../api/nutritionists';

jest.mock('../api/nutritionists');

function renderPage(id = '1') {
  render(
    <MemoryRouter initialEntries={[`/nutritionists/${id}`]}>
      <Routes>
        <Route path="/nutritionists/:id" element={<NutritionistDetailPage />} />
        <Route path="/patient" element={<div>Patient list</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => jest.clearAllMocks());

test('shows skeleton while loading', () => {
  api.getNutritionist.mockReturnValue(new Promise(() => {}));
  renderPage();
  expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
});

test('shows nutritionist name and id after load', async () => {
  api.getNutritionist.mockResolvedValue({ id: 1, name: 'Mary Jane', services: [] });
  renderPage('1');
  await waitFor(() => expect(screen.getByText('Mary Jane')).toBeInTheDocument());
  expect(screen.getByText('#1')).toBeInTheDocument();
});

test('shows error message and Retry on failure', async () => {
  api.getNutritionist.mockRejectedValue(new Error('Not Found'));
  renderPage('99');
  await waitFor(() =>
    expect(screen.getByText('Failed to load nutritionist profile. Please try again.')).toBeInTheDocument()
  );
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});

test('Retry triggers a new fetch', async () => {
  api.getNutritionist
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValue({ id: 1, name: 'Mary Jane', services: [] });
  renderPage('1');
  await waitFor(() => screen.getByRole('button', { name: /retry/i }));
  await userEvent.click(screen.getByRole('button', { name: /retry/i }));
  await waitFor(() => expect(screen.getByText('Mary Jane')).toBeInTheDocument());
});

test('Back link navigates to /patient', async () => {
  api.getNutritionist.mockResolvedValue({ id: 1, name: 'Mary Jane', services: [] });
  renderPage('1');
  await waitFor(() => screen.getByText('Back to search'));
  await userEvent.click(screen.getByText('Back to search'));
  expect(screen.getByText('Patient list')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd frontend_client
npm test -- --watchAll=false --testPathPattern=pages/NutritionistDetailPage
```

Expected: FAIL — `Cannot find module './NutritionistDetailPage'`.

- [ ] **Step 3: Implement NutritionistDetailPage**

Create `frontend_client/src/pages/NutritionistDetailPage.jsx`:
```jsx
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SkeletonCard } from "../components/SkeletonCard";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";
import { useNutritionist } from "../hooks/useNutritionist";

export function NutritionistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useNutritionist(id);

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: "28px auto", padding: "0 16px" }}>
        <button
          onClick={() => navigate('/patient')}
          style={{
            background: "none",
            border: "none",
            color: C.green,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            padding: 0,
            marginBottom: 20,
          }}
        >
          ← {t("NutritionistDetailPage.Back")}
        </button>

        {loading && <SkeletonCard />}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ color: C.red, marginBottom: 12, fontSize: 15 }}>
              {t("NutritionistDetailPage.Error")}
            </div>
            <button
              onClick={refetch}
              style={{
                background: C.green,
                color: C.white,
                border: "none",
                borderRadius: 6,
                padding: "9px 24px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("NutritionistDetailPage.Retry")}
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <div style={{
            background: C.white,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            padding: "28px 32px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.green, marginBottom: 4 }}>
              {data.name}
            </div>
            <div style={{ fontSize: 13, color: C.sub }}>
              #{data.id}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update App.js to use the real NutritionistDetailPage**

`frontend_client/src/App.js`:
```jsx
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PatientPage } from './pages/PatientPage';
import { NutritionistPage } from './pages/NutritionistPage';
import { NutritionistDetailPage } from './pages/NutritionistDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/patient" element={<PatientPage />} />
      <Route path="/dashboard" element={<NutritionistPage />} />
      <Route path="/nutritionists/:id" element={<NutritionistDetailPage />} />
    </Routes>
  );
}
```

- [ ] **Step 5: Run NutritionistDetailPage tests to verify they pass**

```bash
cd frontend_client
npm test -- --watchAll=false --testPathPattern=pages/NutritionistDetailPage
```

Expected: all 5 tests PASS.

- [ ] **Step 6: Run full test suite**

```bash
cd frontend_client
npm test -- --watchAll=false
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add frontend_client/src/pages/NutritionistDetailPage.jsx \
  frontend_client/src/pages/NutritionistDetailPage.test.jsx \
  frontend_client/src/App.js
git commit -m "feat: add NutritionistDetailPage consuming show endpoint"
```
