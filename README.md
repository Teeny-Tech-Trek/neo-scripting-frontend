<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,22,32&height=260&section=header&text=NeoScript&fontSize=72&fontColor=ffffff&fontAlignY=42&desc=AEO%2FGEO%20Blog%20%2B%20Social%20Generation%20%E2%80%A2%20React%20%E2%80%A2%20Vite&descAlignY=62&descSize=20&animation=fadeIn&stroke=38BDF8&strokeWidth=1" width="100%"/>

</div>

<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=800&color=38BDF8&center=true&vCenter=true&multiline=false&repeat=true&width=680&height=50&lines=React+18+%2B+Vite+TypeScript+SPA+%F0%9F%9A%80;Step+Tracker+%E2%80%A2+Markdown+Viewer+%E2%80%A2+Social+Cards+%F0%9F%93%A0;Real-Time+Pipeline+Progress+%E2%9A%A1;Prompt+%E2%86%92+Blog+%2B+LinkedIn%2FTwitter%2FReddit+Posts+%F0%9F%93%9D)](https://git.io/typing-svg)

</div>

<br/>

<div align="center">

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![React Query](https://img.shields.io/badge/React_Query-5-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 🎯 Overview

**NeoScript Frontend** is the React SPA for an AEO/GEO-optimized AI content generation engine. Users drop in a topic prompt and get a publish-ready blog (Markdown) + platform-specific social posts (LinkedIn, Twitter, Reddit) — all from a single API call.

**Stack:** React 18 + Vite + TypeScript + Tailwind + React Query. Real-time pipeline progress tracker shows which agent is running.

---

## 🏗️ Architecture

```
User Input (home page)
  ↓ GeneratorForm collects: prompt, brand_name, platforms[]
    ↓ POST /api/generate
      ↓ Backend spins up 10-agent pipeline
        ├─ Topic Generator
        ├─ Blog Pipeline (5 agents: Researcher → Planner → Writer → Optimizer → Editor)
        └─ Social Pipelines (3 agents × 3 platforms: Researcher → Platform Writer → QA)
        
Result Page
  ↓ StepTracker shows pipeline progress (visual indicator per agent)
  ↓ MarkdownViewer renders blog
  ↓ SocialPostCards display platform-specific posts
  ↓ Copy-to-clipboard buttons ready for publishing
```

---

## 🛠️ Tech Stack

| Concern | Technology |
|:---|:---|
| **Framework** | React 18 |
| **Build** | Vite 6 + TypeScript 5.5 |
| **Styling** | Tailwind CSS 3.4 |
| **HTTP** | Axios |
| **Server State** | React Query 5 |
| **Markdown** | react-markdown + remark-gfm |
| **Icons** | lucide-react |
| **Animations** | Framer Motion |
| **Deploy** | Vercel |

---

## 📁 Project Structure

```
frontend/src/
├── App.jsx                      # Route definitions (home, result)
├── main.tsx                     # React root
├── pages/
│   ├── Home.jsx               # Input form + landing
│   └── Result.jsx             # Blog + social posts display
├── components/
│   ├── GeneratorForm.jsx      # Topic input form
│   ├── StepTracker.jsx        # Pipeline progress indicator
│   ├── MarkdownViewer.jsx     # Blog markdown renderer
│   ├── SocialPostCard.jsx     # Social post card + copy button
│   └── ui/                    # Shared UI primitives
├── hooks/
│   └── useGenerate.ts         # POST /api/generate + polling
├── services/
│   └── api.ts                 # Axios instance + endpoints
├── types/
│   └── generation.ts          # API response shapes
└── lib/
    └── utils.ts               # Helpers (clipboard, markdown, etc.)
```

---

## 🚀 Getting Started

### 1. Install & Configure

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.development
```

### 2. Environment Variables

| Var | Purpose | Example |
|:---|:---|:---|
| `VITE_API_BASE_URL` | Backend URL | `http://localhost:8000` or `https://api.example.com` |

### 3. Run Locally

```bash
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # Production bundle
npm run preview      # Serve production build
```

---

## 📖 Key Pages

### Home (`/`)

**GeneratorForm component:**
- Text input for topic/prompt
- Text input for brand name (optional)
- Multi-select for platforms (LinkedIn, Twitter, Reddit)
- "Generate" button triggers `/api/generate` POST

**Marketing sections:**
- Hero with value prop
- How-it-works steps
- Feature highlights
- Testimonials / social proof
- CTA button

### Result (`/result`)

**Three sections:**
1. **Blog Section**
   - MarkdownViewer renders the blog Markdown
   - Copy button for Markdown code block
   - "Ready to publish" indicator

2. **Social Posts**
   - SocialPostCard per platform (LinkedIn, Twitter, Reddit)
   - Character count display (Twitter: max 280)
   - Copy-to-clipboard per post
   - Platform icon + branding

3. **Action Buttons**
   - Download as PDF
   - Share via social
   - Generate another

---

## 🔌 API Integration

**useGenerate hook:**
```typescript
const { blog_markdown, social_posts, isLoading, error, steps } = 
  useGenerate(prompt, brandName, platforms);
```

**Behind the scenes:**
- POST `/api/generate` with form data
- Backend returns `{ blog_markdown, social_posts: { linkedin, twitter, reddit } }`
- Frontend subscribes to progress updates (optional streaming or polling)

---

## 🎨 UI System

**Tailwind + shadcn/ui-style components:**
- Form inputs with validation feedback
- Cards with rounded borders + shadows
- Buttons with hover states
- Progress indicator (step tracker)
- Copy-to-clipboard toast notifications

**Animations:**
- Framer Motion fade-in on result page load
- Stagger animation for social post cards
- Typewriter effect on generation progress

---

## ⚠️ Known Issues & Tech Debt

- **No form validation** — inputs not validated client-side (backend validates)
- **No error recovery** — single attempt; no retry logic if generation fails
- **Limited accessibility** — ARIA labels missing on some buttons
- **No analytics** — no tracking of generations created
- **Mobile styling** — responsive but not fully optimized for small screens
- **Progress tracking** — no real-time update from backend (static steps)

---

## 🚢 Deployment

Vercel auto-deploy on `main` branch push.

```bash
git push origin main
# Vercel builds and deploys automatically
# Set VITE_API_BASE_URL in Vercel project settings
```

---

## 🎓 Common Tasks

| I want to… | Start here |
|:---|:---|
| Change form inputs | `components/GeneratorForm.jsx` + `types/generation.ts` |
| Modify blog display | `components/MarkdownViewer.jsx` + Markdown CSS |
| Add a new platform | `components/SocialPostCard.jsx` + update backend response types |
| Change API endpoint | `services/api.ts` + update POST path |
| Add progress tracking | `hooks/useGenerate.ts` + poll `/api/generation-status/:id` |
| Customize result layout | `pages/Result.jsx` |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,22,32&height=120&section=footer" width="100%"/>

**Gradient used: `12,22,32` (sky-slate)**

</div>
