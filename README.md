# CyberShield — Adaptive Enterprise Phishing Defense & Human Risk Training Platform

> **Live Production Full-Stack Application**  
> UI/UX inspired by [Hoxhunt](https://hoxhunt.com) — Human Risk Management (HRM) with gamified reporting, explainable risk scoring, dynamic role-based template synthesis, and automated micro-remediation.

---

## 🌟 Demo Sign-In Credentials

CyberShield comes pre-configured with **1-click instant persona switching** and standard credentials:

| Persona | Role Title | Email | Demo Password | Starting State |
| :--- | :--- | :--- | :--- | :--- |
| **SOC Lead / Admin** | Director of Information Security (CISO) | `admin@cybershield.corp` | `admin123` | Full SOC & Campaign Admin Console |
| **Alex Chen** | Senior Cloud & Software Engineer (Dev) | `alex.dev@cybershield.corp` | `demo123` | Active GitHub PAT Security Drill |
| **Sarah Connor** | Senior HR Business Partner | `sarah.hr@cybershield.corp` | `demo123` | Workday Open Enrollment Drill |
| **David Miller** | Senior Financial Controller | `david.finance@cybershield.corp` | `demo123` | **Remediation Required** (Invoice BEC Drill) |
| **Rachel Green** | Payroll Operations Lead | `rachel.payroll@cybershield.corp` | `demo123` | ADP Direct Deposit Drill |
| **Elena Vance** | VP of Enterprise Operations (Exec) | `elena.exec@cybershield.corp` | `demo123` | Confidential M&A VDR Drill |

> **Pro Tip:** In the top navigation bar, click the **"Switch Persona"** pill dropdown to seamlessly jump between the Admin SOC Console and Employee Mailboxes with zero delay.

---

## 🚀 3-Minute Live Verification Procedure

Run the complete 360-degree verification in your browser:

1. **Step 1 — Admin Console**:  
   - Navigate to the **SOC Console** (`/admin`).
   - Click **"New Campaign"** &rarr; Name the campaign `Q4 Cloud Token Audit` &rarr; Target `Developer` role &rarr; Select `GitHub Security Advisory` &rarr; Click **"Launch Simulation Now"**.
   - Notice the targets delivered count and real-time event logged in the **Live SOC Telemetry Feed**.
2. **Step 2 — Employee Mailbox**:  
   - In the top bar persona switcher, switch to **Alex Chen (Developer)**.
   - Go to **Simulation Mailbox** &rarr; Open the newly delivered email `"[SECURITY ALERT] Revocation required: leaked credential detected in public commit"`.
   - Notice the **Hoxhunt-Style "🛡️ Report Suspicious Email"** button at the top.
3. **Step 3 — Simulated Link Click**:  
   - Click the simulated action button **"Revoke Compromised PAT & Re-authenticate"**.
   - The **"Teachable Moment"** modal immediately pops up explaining the red flags (lookalike domain `github-enterprise-sec.net`, manufactured urgency).
   - Live telemetry records the click: Alex's risk score increases from **22 &rarr; 48 (+26 pts)**, and his account shifts to **"Remediation Required"**.
4. **Step 4 — Automated Micro-Training**:  
   - Click **"Begin Micro-Training Now"** (or open the **Micro-Training** tab).
   - Review the 3-minute lesson & threat indicators.
   - Answer the 2 interactive quiz questions &rarr; Click **"Submit Answers & Verify"**.
   - Watch the celebratory confetti! Status changes to **"Training Passed"**, and risk score drops by **-20 pts**.
5. **Step 5 — Admin Refresh**:  
   - Switch back to **SOC Admin (CISO)**.
   - The Admin Dashboard and Live SOC Events stream reflect the cleared remediation, updated HVI, and completed training event!

*(You can also run the automated CLI test anytime via `node verify-full-flow.js`)*

---

## 🏛️ System Architecture

CyberShield is built as a complete decoupled enterprise web application:

- **Frontend**:
  - React 18 + TypeScript + Vite
  - Tailwind CSS with Hoxhunt dark cyber-aesthetic (`#070A12`, cosmic indigo `#6366F1`, resilience emerald `#10B981`)
  - Lucide Icons & Canvas Confetti for gamification celebrations
  - Responsive layout supporting SOC wide-screens, desktop webmail, and mobile viewports
- **Backend**:
  - Node.js 24 + Express 5
  - Native SQLite Engine (`node:sqlite` — zero external C++ dependencies, crash-proof, instantaneous disk persistence)
  - Full JWT authentication & authorization
  - Explainable Risk Engine & telemetry event dispatcher
- **Persistence**:
  - Relational SQLite database (`cybershield.db`) storing 10 entities with foreign keys and WAL mode.

---

## 📊 Explainable Human Vulnerability Index (HVI)

CyberShield rejects "black box" scoring. Every score movement has a transparent, explainable reason:

$$\text{Employee Risk} = \text{Baseline Role Exposure} + (26 \times \text{Clicks}) - (12 \times \text{Reports}) - (20 \times \text{Trainings Completed})$$

- **Risk Bands**:
  - `0 - 25`: Low Risk / Cyber Resilient (Emerald)
  - `26 - 50`: Medium Risk (Amber)
  - `51 - 75`: High Risk (Rose)
  - `76 - 100`: Critical Risk (Crimson)
- **Organization HVI**:
  Weighted mean of employee risk across departments.

---

## 🛠️ REST API Endpoints

### Authentication & Profiles
- `GET /api/auth/demo-users`: List all pre-configured demo personas
- `POST /api/auth/login`: Authenticate with email and password
- `POST /api/auth/switch`: Instant persona switcher
- `GET /api/auth/me`: Current user session and employee status

### Dashboard & Metrics
- `GET /api/dashboard/stats`: Org security score, HVI, active campaigns, failure rate, report rate, department matrix, and recent events feed

### Campaigns & Synthesizer
- `GET /api/campaigns`: List all campaigns with click and report rates
- `GET /api/campaigns/:id`: Campaign details and targeted employee status
- `POST /api/campaigns`: Create and dispatch new campaign
- `POST /api/campaigns/:id/launch`: Launch/resume campaign
- `POST /api/campaigns/:id/pause`: Pause campaign
- `POST /api/campaigns/:id/end`: Mark campaign as completed
- `POST /api/campaigns/templates/synthesize`: Dynamic Role-Based Phishing Template Synthesizer

### Simulations & Employee Webmail
- `GET /api/simulations/inbox`: Retrieve simulated employee inbox
- `POST /api/simulations/open`: Record email opened event
- `POST /api/simulations/click`: Record simulated link click, increase risk, shift to "Remediation Required", and auto-assign micro-training
- `POST /api/simulations/report`: Record Hoxhunt "Report Phish" action, reduce risk, award +50 XP and streak

### Training & Remediation
- `GET /api/training/modules`: List training modules with quizzes
- `GET /api/training/my-assignments`: List assigned modules for an employee
- `POST /api/training/assignments/:id/complete`: Submit quiz score, reduce risk, and clear remediation

### Events, Audit & Compliance
- `GET /api/events`: Live SOC interaction telemetry feed
- `GET /api/reports/summary`: Executive compliance report (NIST SP 800-50, ISO 27001, NIS2)
- `GET /api/reports/export-csv`: Download campaign audit CSV
- `POST /api/reports/reset-demo`: Reset database to fresh initial seeded state

---

## 🔒 Security & Privacy Controls
- All phishing simulations are **strictly non-credential harvesting**. Simulated login pages and links do not collect or store passwords, banking credentials, or personal tokens.
- All secrets are environment-isolated.
- Complete audit logging on every simulated email delivery, open, click, report, and training event.
