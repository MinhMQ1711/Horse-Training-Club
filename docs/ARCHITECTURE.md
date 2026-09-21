# Architecture

System model of **EquiFlow / TMEC** (Thiên Mã Equestrian Club). Every diagram below is written in [Mermaid](https://mermaid.js.org/), so GitHub renders it directly in the browser.

**Contents**

1. [System context](#1-system-context)
2. [Code layers and dependency rule](#2-code-layers-and-dependency-rule)
3. [How a request travels](#3-how-a-request-travels)
4. [Authentication flows](#4-authentication-flows)
5. [Account lifecycle](#5-account-lifecycle)
6. [Access control (RBAC)](#6-access-control-rbac)
7. [Delivery roadmap](#7-delivery-roadmap)
8. [Target data model](#8-target-data-model)

---

## 1. System context

Five kinds of people use the web app. The web app talks to a REST backend built by a separate team. Until that backend exists, the same web app runs against an in-browser **mock API**, so screens can be built and demonstrated without a server.

```mermaid
flowchart LR
  subgraph USERS["Users - 5 roles"]
    HT["Head Trainer"]
    VET["Veterinarian"]
    GR["Groom / Stable Hand"]
    HO["Horse Owner"]
    CM["Club Manager"]
  end

  subgraph FE["This repository - EquiFlow web app"]
    NEXT["Next.js 16 - App Router<br/>React 19 + TypeScript<br/>CSS Modules"]
    MOCK["Mock API<br/>data kept in localStorage"]
  end

  subgraph BE["Backend - separate team"]
    API["REST API<br/>MVC: Controller / Service / Repository"]
    DB[("Relational database")]
  end

  USERS -->|"HTTPS, browser"| NEXT
  NEXT -->|"NEXT_PUBLIC_USE_MOCK = true"| MOCK
  NEXT -->|"NEXT_PUBLIC_USE_MOCK = false<br/>JSON + session cookie"| API
  API --> DB
```

Switching between the two modes is one environment variable. No page needs to change, because pages never call `fetch` directly (see [section 3](#3-how-a-request-travels)).

---

## 2. Code layers and dependency rule

Source code is split into three top-level folders. Imports may only go **downwards**, and features never import each other.

```mermaid
flowchart TB
  APP["<b>src/app</b><br/>Routing. Each page.tsx is thin<br/>and re-exports a page from features"]
  FEAT["<b>src/features/*</b><br/>One folder per business flow<br/>pages · components · api.ts · types.ts"]
  SHARED["<b>src/shared</b><br/>components (ui, form, layout) · lib · mock · types · styles"]

  APP --> FEAT
  APP --> SHARED
  FEAT --> SHARED
```

| Rule | Why |
|---|---|
| `app` → `features` → `shared`, never upwards | Keeps the dependency graph a simple tree |
| A feature never imports another feature | Two teams can work in parallel without touching each other's files |
| Something two features both need moves into `shared/` | One copy, one place to fix |
| Pages talk to `features/*/api.ts`, never to `fetch` | The mock/real switch stays in a single file |

Feature folders and who owns them. A folder is created only when its phase starts; today just `auth`, `accounts` and `dashboard` exist.

```mermaid
flowchart LR
  subgraph shared["src/shared - written first"]
    S1["components"]
    S2["lib"]
    S3["mock"]
    S4["types"]
    S5["styles"]
  end

  subgraph fe1["FE1"]
    F1["features/auth"]
    F2["features/accounts"]
    F3["features/horses"]
    F4["features/intake"]
    F5["features/master-data"]
  end

  subgraph fe2["FE2"]
    F6["features/training"]
    F7["features/health"]
  end

  subgraph both["Both"]
    F8["features/dashboard"]
  end

  subgraph later["Optional"]
    F9["features/stable"]
    F10["features/racing"]
  end

  fe1 --> shared
  fe2 --> shared
  both --> shared
  later --> shared
```

---

## 3. How a request travels

`src/shared/lib/api.ts` is the **only** place that talks to a backend. It also handles the two errors every screen must react to.

```mermaid
sequenceDiagram
  participant P as Page<br/>features/*/pages
  participant F as features/*/api.ts
  participant A as shared/lib/api.ts
  participant M as shared/mock/handlers.ts
  participant B as Backend REST

  P->>F: listAccounts()
  F->>A: api("GET", "/accounts")

  alt NEXT_PUBLIC_USE_MOCK = true
    A->>M: handleMock(method, path, body)
    M-->>A: JSON, or ApiError(status, code)
  else NEXT_PUBLIC_USE_MOCK = false
    A->>B: fetch(API_URL + path, credentials: include)
    B-->>A: JSON, or { code, message, data }
  end

  alt 401 UNAUTHENTICATED
    A-->>P: open the Session Expired modal
  else 403 FORBIDDEN
    A-->>P: redirect to /forbidden
  else success
    A-->>F: typed data
    F-->>P: rows to render
  end
```

The full list of endpoints and error codes is in [API_CONTRACT.md](API_CONTRACT.md).

---

## 4. Authentication flows

### 4.1 Sign up, email check, approval

Only a **Horse Owner** can sign up on their own. Staff accounts are created by the Club Manager. Email is always verified with a **6-digit OTP**, never a link.

```mermaid
sequenceDiagram
  actor O as Horse Owner
  participant W as Web app
  participant API as REST API
  actor M as Club Manager

  O->>W: Sign Up (name, email, password)
  W->>API: POST /auth/register
  API-->>W: status PENDING_EMAIL, OTP sent by email

  O->>W: enter the 6-digit code
  W->>API: POST /auth/verify-email
  API-->>W: status PENDING_APPROVAL + request code REQ-yymm-nnn
  W-->>O: "Waiting for approval" page

  M->>W: Accounts - Pending tab
  W->>API: POST /accounts/{id}/approve
  API-->>W: status ACTIVE

  O->>W: Log in
  W->>API: POST /auth/login
  API-->>W: user + session cookie
  W-->>O: Dashboard for the role
```

### 4.2 Forgot password

The first step always answers the same way, whether or not the email exists, so nobody can probe which emails have accounts.

```mermaid
sequenceDiagram
  actor U as User
  participant W as Web app
  participant API as REST API

  U->>W: enter email
  W->>API: POST /auth/forgot-password
  API-->>W: sent: true (always the same answer)

  U->>W: enter the 6-digit code
  W->>API: POST /auth/reset-password/verify
  API-->>W: resetToken (valid 10 minutes)

  U->>W: choose a new password
  W->>API: POST /auth/reset-password
  API-->>W: ok
  W-->>U: back to Log in
```

### 4.3 Limits enforced by the backend

| Rule | Value |
|---|---|
| OTP length / lifetime | 6 digits / 10 minutes |
| Resend cooldown | 60 seconds |
| Wrong OTP attempts | 5, then locked out (`429 OTP_ATTEMPTS_EXCEEDED`) |
| Wrong password attempts | 5, then the email is blocked for 15 minutes (`429 ATTEMPTS_EXCEEDED`); the account status does not change |
| Password change reminder | every 180 days |

---

## 5. Account lifecycle

An account is always in exactly one status. Solid arrows exist in the code today; the dashed ones are planned.

```mermaid
stateDiagram-v2
  [*] --> PENDING_EMAIL: Horse Owner signs up
  PENDING_EMAIL --> PENDING_APPROVAL: OTP verified
  PENDING_APPROVAL --> ACTIVE: Club Manager approves
  PENDING_APPROVAL --> REJECTED: Club Manager declines

  [*] --> INVITED: Club Manager invites staff
  INVITED --> ACTIVE: staff accepts invite (planned)

  ACTIVE --> LOCKED: Club Manager locks
  LOCKED --> ACTIVE: Club Manager unlocks
  ACTIVE --> INACTIVE: deactivated (planned)

  PENDING_APPROVAL --> PENDING_INTAKE: approved, no horse yet (planned)
  PENDING_INTAKE --> ACTIVE: first horse attached (planned)
```

What each status does at login:

| Status | Can log in | Message shown | API code |
|---|:-:|---|---|
| `ACTIVE` | yes | Dashboard | - |
| `PENDING_EMAIL` | no | Email not verified | `403 EMAIL_NOT_VERIFIED` |
| `PENDING_APPROVAL` | no | Waiting for Club Manager | `403 ACCOUNT_PENDING` |
| `PENDING_INTAKE` | no | Waiting for horse intake | `403 PENDING_INTAKE` |
| `INVITED` | no | Invitation not accepted yet | `403 ACCOUNT_INVITED` |
| `INACTIVE` | no | Account deactivated | `403 ACCOUNT_INACTIVE` |
| `REJECTED` | no | Request declined | `403 ACCOUNT_REJECTED` |
| `LOCKED` | no | Account locked | `423 ACCOUNT_LOCKED` |

Guard rails: a Club Manager cannot lock themselves, and the last active Club Manager cannot be locked.

---

## 6. Access control (RBAC)

A single file, `src/shared/lib/permissions.ts`, decides who may do what. Three layers read from it, so a rule is changed in one place.

```mermaid
flowchart LR
  PERM["<b>shared/lib/permissions.ts</b><br/>single source of truth"]

  PERM --> NAV["Sidebar<br/>hides menu items the account may not use"]
  PERM --> GUARD["RoleGuard<br/>blocks the route and shows 403"]
  PERM --> HINT["DisabledHint<br/>button stays visible, disabled,<br/>with a tooltip explaining why"]

  BE["Backend<br/>checks the permission on every endpoint"]
  PERM -.->|"same rules must be repeated"| BE
```

> The UI layers only help the user. **Security is the backend's job**: every endpoint must check the permission again, because a request can be sent without the UI.

### Default permissions per role

| Permission | Head Trainer | Veterinarian | Groom | Horse Owner | Club Manager |
|---|:-:|:-:|:-:|:-:|:-:|
| View horse profiles | ✅ | ✅ | ✅ | ✅ (own horses) | ✅ |
| Create / edit horse profile | ✅ | | | | ✅ |
| Delete / deactivate horse | | | | | ✅ |
| Create / edit training plans | ✅ | | | | |
| Assign daily schedule | ✅ | | | | |
| Record session metrics | ✅ | | | | |
| Acknowledge threshold alerts | ✅ | | | | |
| View medical records | ✅ (read-only) | ✅ | | | ✅ |
| Place a training lock | | ✅ | | | |
| Lift a training lock | | ✅ | | | |
| Manage accounts and permissions | | | | | ✅ |
| View the audit log | | | | | ✅ |

Some switches cannot be changed on purpose: viewing horses is granted to everyone, only a Veterinarian can place or lift a lock, and the Club Manager always keeps account management so they cannot lock themselves out.

### Sidebar per role

| Role | Menu groups |
|---|---|
| Head Trainer | Workspace · Training · Monitoring · Racing · Reports |
| Veterinarian | Workspace · Medical · Reports |
| Groom | Workspace · Daily · Supplies |
| Horse Owner | Workspace · Monitoring · Reports |
| Club Manager | Workspace · Administration · Master Data · Reports |

---

## 7. Delivery roadmap

Work follows the priority order below. `P1` to `P5` are required by the course, `P6` and `P7` are optional.

```mermaid
flowchart LR
  P1["P1<br/>Auth and RBAC"]:::done
  P2["P2<br/>Horses, Intake,<br/>Master data"]:::todo
  P3["P3<br/>Training plans<br/>+ 2 exception paths"]:::todo
  P4["P4<br/>Health and injuries"]:::todo
  P5["P5<br/>Dashboards<br/>and reports"]:::todo
  P6["P6<br/>Stable and nutrition"]:::opt
  P7["P7<br/>Racing"]:::opt

  P1 --> P2 --> P3 --> P4 --> P5
  P5 --> P6
  P5 --> P7

  classDef done fill:#dce8d5,stroke:#315d45,color:#193b2a
  classDef todo fill:#f8f9f6,stroke:#cdd5c8,color:#273c30
  classDef opt fill:#ffffff,stroke:#cdd5c8,color:#6a776d,stroke-dasharray: 4 3
```

| Phase | Scope | Owner | Status |
|---|---|---|---|
| P1 | Sign up, OTP, forgot password, app shell, RBAC, accounts, permissions, 403, session expired, profile | FE1 | Done (16 routes) |
| P2 | Horse profiles, intake, staff / supplies / stall master data | FE1 | Not started |
| P3 | Training plans, calendar, live monitor, threshold alerts | FE2 | Not started |
| P4 | Herd health, medical records, injury map, **Training Lock** | FE2 | Not started |
| P5 | Trainer / Manager dashboards, Owner report, audit log | FE1 + FE2 | Not started |
| P6 | Stall map, rations, daily tasks, incidents (optional) | - | Not started |
| P7 | Race entry and results (optional) | - | Not started |

The **Training Lock** connects two features: a Veterinarian places it in `health`, and `training` then blocks new sessions for that horse and shows a lock banner.

```mermaid
flowchart LR
  V["Veterinarian<br/>places lock<br/>(features/health)"] -->|"training_lock<br/>is_active = true"| T["Head Trainer screens<br/>(features/training)"]
  T --> B["Lock banner shown<br/>Add-session button disabled<br/>plan becomes SUSPENDED"]
```

---

## 8. Target data model

Conceptual model taken from the team's SRS (Part 1). Column-level detail comes with the database design; the backend team owns the final schema. **25 entities**, grouped by flow.

```mermaid
erDiagram
  users ||--o{ user_roles : has
  roles ||--o{ user_roles : has
  users ||--o{ horses : owns
  users ||--o{ staff : "linked account"
  horses ||--o| pedigree : "has (3 generations)"
  horses ||--o{ achievements : has
  horses }o--o| stalls : "housed in"

  horses ||--o{ training_plans : "trained under"
  training_plans ||--o{ training_sessions : contains
  training_sessions ||--o{ performance_metrics : records
  performance_metrics ||--o{ alerts : triggers
  horses ||--o{ training_lock : "locked by vet"
  staff ||--o{ training_sessions : "assigned to"

  horses ||--o{ health_records : has
  health_records ||--o{ diagnoses : has
  health_records ||--o{ treatments : has
  health_records ||--o{ injury_markers : has
  supplies_catalog ||--o{ treatments : "used in"
  horses ||--o{ next_appointments : has

  horses ||--o{ feeding_schedules : has
  horses ||--o{ care_tasks : has
  staff ||--o{ care_tasks : performs
  horses ||--o{ incident_reports : "reported for"
  supplies_catalog ||--o{ supply_requests : "requested for"

  races ||--o{ race_registrations : has
  horses ||--o{ race_registrations : "registered in"
  race_registrations ||--o| race_results : produces
  race_results ||--o| achievements : "syncs to"

  users ||--o{ audit_logs : performs
  users ||--o{ cost_records : records
```

| Flow | Entities |
|---|---|
| 1 Auth and RBAC | `users`, `roles`, `user_roles` |
| 2 Horse profiles | `horses`, `pedigree`, `achievements`, `staff`, `supplies_catalog`, `stalls` |
| 3 Training | `training_plans`, `training_sessions`, `performance_metrics`, `training_lock`, `alerts` |
| 4 Health | `health_records`, `diagnoses`, `treatments`, `injury_markers`, `next_appointments` |
| 5 Dashboards | `audit_logs`, `cost_records` |
| 6 Stable | `feeding_schedules`, `care_tasks`, `incident_reports`, `supply_requests` |
| 7 Racing | `races`, `race_registrations`, `race_results` |

Status values that must match between web app and backend:

| Column | Values |
|---|---|
| `horses.health_status` | `FIT` · `UNDER_OBSERVATION` · `INJURED` · `QUARANTINED` |
| `training_plans.status` | `DRAFT` · `ACTIVE` · `PAUSED` · `COMPLETED` · `SUSPENDED` |
| `training_lock.scope` | `FULL` · `HIGH_INTENSITY_ONLY` |

A horse never has a "locked" status. It has a `health_status`, and whether it is locked is a separate `training_lock` record.

### Open point to align with the backend

The web app's account status has **8 values** (see [section 5](#5-account-lifecycle)), while the SRS lists only `PENDING`, `ACTIVE` and `LOCKED` for `users.account_status`. The extra values (`PENDING_EMAIL`, `PENDING_APPROVAL`, `PENDING_INTAKE`, `INVITED`, `INACTIVE`, `REJECTED`) come from the approved designs. Both sides must settle on one list before integration.
