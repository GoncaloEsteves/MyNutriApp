# MyNutriApp

A platform connecting patients with nutrition professionals (nutritionists/dietitians). Patients can search for professionals, view their services, and schedule appointments. Nutritionists can manage incoming requests from their dashboard.

---

## Tech Stack

### Backend
| Technology | Version |
|------------|---------|
| Ruby | 4.0.5 |
| Rails | 8.1.3 |
| PostgreSQL | 1.1 |
| Puma | 5.0+ |
| Blueprinter | — |

### Frontend
| Technology | Version |
|------------|---------|
| React | 19.2.7 |
| Node.js | 24.18.0 |
| npm | 11.16.0 |
| Axios | 1.18.x |
| i18next | 23.x |

---

## Installation

### Prerequisites
- Ruby (see version above)
- Node.js / npm
- PostgreSQL running locally

### Backend

A database schema already exists, so starting it's quicker. Step by step:

```bash
cd backend_api
bundle install
rails db:setup # runs db:create and db:seed
rails server   # http://localhost:4000
```

Useful commands:

```bash
bin/rails db:migrate    # run pending migrations
bin/rails db:seed       # load seed data
bin/rails db:rollback   # roll back last migration
bin/rails db:reset      # drop → create → migrate → seed
```

### Frontend

In a separate console, run the frontend:

```bash
cd frontend_client
npm install
npm start          # http://localhost:3000
```

---

## Database

Credentials are configured via environment variables in `backend_api/.env`:

```env
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
```

`DB_USERNAME` defaults to `postgres` if not set. See the [Environment Variables](#environment-variables) section for setup instructions.

### Seed data

Running `db:seed` loads the following sample data:

- **4 nutritionists** — João Silva, Maria Oliveira, Carlos Santos, Ana Costa
- **3 locations** — Braga, Porto, Lisboa
- **3 service types** — Home, Clinic and Online appointments
- **6 services** across locations (€30–70 / 30–60 min)
- **15 sample appointments** scheduled for July 2026

---

## Testing

### Backend

Uses Rails' built-in **Minitest**. No additional gems required.

```bash
cd backend_api
bin/rails db:test:prepare   # create and load the test database from schema.rb
bin/rails test              # run all tests
```

To run a specific file:

```bash
bin/rails test test/models/appointment_test.rb
bin/rails test test/controllers/api/nutritionists_controller_test.rb
```

### Frontend

Uses **React Testing Library + Jest** (included with Create React App).

```bash
cd frontend_client
npm test -- --watchAll=false   # single run (CI-style)
npm test                       # interactive watch mode
```

---

## Email Setup (Gmail SMTP)

The backend uses Gmail's SMTP server to send emails (e.g. appointment notifications). Credentials are read from the `.env` file above.

### Prerequisites

1. **Enable 2-Step Verification** on your Google account at https://myaccount.google.com/security.

2. **Create an App Password** at https://myaccount.google.com/apppasswords.
   - Select app: *Mail*
   - Select device: *Other* (give it any name, e.g. "MyNutriApp")
   - Copy the generated 16-character password and set it as `GMAIL_APP_PASSWORD` in your `.env`.

---

## Environment Variables

Credentials are loaded from a `.env` file in `backend_api/`. This file is gitignored and must never be committed.

### Setup

```bash
cp backend_api/.env.example backend_api/.env
```

Then open `backend_api/.env` and fill in your values:

```env
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password

GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

The `dotenv-rails` gem loads this file automatically in development and test environments.

---

## API Endpoints

All routes are namespaced under `/api`.

### Nutritionists

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/nutritionists` | List nutritionists. Query params: `searchBy` (name/service), `location` |
| GET | `/api/nutritionists/:id` | Get nutritionist details |

### Services

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/nutritionists/:nutritionist_id/services` | List services for a nutritionist |
| GET | `/api/nutritionists/:nutritionist_id/services/:id` | Get service details |

### Appointments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/nutritionists/:nutritionist_id/appointments` | List appointments for a nutritionist |
| POST | `/api/nutritionists/:nutritionist_id/services/:service_id/appointments` | Book an appointment |
| PATCH | `/api/appointments/:id/accept` | Accept an appointment |
| PATCH | `/api/appointments/:id/reject` | Reject an appointment |

**POST body example:**
```json
{
  "appointment": {
    "patient_name": "John Doe",
    "patient_email": "john@example.com",
    "scheduled_date": "2026-07-15T10:00:00",
    "status": "pending"
  }
}
```

---

## App Flow

### Patient
1. Land on the home page → select **"I'm a patient"**
2. Search for professionals by name, service type, or location
3. Browse professional cards showing services, pricing, and duration
4. Open the request modal, pick a date/time, and submit name and email
5. Appointment is created with status `pending`

### Nutritionist
1. Land on the home page → select **"I'm a nutritionist"**
2. Dashboard shows all pending appointment requests
3. Review each request (patient info, date, service)
4. Accept or reject — a toast notification confirms the action

---

## TODOs

- [ ] Reject overlapping appointments for the same nutritionist at the same time slot
- [ ] Search by service name is broken — backend filters on service codes instead of translated names, regressed when switching to codes for i18n support
- [ ] Search by location ignores distance — only matches on location name; should rank/filter by proximity and default to "Braga" when no location is specified
