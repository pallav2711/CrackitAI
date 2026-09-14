# CrackIt AI — Full Rebuild Plan (v2)
**From free tool to paid product: subscriptions, voice interviews, leaderboard — A to Z**

---

## 0. Vision & Positioning

**One-line positioning:** *"The AI that actually interviews you out loud — and shows you where you rank."*

Not a resume tool with interview practice bolted on. A **voice interview product** with resume scanning as the free entry point and a **leaderboard** as the retention/virality engine. Every decision below — UI, pricing, feature cuts — serves this sentence. If a feature doesn't make the voice interview or the leaderboard better, it doesn't get built in this phase.

**Who this is for:** final-year students and early job-seekers (India-first), prepping for placement season / tech interviews.

---

## 1. Product Scope

### 1.1 Keep & Upgrade
| Feature | Current state | Rebuild to |
|---|---|---|
| Resume Scanner | Regex/keyword scoring, marketed as "AI" but isn't | One real LLM call → structured JSON score + strengths + gaps |
| Mock Interview | Text-based, real OpenAI calls with rule-based fallback | **Voice**, via OpenAI Realtime API (gpt-realtime-mini) |
| Post-interview Report | Rule-based scoring (keyword/length/quality) — actually decent | Keep the scoring logic, feed it from voice transcripts instead of typed text |
| Auth / User model / DB core | Solid — JWT, bcrypt, helmet, CORS | Keep as-is, extend schema (see §6) |

### 1.2 Cut from navigation (do not delete code — just hide)
- **AI Mentor** — templated, not real AI, no clear user demand
- **Company Prep plans** — templated content, dilutes positioning, high maintenance for low differentiation

### 1.3 New in this rebuild
- **Voice Mock Interview** — the flagship paid feature
- **Leaderboard** — competitive ranking system (this doc's new addition)
- **Progress Dashboard** — score trend + streak, ties into leaderboard
- **Subscription & Billing** — currently doesn't exist at all; full build

---

## 2. Information Architecture (Sitemap)

```
/                       → Landing page (one CTA: "Start a free voice interview")
/signup, /login
/dashboard              → Progress overview + streak + leaderboard rank snippet
/resume-scanner         → Free tool, upload + instant score
/interview/setup        → Choose role/company/difficulty before starting
/interview/session      → Live voice interview screen
/interview/report/:id   → Score + transcript + feedback
/leaderboard            → Full leaderboard (global / role / college filters)
/billing                → Current plan, usage this cycle, upgrade/cancel
/settings               → Profile, leaderboard opt-out, notification prefs
```

---

## 3. UI/UX Design System

**Why this matters:** the current template-dashboard look (sidebar + gradient cards) reads as "hackathon project." Paying users need it to read as "trustworthy tool."

### 3.1 Visual identity
- **One accent color** tied to "confidence/readiness" — a deep green or blue, not the generic purple-AI-gradient every competitor uses.
- Mostly neutral grays, high contrast, one consistent icon set (no mixed icon packs).
- Minimal, calm — especially during the interview itself. Silence and whitespace read as premium.

### 3.2 Key screens
- **Landing page:** one hero action, no features grid. A short looping clip of the actual voice interview UI, above the fold — show, don't list.
- **Interview session screen:** a waveform/orb that animates while the AI speaks/listens, a subtle timer, a mute button. Nothing else. This is the "wow" moment — don't clutter it.
- **Report screen:** score front and center, then transcript with inline highlights (green = strong answer, amber = weak), not walls of text.
- **Leaderboard screen:** see §4.5.
- **Mobile-first:** most first-time users will try this on a phone. The interview screen must work one-handed on mobile — big mic button, no tiny tap targets.
- **Trust cues near payment:** a small "how your score is calculated" link near every report and near checkout. Once you're charging money, unexplained AI scoring becomes a refund/trust problem.

---

## 4. Feature Specs

### 4.1 Resume Scanner (free tier hook)
- Upload PDF/DOCX → extract text (keep existing `pdf-parse`/`mammoth` logic) → **one LLM call** → structured JSON: `{ overallScore, sections: {...}, strengths: [], gaps: [], suggestedFixes: [] }`.
- Unlimited on free tier — this is the funnel, not the product.
- Result screen ends with a CTA: "Now see how you'd actually perform live → Start a free voice interview."

### 4.2 Voice Mock Interview (paid core product)
- **Setup step:** user picks role (SDE/Product/Core-branch/etc.), target company type, difficulty, duration (5/10/15 min based on plan).
- **Session:** WebRTC connection to OpenAI Realtime (gpt-realtime-mini). System prompt sets interviewer persona + role context. Server enforces a hard session-length cap regardless of plan (cost control).
- **On end:** transcript is captured, sent through the scoring pipeline (existing rule-based logic, or one more LLM call), report generated (can be async — doesn't need to feel instant).
- **Fallback:** keep a text-mode option for low-bandwidth users or mic-permission failures — same backend, different input method.

### 4.3 Report
- Score (0–100), strengths, gaps, missing keywords, and — new — **points awarded toward leaderboard** based on score and difficulty.
- Share button: generates a shareable score card (image) for LinkedIn/Instagram — this is your organic growth loop, make it good-looking.

### 4.4 Progress Dashboard
- Score trend over time (simple line chart).
- Current streak (consecutive days/weeks with at least one interview).
- Snapshot of leaderboard rank with a "view full leaderboard" link.

### 4.5 Leaderboard (new)
**Purpose:** competitive pressure drives repeat usage — this is your retention engine, not a vanity feature.

**Scoring/points model:**
- Points earned per completed interview = f(score, difficulty). Higher difficulty and higher score = more points. A single low-effort interview shouldn't out-rank a genuinely strong one.
- **Anti-gaming controls (important):**
  - Points only count from interviews that meet a minimum duration/answer-length threshold (prevents spam-clicking through a session for points).
  - Daily point cap per user, so grinding low-quality repeated interviews can't out-rank quality.
  - Only voice interviews count toward leaderboard points, not resume scans (keeps the leaderboard tied to the flagship feature).

**Scope/filters:**
- **Global** leaderboard (all users).
- **College** leaderboard (user's college from profile — this is where it gets genuinely competitive and shareable within a campus).
- **Role-based** leaderboard (SDE / Product / etc.).
- **Weekly** leaderboard that resets — gives new/lower-ranked users a reason to keep coming back instead of a permanently-out-of-reach all-time list.

**Privacy (do this correctly from day one):**
- Display name / username on the leaderboard, **never email**.
- Leaderboard participation is **opt-in by default off, or clearly disclosed at signup** — some users won't want to be publicly ranked. Add an opt-out toggle in Settings.
- No public display of resume content or interview transcripts — only score/rank.

**UI:** rank, name/avatar, points, weekly movement indicator (↑↓), and a highlighted "you are here" row that auto-scrolls into view. Top 3 get a visual treatment (badge/color) — small competitive dopamine hit matters here.

---

## 5. Subscription & Pricing

| Plan | Price | Voice interviews | Resume scans | Extras |
|---|---|---|---|---|
| **Free** | ₹0 | 1 (capped ~7 min) | Unlimited | Leaderboard view-only, capped points |
| **Basic** | ₹299/mo | 5/mo | Unlimited + history | Full leaderboard participation |
| **Pro** | ₹599/mo | 15/mo | Unlimited + history | Role-specific modes, priority processing |
| **Annual** | ~30% off monthly equivalent | Same as Basic/Pro | — | Upfront cash, nudge users here |

- Every tier is **hard-capped server-side by count**, not "unlimited" anything, until real usage data shows actual margins.
- Leaderboard participation itself can be a soft upsell lever: free users see the leaderboard but their points are capped low, creating a natural reason to upgrade.

---

## 6. Database Schema Changes

**User model — add:**
```
subscription: {
  plan, status,                          // existing
  razorpayOrderId, razorpayPaymentId,    // new
  autoRenew, currentPeriodEnd            // new
}
usage: {
  interviewsUsedThisCycle, resetDate     // new — for hard-cap enforcement
}
leaderboard: {
  optIn: Boolean (default false),        // new — privacy-first default
  displayName, college, totalPoints, weeklyPoints
}
```

**New: `InterviewSession` — add fields:**
```
mode: 'voice' | 'text'
durationSeconds
audioCostEstimate      // for your own margin tracking
pointsAwarded
```

**New: `LeaderboardSnapshot` (optional, for weekly reset history)**
```
weekStart, weekEnd, userId, pointsThatWeek, rank
```

---

## 7. API Endpoints (new/changed)

```
POST   /api/billing/create-order         → Razorpay order creation
POST   /api/billing/verify                → webhook: verify signature, update subscription
GET    /api/billing/status                → current plan, usage, renewal date
POST   /api/billing/cancel

POST   /api/interview/voice/start         → creates session, returns Realtime connection token
POST   /api/interview/voice/end           → submit transcript, trigger scoring
GET    /api/interview/report/:id

GET    /api/leaderboard?scope=global|college|role&period=weekly|alltime
POST   /api/leaderboard/opt-in
POST   /api/leaderboard/opt-out

POST   /api/resume-scanner/analyze        → replace regex pipeline with LLM call
```

---

## 8. AI / Voice Architecture

1. Frontend requests a short-lived session token from your backend (`/api/interview/voice/start`) — **never expose the OpenAI key to the client directly.**
2. Frontend opens a WebRTC connection to OpenAI Realtime using that token, model = `gpt-realtime-mini` (cost-efficient, production-ready — the flagship model is ~3x the cost for a use case that doesn't need it).
3. System prompt sets interviewer persona, role, company type, and difficulty selected at setup.
4. Backend enforces a **hard session cap** (e.g., 10 min max) server-side, independent of what the frontend requests — this is your cost ceiling.
5. On session end, transcript is pulled and passed to the scoring pipeline (existing logic + one LLM call for qualitative feedback).
6. Every session's token/minute usage is logged against the user for margin tracking (see §9).

**Cost reference (for planning, not a guarantee — OpenAI pricing can change):** gpt-realtime-mini runs roughly ₹1.5–2/minute of conversation. A 10-minute interview costs roughly ₹15–20 in API spend — comfortably inside a ₹299+/mo plan even at several interviews a month.

---

## 9. Payment Integration (build from scratch)

1. Frontend: "Upgrade" → calls `/api/billing/create-order` → Razorpay checkout opens.
2. User pays → Razorpay sends a **webhook** to your backend.
3. Backend **verifies the webhook signature server-side** (never trust a frontend redirect alone as proof of payment).
4. On verified payment: update `user.subscription.plan`, `status`, `currentPeriodEnd`.
5. Cron/on-request check: if `currentPeriodEnd` has passed and no renewal, auto-downgrade to free.
6. Billing page: current plan, usage this cycle, upgrade/downgrade, cancel — all reading from this same source of truth.

---

## 10. Security & Cost Controls (do first, before any new feature work)

- [ ] **Rotate the exposed MongoDB and OpenAI credentials immediately** — found committed in `server/.env.example`. Scrub the file to placeholder values only, going forward.
- [ ] Per-user daily/monthly cap on all AI-calling routes, enforced in middleware — not just a plan-label check.
- [ ] Log every AI call's cost (tokens/minutes) per user, so real margin per plan is known, not guessed.
- [ ] Sentry (free tier) for error monitoring — critical once voice interviews are the paid feature; you need to know immediately if sessions start failing.
- [ ] Webhook signature verification on all Razorpay callbacks.
- [ ] Rate-limit leaderboard-affecting endpoints separately, to prevent point-farming abuse.

---

## 11. Tech Stack (confirmed, no change needed)

- **Frontend:** React + Vite + Tailwind (existing)
- **Backend:** Express + Mongoose (existing)
- **DB:** MongoDB Atlas (existing)
- **AI:** OpenAI (`gpt-realtime-mini` for voice, a cheap chat model for resume scanning/report generation)
- **Payments:** Razorpay
- **Monitoring:** Sentry (free tier)
- **Hosting:** Vercel (frontend) + existing backend host — confirm serverless function timeout limits handle longer AI calls, or move interview-scoring to a background job if needed

---

## 12. Team Task Breakdown

| Track | Owner | Covers |
|---|---|---|
| **Security & Infra** | 1 person | Credential rotation, rate limiting, Sentry, cost logging |
| **Payments** | 1 person | Razorpay order/webhook/verify, billing page, subscription cron |
| **Voice Interview** | 1–2 people | Realtime API integration, session UI, transcript capture, session cap |
| **Leaderboard** | 1 person | Points logic, anti-gaming caps, filters, opt-in/out, UI |
| **UI/UX Rebuild** | 1 person | Design system, landing page, interview screen, report screen, dashboard, leaderboard UI |
| **Resume Scanner Upgrade** | 1 person | Replace regex pipeline with structured LLM call |

If the team is smaller than this, run the tracks sequentially in the order listed — Security/Infra and Payments always come first regardless of team size.

---

## 13. Build Timeline (8-week target)

- **Week 1:** Security fixes, credential rotation, rate limiting, cost logging.
- **Weeks 2–3:** Razorpay integration end-to-end + billing page.
- **Week 3 (parallel):** Resume scanner upgraded to real single-call AI.
- **Weeks 4–6:** Voice interview MVP — Realtime integration, session cap, waveform UI, transcript capture, report pipeline wired in.
- **Weeks 5–6 (parallel):** Leaderboard — schema, points logic, anti-gaming caps, UI, opt-in flow.
- **Week 7:** Full UI/UX pass — landing page, interview screen, report screen, dashboard, leaderboard polish. Remove AI Mentor/Company Prep from nav.
- **Week 8:** QA pass (see §14), soft launch to a small trusted group (college network) at a discounted "founding user" price for testimonials and bug-catching before wider push.

---

## 14. QA & Launch Checklist

- [ ] Payment flow tested end-to-end with Razorpay test keys, then live keys with a real small transaction
- [ ] Subscription downgrade-on-expiry actually fires (test with a short fake cycle)
- [ ] Voice session cost-capped correctly — verify server rejects sessions past the hard limit
- [ ] Voice session graceful failure (mic denied, connection drop) falls back to text mode, doesn't just break
- [ ] Leaderboard point calculation matches spec, anti-gaming caps verified with rapid-fire test interviews
- [ ] Leaderboard opt-out actually removes the user from all public views
- [ ] No secrets in the repo — re-audit `.env.example` and git history before going live
- [ ] Mobile pass on the interview screen and checkout flow specifically — these are the two screens that must not break on a phone
- [ ] Error monitoring (Sentry) confirmed catching real errors in a staging test

---

## 15. Post-Launch — What to Track

- Free → paid conversion rate (and specifically: did they hit the free voice-interview cap before converting?)
- Cost per user vs. revenue per user by plan (from the AI cost logging in §10) — this tells you if pricing is sustainable
- Leaderboard engagement: % of paid users opted in, weekly active leaderboard viewers
- Session drop-off: how many voice interviews are started vs. completed
- Which channel drives signups (LinkedIn shares from report cards should be trackable via a referral param)

---

*This document is the shared source of truth for the rebuild. Update it as decisions change — don't let the build drift from what's written here without updating this file first.*
