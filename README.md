# RepoPulse

> GitHub repository intelligence for developers.

RepoPulse is a real-time developer analytics and repository intelligence platform built on top of the official GitHub REST API. It transforms raw public GitHub data into actionable maintainability metrics, byte-level language distributions, commit freshness tracking, and algorithmic project health evaluations.

---

## 🚀 Key Features

- **Real-Time Public Profile Intelligence**: Instant analysis of any public GitHub username, aggregating profile metadata, follower dynamics, and repository activity.
- **Byte-Level Language Analytics**: Accurately aggregates code byte distributions across public repositories using GitHub's language endpoints, visualizing full percentage breakdowns with official GitHub language colors.
- **RepoPulse Health Score**: A deterministic, transparent 0–100 heuristic diagnosing project maintainability, push freshness, documentation depth, and community engagement.
- **Repository Deep Dives**: Detailed per-repository inspect pages featuring fork ratios, commit recency, license validation, and open-issue diagnostics.
- **Public Activity Stream**: Chronological event feed visualizing recent pushes, pull requests, issue reviews, and repository stars.
- **Rate-Limit Conscious Engine**: In-memory LRU caching with configurable TTL and prioritized batching to prevent rate exhaustion.
- **Zero Client Secrets**: All GitHub communication is isolated to the Express backend—no access tokens or secrets are ever exposed to the client.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React SPA)                     │
│  - React 18 + TypeScript + Vite                             │
│  - Tailwind CSS (Engineering Dark Palette)                 │
│  - React Router v6 + Recharts + Lucide React                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP /api/*
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend API                      │
│  - Node.js + Express + TypeScript                           │
│  - Security: Helmet, CORS, Express-Rate-Limit, Zod          │
│  - LRU In-Memory Caching (5 min TTL)                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Octokit REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      GitHub REST API                        │
│  - GET /users/{username}                                    │
│  - GET /users/{username}/repos                              │
│  - GET /repos/{owner}/{repo}                                │
│  - GET /repos/{owner}/{repo}/languages                      │
│  - GET /users/{username}/events                             │
│  - GET /rate_limit                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** & **TypeScript**
- **Vite 6** (Fast build tool & dev proxy)
- **Tailwind CSS** (Custom dark engineering palette: `#0B0F14`, `#111820`, `#151C24`, `#202832`, `#58A6FF`)
- **React Router 6** (Client-side routing for `/`, `/u/:username`, `/u/:username/repo/:repo`)
- **Recharts** (Byte-level language distributions and donut charts)
- **Lucide React** (Consistent UI iconography)

### Backend
- **Node.js** & **TypeScript**
- **Express 4** (Lightweight REST API)
- **Octokit** (Official GitHub SDK)
- **LRU-Cache** (In-memory caching layer)
- **Zod** (Input validation & parameter sanitization)
- **Helmet** & **CORS** (HTTP security headers)
- **express-rate-limit** (Backend endpoint abuse protection)

### Testing & Quality
- **Vitest** (Unit & Integration test runner)
- **Supertest** (HTTP integration testing)
- **React Testing Library** & **jsdom** (Component testing)
- **TypeScript strict mode** (Zero `any` / `@ts-ignore` suppressions)

---

## 📊 Analytics & Health Scoring Methodology

### RepoPulse Health Score (0–100)

The **RepoPulse Health Score** is an independent diagnostic heuristic developed to evaluate open-source repository maintainability without allowing raw popularity (stars) to disproportionately overshadow project hygiene.

| Dimension | Max Points | Measurable Signals |
| :--- | :---: | :--- |
| **Activity & Freshness** | **30 pts** | • Pushed within 14 days (+30)<br>• Pushed within 30 days (+25)<br>• Pushed within 90 days (+18)<br>• Pushed within 180 days (+10)<br>• Pushed within 365 days (+5) |
| **Documentation & Discoverability** | **25 pts** | • Detailed description (&ge;15 chars) (+10)<br>• Open source license declared (+8)<br>• Topic tags configured (&ge;2 tags: +4)<br>• Project website / docs URL (+3) |
| **Stability & Setup Hygiene** | **25 pts** | • Primary programming language detected (+8)<br>• Non-empty codebase size (+7)<br>• Active status (not archived) (+10) |
| **Community Signals** | **20 pts** | • Community stars (&ge;100: +10, &ge;20: +7, &ge;5: +4)<br>• Active downstream forks (&ge;10: +6, &ge;1: +3)<br>• Open issue/watcher triage (+4) |

#### Grade Scale
- **A+ (90–100)**: Exceptional maintainability and active maintenance.
- **A (80–89)**: Strong project health and clear documentation.
- **B (65–79)**: Healthy codebase with minor maintenance opportunities.
- **C (50–64)**: Moderate cadence or missing metadata.
- **D (<50)**: Dormant, archived, or unmaintained repository.

*Note: The RepoPulse Health Score is an independent diagnostic tool and is not an official GitHub rating.*

---

## 🔌 API Endpoints

### `GET /api/health`
Returns service health and status.

### `GET /api/rate-limit`
Returns current GitHub REST API rate limit limits, remaining calls, and reset timestamp.

### `GET /api/developers/:username`
Returns the normalized developer profile, aggregated stats, language distribution, top repositories, recent activity, and overall health grade.

### `GET /api/repositories/:owner/:repo`
Returns granular repository metrics, language byte breakdown, and individual health diagnostic factors.

---

## 💻 Local Development

### Prerequisites
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abhi-byte62/gitpulse.git
   cd gitpulse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (or in `server/`):
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # Optional: Increases rate limit from 60 req/hr to 5,000 req/hr
   GITHUB_TOKEN=
   ```

4. **Run Development Mode** (Starts both backend and frontend concurrently):
   ```bash
   npm run dev
   ```

   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Testing & Verification

Run tests across all workspaces:
```bash
npm run test
```

Run TypeScript verification & type checks:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```

---

## 🚀 Deployment

### Deploying Frontend to Vercel
1. Set the root directory or framework preset to **Vite**.
2. Build command: `npm run build --workspace=client`
3. Output directory: `client/dist`
4. The included [vercel.json](file:///c:/Users/mrabh/OneDrive/Desktop/gitpulse/client/vercel.json) handles client-side route rewrites for direct navigation to `/u/:username` and `/u/:username/repo/:repo`.

### Deploying Backend
The backend can be deployed to any Node.js container or host (Render, Railway, Fly.io, AWS App Runner):
1. Build command: `npm run build --workspace=server`
2. Start command: `npm run start --workspace=server`
3. Environment variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend-domain.vercel.app`
   - `GITHUB_TOKEN=<your_github_token>`

---

## 🔒 Security & Rate Limiting

- **Zero Client Leakage**: GitHub personal access tokens are stored only on the backend and never passed to the client.
- **LRU In-Memory Cache**: Cached API responses protect GitHub rate limit quotas.
- **Abuse Prevention**: Backend endpoints are rate-limited via `express-rate-limit` (120 requests / 15 minutes per IP).
- **Zod Parameter Validation**: GitHub username format regex (`^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$`) and repository parameter constraints protect against SSRF and injection attacks.

---

## 🗺️ Future Roadmap (V2)

- [ ] GitHub OAuth & GitHub App integration for private repository analysis
- [ ] Redis distributed cache adapter for multi-instance horizontal scaling
- [ ] Historical health score trendline tracking (PostgreSQL integration)
- [ ] Side-by-side repository and developer profile comparisons
- [ ] Shareable SVG developer cards for GitHub Profile READMEs

---

## ⚖️ Disclaimer & Attribution

RepoPulse is an independent developer analytics tool and is not affiliated with, endorsed by, or owned by GitHub, Inc. GitHub and the GitHub logo are registered trademarks of GitHub, Inc. All data is queried in real time via the public GitHub REST API in accordance with GitHub's Terms of Service and API Guidelines.
