# CLAUDE.md

## 🎯 Project: Local Disability Support Client Management System

### Overview
This is a desktop application for internal staff to manage clients using disability welfare services. It is built using **Ruby on Rails**, **React**, and **Electron**, and runs fully **offline** on local machines.

The system is structured to follow the entire care lifecycle:
1. **Intake / Enrollment**
2. **Support Planning**
3. **Service Delivery**
4. **Assessment / Monitoring**
5. **Discharge / Exit**

---

## 🛠 Tech Stack

| Layer            | Technology        |
|------------------|-------------------|
| Backend          | Ruby on Rails (API-only) |
| Frontend         | React + TypeScript |
| Desktop Shell    | Electron          |
| Database         | SQLite3 (Local)   |
| Styling          | Tailwind CSS or MUI |
| Packaging        | Electron Builder  |

---

## 📦 Features

### Core Entities
- Clients (Service Users)
- Support Plans
- Service Logs
- Staff
- Assessments
- Emergency Contacts
- Billing Info (optional)

### Functional Requirements
- Client intake and data entry
- Creation and review of support plans
- Daily/weekly service logs by staff
- Assessment tracking and summaries
- Secure staff login (local session-based)
- Search, filter, and export (CSV)
- Print-friendly monthly report generation

---

## 🔄 Care Lifecycle UI Structure

### Step 1: Client Intake
- [ ] New Client Registration Form
- [ ] Disability details and insurance info
- [ ] Emergency contacts

### Step 2: Support Planning
- [ ] Plan goals
- [ ] Duration and start date
- [ ] Responsible staff assignment
- [ ] Status: Pending / Active / Completed

### Step 3: Daily Support Logging
- [ ] Service log entry form
- [ ] Time, summary, next action
- [ ] Tag service type (e.g., Physical, Domestic)

### Step 4: Monitoring and Evaluation
- [ ] Periodic assessments
- [ ] Summary and score
- [ ] Staff comments and sign-off

### Step 5: Exit Process
- [ ] Discharge reason and date
- [ ] Final report
- [ ] Archive functionality

---

## 🔐 Security & Privacy
- Local-only DB access (no network calls)
- Encrypted SQLite database (with password)
- Session-based login for staff
- Role-based access: Admin / Staff

---

## 🚀 Packaging & Deployment
- Use `electron-builder` to package the full app for Windows/macOS/Linux
- SQLite DB stored in user data directory (`app.getPath('userData')`)
- Settings and preferences stored locally

---

## 📁 File Structure (Example)
```bash
my-care_track/
├── backend/ (Rails API)
├── frontend/ (React UI)
├── electron/ (main.ts, preload.ts)
├── public/
├── package.json
└── CLAUDE.md
```

---

## ✅ Future Enhancements
- QR code-based client lookup
- PDF export for care summaries
- Calendar view for service schedule
- Local backup & restore

---

## 📎 Notes for Claude
- The system is strictly offline-first.
- Prioritize accessibility and simple UI components.
- Data fields and workflow must reflect care work reality in Japan.
- Use Japanese for UI labels, e.g., 「支援計画」「サービス提供記録」「評価・アセスメント」

---

## 📌 Keywords
`Disability`, `Client Management`, `Care Support`, `Electron`, `Offline`, `React`, `Rails`, `Japanese Welfare System`
