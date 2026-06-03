# Frontend test data (copy & paste)

Use the **Sports Booking Frontend Shell** (local `http://localhost:8090` or your OpenShift Route).

Work **top to bottom**. After each create step, copy the returned **`id`** (UUID) into the next fields.

---

## Before you start

- **Local:** `docker compose up -d` — frontend on port **8090** (shell + remotes in one image)
- **Local dev (MFE):** `cd frontend && npm install && npm run dev` — shell :5173, remotes :5174–5176
- **OpenShift:** scale all deployments to **1** replica; if DB pods were recreated, run `init.sql` in each Postgres pod:
  - `members-service/db/init.sql` → database `members`
  - `facilities-service/db/init.sql` → database `facilities`
  - `bookings-service/bookings/db/init.sql` → database `bookings`
- **Gateway health:** both checks should show green before API tests.

---

## 1. Gateway health checks

Click the buttons (no input fields):

| Button | Expected |
|--------|----------|
| Check API Gateway | `ok` |
| Check Mobile Gateway | `mobile-gateway: ok` |

---

## 2. Members endpoint tester

### Register (fills JWT automatically)

| Field | Value |
|-------|-------|
| username | `saga_tester` |
| email | `saga.tester@example.com` |
| password | `Test1234!` |
| firstName | `Saga` |
| lastName | `Tester` |

→ **POST /members/register**

### Login (alternative)

| Field | Value |
|-------|-------|
| username or email | `saga_tester` |
| password | `Test1234!` |

→ **POST /members/login**

### Protected reads

→ **GET /members/me** (uses JWT from register/login)

Optional — **member UUID** field: paste your `id` from the register response, then **GET /members/:id**.

---

## 3. Facilities endpoint tester

### Create facility

| Field | Value |
|-------|-------|
| name | `Indoor Tennis Court A` |
| type | `tennis` |
| capacity | `4` |
| location | `Building 1, Floor 2` |

→ **POST /mobile/facilities**

**Copy `id` from the response** → paste into **facility id** below.

Example response field:
```text
id: <paste-this-uuid-everywhere-below>
```

### Create slot (saga — must exist before booking)

**facility id:** *(UUID from create facility)*

| Field | Value |
|-------|-------|
| startTime | `2026-06-15T10:00:00Z` |
| endTime | `2026-06-15T11:00:00Z` |
| isAvailable | ✅ checked |

→ **POST /mobile/facilities/:id/slots**

### Verify slots

| Field | Value |
|-------|-------|
| facility id | *(same UUID)* |
| date (YYYY-MM-DD) | `2026-06-15` |

→ **GET /mobile/facilities/:id/slots**

---

## 4. Bookings endpoint tester

JWT is shared with Members (`members_jwt_token` in browser storage). Register/login first.

### Create booking (happy path — saga → `confirmed`)

Use the **same facility id and times as the slot**.

| Field | Value |
|-------|-------|
| facilityId | *(facility UUID from step 3)* |
| startTime | `2026-06-15T10:00:00Z` |
| endTime | `2026-06-15T11:00:00Z` |

→ **POST /bookings**

First response: `"status": "pending"`  
Wait 2–5 seconds → **GET /bookings** → expect `"status": "confirmed"`

### List bookings

→ **GET /bookings**

### Cancel booking (compensation)

**booking UUID:** *(copy `id` from GET /bookings)*

→ **DELETE /bookings/:id**

Expect `"status": "cancelled"`; slot should become available again.

---

## 5. Optional scenarios

### Second facility + booking

**Facility**

| name | type | capacity | location |
|------|------|----------|----------|
| `Swimming Lane 3` | `swimming` | `8` | `Aquatic Center` |

**Slot** (use new facility id)

| startTime | endTime |
|-----------|---------|
| `2026-06-16T08:00:00Z` | `2026-06-16T09:00:00Z` |

**Booking** (same facility id + same times)

| startTime | endTime |
|-----------|---------|
| `2026-06-16T08:00:00Z` | `2026-06-16T09:00:00Z` |

### Saga failure (no slot — expect `cancelled`)

Create a booking **without** creating a matching slot, or use different times:

| Field | Value |
|-------|-------|
| facilityId | *(any existing facility UUID)* |
| startTime | `2026-06-15T14:00:00Z` |
| endTime | `2026-06-15T15:00:00Z` |

→ **POST /bookings** → pending → then **GET /bookings** → expect **`cancelled`**

### Second test user

| Field | Value |
|-------|-------|
| username | `demo_user` |
| email | `demo.user@example.com` |
| password | `Test1234!` |
| firstName | `Demo` |
| lastName | `User` |

---

## Quick links (browser)

Open from the **Quick endpoint links** panel:

| Link | Purpose |
|------|---------|
| Members docs | Swagger UI |
| Bookings docs | Swagger UI |
| Mobile gateway facilities | JSON list of facilities |

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| 502 on gateway health | Pods scaled to 1? Correct frontend/api-gateway images on OpenShift? |
| 401 on bookings | Register/login first; JWT in Bookings textarea |
| 500 on register/create | Run matching `init.sql` on that database |
| Booking stays `pending` | `facilities-service` + `rabbitmq` running; slot times overlap booking |
| Empty DB after idle Sandbox | Re-run all three `init.sql` files; data is ephemeral without PVC |

---

## End-to-end checklist

1. ☐ Gateway health — both green  
2. ☐ Register member — JWT filled  
3. ☐ GET /members/me — 200  
4. ☐ Create facility — copy `id`  
5. ☐ Create slot — same date/times as booking  
6. ☐ POST booking — pending → GET bookings → **confirmed**  
7. ☐ (Optional) DELETE booking — **cancelled**
