# 🚀 Deploying CyberShield by TerraMind to Vercel

CyberShield by TerraMind is fully pre-configured for **1-Click Deployment on Vercel** as a full-stack application (Vite React SPA + Express Serverless API + SQLite Database).

---

## ⚡ Option 1: Deploy via Vercel Dashboard (Recommended & Easiest)

1. **Go to [Vercel Dashboard](https://vercel.com/new)** and sign in with your GitHub account.
2. Under **"Import Git Repository"**, find and select:
   ```
   tabreezrehan2803-gif/TERRA-MIND-
   ```
3. In the **Configure Project** screen, Vercel will automatically detect `vercel.json`:
   - **Framework Preset**: `Other` (or `Vite`)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` *(auto-detected)*
   - **Output Directory**: `client/dist` *(auto-detected)*
   - **Node.js Version**: Select **`22.x`** in Project Settings (under *Settings* -> *General* -> *Node.js Version*).
4. Click **Deploy**! 🚀
5. Within ~45 seconds, your live production URL (e.g., `https://terra-mind.vercel.app`) will be live!

---

## 💻 Option 2: Deploy via Vercel CLI

If you have the Vercel CLI installed:

```bash
# 1. Login to your Vercel account
npx vercel login

# 2. Deploy to production
npx vercel --prod
```

When prompted:
- **Set up and deploy?** &rarr; `Y`
- **Which scope?** &rarr; Select your account
- **Link to existing project?** &rarr; `N`
- **Project name?** &rarr; `cybershield-terramind` (or press Enter)
- **Directory located?** &rarr; `./` (press Enter)
- **Want to modify settings?** &rarr; `N`

---

## 🛡️ Architecture on Vercel

```
[User Browser]
      │
      ├── Static Assets (/*) ──────────> Vercel Edge CDN (client/dist)
      │                                   • React 18 + TypeScript + Vite
      │                                   • Tailwind CSS + Glassmorphism
      │                                   • Fast Global Cached Delivery
      │
      └── API Requests (/api/*) ───────> Vercel Serverless Function (Node 22)
                                          • Express 5 Handler (api/index.js)
                                          • SQLite Database in /tmp (Auto-seeded)
                                          • Zero-Trust MFA & Risk Calculation Engine
```

---

## 🔑 Pre-Configured Demo Credentials on Live Deployment

All accounts and credentials work automatically on the deployed site:

| Role | Name | Corporate Email | Password | 2FA TOTP |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **SOC Admin** | **CISO / SOC Lead** | `admin@cybershield.corp` | `admin123` | `749281` |
| 💻 **Employee** | **Alex Chen** | `alex.dev@cybershield.corp` | `demo123` | `749281` |
| 💰 **Employee** | **David Miller** | `david.finance@cybershield.corp` | `demo123` | `749281` |
| 👔 **Employee** | **Elena Vance** | `elena.exec@cybershield.corp` | `demo123` | `749281` |
| 📊 **Employee** | **Jessica Taylor** | `jessica.acct@cybershield.corp` | `demo123` | `749281` |
| ⚙️ **Employee** | **Marcus Brody** | `marcus.devops@cybershield.corp` | `demo123` | `749281` |
| 💵 **Employee** | **Rachel Green** | `rachel.payroll@cybershield.corp` | `demo123` | `749281` |
| 👥 **Employee** | **Sarah Connor** | `sarah.hr@cybershield.corp` | `demo123` | `749281` |
