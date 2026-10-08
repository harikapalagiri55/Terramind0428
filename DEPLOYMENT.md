# 🚀 Deploying CyberShield by TerraMind to Vercel

CyberShield by TerraMind is now packaged as a **Unified Single-Website Architecture** (React 18 + Vite + TypeScript + Embedded SOC & Risk Engine).

Client and backend are merged into **one website** that runs 100% self-contained on Vercel with zero serverless cold starts, zero SQLite file-system errors, and zero API downtime.

---

## ⚡ Option 1: Deploy via Vercel Dashboard (Recommended & Easiest)

1. **Go to [Vercel Dashboard](https://vercel.com/new)** and sign in with your GitHub account.
2. Under **"Import Git Repository"**, find and select:
   ```
   tabreezrehan2803-gif/TERRA-MIND-
   ```
3. In the **Configure Project** screen, Vercel will automatically detect `vercel.json`:
   - **Framework Preset**: `Vite` or `Other`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` *(auto-detected)*
   - **Output Directory**: `dist` *(auto-detected)*
4. Click **Deploy**! 🚀
5. Within ~30 seconds, your live production website will be live!

### 🔄 If your project is ALREADY in Vercel:
1. Open your project on **[vercel.com/dashboard](https://vercel.com/dashboard)**.
2. Go to the **Deployments** tab.
3. If auto-deploy is enabled, the latest commit `066c198` (*feat: unify client and backend into single self-contained website*) is already deploying or ready.
4. If not automatically started, click the **"..."** (three dots) on the latest deployment and click **"Redeploy"** (make sure to uncheck "Use existing Build Cache" if you want a clean rebuild).

---

## 💻 Option 2: Deploy via GitHub Push

Any push to the `main` branch of either connected repository automatically redeploys:
- **`https://github.com/tabreezrehan2803-gif/TERRA-MIND-.git`**
- **`https://github.com/harikapalagiri55/Terramind0428.git`**

---

## 🛡️ Architecture on Vercel

```
[User Browser]
      │
      └── Unified Web Application (dist/) ──────────> Vercel Edge Global CDN
            • React 18 + TypeScript + Vite + Tailwind CSS
            • Embedded Adaptive Human Risk Engine & SOC Telemetry
            • Hoxhunt Threat Interceptor Reporting Engine
            • 8 Pre-configured Interactive Demo Personas
            • 2FA Authenticator (TOTP 749281) & FIDO2 Passkeys
            • Automated Remediation & 3-Minute Micro-Training Quizzes
            • LocalStorage Persistent State (survives page refreshes)
```

---

## 🔑 Pre-Configured Demo Credentials on Live Deployment

All demo personas work out of the box on the deployed website:

| Role | Name | Corporate Email | Password | 2FA TOTP | Direct Launch |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🛡️ **SOC Admin** | **CISO / Head of SOC** | `admin@cybershield.corp` | `admin123` | `749281` | 1-Click Ready |
| 💻 **Employee** | **Alex Chen** | `alex.dev@cybershield.corp` | `demo123` | `749281` | 1-Click Ready |
| 💰 **Employee** | **David Miller** | `david.finance@cybershield.corp` | `demo123` | `749281` | 1-Click Ready |
| 👔 **Employee** | **Elena Vance** | `elena.exec@cybershield.corp` | `demo123` | `749281` | 1-Click Ready |
| 📊 **Employee** | **Jessica Taylor** | `jessica.acct@cybershield.corp` | `demo123` | `749281` | 1-Click Ready |
| ⚙️ **Employee** | **Marcus Vance** | `marcus.ops@cybershield.corp` | `demo123` | `749281` | 1-Click Ready |
| 👥 **Employee** | **Sarah Jenkins** | `sarah.hr@cybershield.corp` | `demo123` | `749281` | 1-Click Ready |
| 💼 **Employee** | **Tom Wilson** | `tom.sales@cybershield.corp` | `demo123` | `749281` | 1-Click Ready |
