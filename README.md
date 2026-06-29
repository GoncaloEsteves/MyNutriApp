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

Default credentials (configured in `config/database.yml`):

```
username: postgres
password: Passw0rd
```

Please change them if needed.

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

- [ ] Prevent duplicate bookings — delete any existing appointment for the same patient before creating a new one
- [ ] Reject overlapping appointments for the same nutritionist at the same time slot
- [ ] Send confirmation email to patient when appointment is accepted
- [ ] Send rejection email to patient when appointment is rejected
- [ ] Connect frontend to backend API (currently using placeholder/mock data)
- [ ] Enable CORS in the backend to allow frontend requests
- [ ] Implement the `services/` API layer in the frontend (`frontend_client/src/services/` is empty)
