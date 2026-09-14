# CrackIt AI — Payment API Documentation

> Version: 1.0 · Currency: INR · Auth: JWT Bearer token

All authenticated endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

---

## Base URL

| Environment | URL |
|------------|-----|
| Development | `http://localhost:5000/api` |
| Production  | `https://crackitai-qmmd.onrender.com/api` |

---

## Plans

All plan pricing is **server-side only**. The frontend never sends an amount.

| Plan Key | Display Name | Amount | Duration |
|----------|-------------|--------|----------|
| `basic` | Basic | ₹299 | 1 month |
| `pro` | Pro | ₹599 | 1 month |
| `annual_basic` | Basic Annual | ₹2,499 | 12 months |
| `annual_pro` | Pro Annual | ₹4,999 | 12 months |

User `subscription.plan` stores: `free` \| `basic` \| `pro` \| `annual`  
(`annual_basic` and `annual_pro` both map to `annual` on the User document)

---

## Billing Endpoints

### POST `/billing/create-order`

Creates a Razorpay order. Amount is determined **server-side** from the plan key.

**Auth:** Required  
**Rate limit:** 5 requests / minute per IP

**Request**
```json
{ "plan": "pro" }
```

**Success 200**
```json
{
  "success": true,
  "order": {
    "id": "order_XXXXXXXXXXXXXXXX",
    "amount": 59900,
    "currency": "INR",
    "plan": "pro",
    "planDetails": {
      "name": "Pro",
      "amountDisplay": "₹599",
      "description": "15 voice interviews/month + role-specific modes"
    }
  },
  "key": "rzp_test_XXXXXXXXXXXXXXXX",
  "testMode": true
}
```

**Error responses**
| Status | Condition |
|--------|-----------|
| 400 | Invalid or missing plan key |
| 401 | Not authenticated |
| 429 | Rate limit exceeded |
| 500 | Razorpay API failure |

**Security notes**
- Amount is fetched from server config, never from request body
- A 30-minute deduplication window reuses existing unpaid orders
- `key` is the public Razorpay KEY_ID — safe to expose to frontend
- `RAZORPAY_KEY_SECRET` is never returned

---

### POST `/billing/verify`

Verifies a Razorpay payment after checkout modal success.  
This is the UX-convenience path; the webhook is the authoritative source.

**Auth:** Required

**Request**
```json
{
  "razorpay_order_id": "order_XXXXXXXXXXXXXXXX",
  "razorpay_payment_id": "pay_XXXXXXXXXXXXXXXX",
  "razorpay_signature": "HMAC_SHA256_SIGNATURE",
  "plan": "pro"
}
```

**Success 200**
```json
{
  "success": true,
  "message": "Successfully activated Pro plan.",
  "subscription": {
    "plan": "pro",
    "status": "active",
    "currentPeriodEnd": "2026-10-13T10:30:00.000Z"
  }
}
```

**Already processed 200** (idempotent)
```json
{
  "success": true,
  "message": "Payment already confirmed.",
  "alreadyProcessed": true,
  "subscription": { ... }
}
```

**Error responses**
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `SIGNATURE_MISMATCH` | HMAC verification failed |
| 400 | — | Missing fields / invalid plan |
| 401 | — | Not authenticated |
| 403 | — | Order does not belong to this user (IDOR attempt) |
| 500 | — | Database or internal error |

**Security notes**
- HMAC verified with `timingSafeEqual` to prevent timing attacks
- Order ownership checked: `Order.userId === req.user._id`
- Plan cross-checked: `order.planKey === body.plan`
- Idempotent: safe to call multiple times for the same payment
- Signature and secrets never logged

---

### GET `/billing/status`

Returns the user's current plan, usage, and available upgrade options.

**Auth:** Required

**Success 200**
```json
{
  "success": true,
  "billing": {
    "plan": "pro",
    "status": "active",
    "currentPeriodEnd": "2026-10-13T10:30:00.000Z",
    "autoRenew": true,
    "limits": {
      "monthlyInterviews": 15,
      "maxSessionMinutes": 15,
      "dailyAICalls": 10
    },
    "usage": {
      "interviewsUsedThisCycle": 3,
      "interviewCycleEnd": "2026-10-13T10:30:00.000Z",
      "dailyAICalls": 1,
      "dailyAICallsReset": "2026-09-13T00:00:00.000Z"
    },
    "plans": [
      {
        "key": "basic",
        "name": "Basic",
        "amountDisplay": "₹299",
        "description": "5 voice interviews/month + full leaderboard",
        "isCurrent": false
      }
    ]
  }
}
```

**Note:** This endpoint performs a lazy auto-downgrade check. If the subscription period has ended and `autoRenew` is `false`, the user is downgraded to `free` atomically before the response is returned.

---

### GET `/billing/history`

Paginated list of this user's orders and payments.

**Auth:** Required  
**Query params:** `page` (default 1), `limit` (default 10, max 50)

**Success 200**
```json
{
  "success": true,
  "history": [
    {
      "orderId": "6650a1b2c3d4e5f6a7b8c9d0",
      "razorpayOrderId": "order_XXXXXXXXXXXXXXXX",
      "razorpayPaymentId": "pay_XXXXXXXXXXXXXXXX",
      "planKey": "pro",
      "planName": "Pro",
      "amountDisplay": "₹599",
      "amountPaise": 59900,
      "currency": "INR",
      "status": "paid",
      "refundStatus": "none",
      "refundAmount": null,
      "date": "2026-09-13T10:30:00.000Z",
      "activatedAt": "2026-09-13T10:30:05.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
```

---

### POST `/billing/cancel`

Disables auto-renew. Plan stays active until `currentPeriodEnd`.

**Auth:** Required

**Request:** No body required

**Success 200**
```json
{
  "success": true,
  "message": "Auto-renew disabled. Your plan stays active until the current period ends.",
  "currentPeriodEnd": "2026-10-13T10:30:00.000Z"
}
```

**Error responses**
| Status | Condition |
|--------|-----------|
| 400 | User is on free plan — nothing to cancel |
| 401 | Not authenticated |

---

### POST `/billing/webhook`

Razorpay webhook endpoint. Called by Razorpay servers — not by your frontend.

**Auth:** None (uses `x-razorpay-signature` HMAC verification instead)  
**Rate limit:** 60 requests / minute

**Headers required**
```
x-razorpay-signature: <HMAC_SHA256_of_body_with_webhook_secret>
Content-Type: application/json
```

**Handled events**
| Event | Action |
|-------|--------|
| `payment.captured` | Activates subscription, resets usage, sends success email |
| `payment.failed` | Records failure, sends failure email |
| `refund.created` | Updates Payment + Order refund status |
| `refund.processed` | Updates refund status to processed |
| `subscription.activated` | Activates subscription (Razorpay Subscriptions product) |
| `subscription.charged` | Activates renewal |
| `subscription.cancelled` | Sets autoRenew=false, status=cancelled |
| `subscription.completed` | Same as cancelled |
| `subscription.halted` | Same as cancelled |

**Always returns 200** — Razorpay treats non-200 as failure and retries.  
Internal errors are recorded on the `WebhookEvent` document.

**Idempotency:** Every event is deduplicated via `WebhookEvent.dedupeKey` (unique index on `eventType|entityId`). Duplicate deliveries are silently ignored.

**Security notes**
- Signature verified with `timingSafeEqual` using `RAZORPAY_WEBHOOK_SECRET`
- If `RAZORPAY_WEBHOOK_SECRET` is not set, all webhooks are rejected in production
- Raw body bytes (not re-serialized JSON) are used for signature verification

---

## Admin Endpoints

All admin endpoints require JWT + `role === 'admin'` on the User document.

### GET `/admin/payments`

Paginated, filterable payment list.

**Auth:** Admin only  
**Query params:** `page`, `limit` (max 100), `status`, `planKey`, `userId`, `from` (ISO date), `to` (ISO date)

**Success 200**
```json
{
  "success": true,
  "payments": [
    {
      "_id": "...",
      "razorpayOrderId": "order_XXX",
      "razorpayPaymentId": "pay_XXX",
      "user": { "id": "...", "name": "Alice", "email": "alice@example.com" },
      "planKey": "pro",
      "planName": "Pro",
      "amountDisplay": "₹599",
      "amount": 59900,
      "currency": "INR",
      "status": "paid",
      "refundStatus": "none",
      "createdAt": "2026-09-13T10:30:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 142, "pages": 8 }
}
```

---

### GET `/admin/payments/stats`

Revenue summary and subscription counts.

**Auth:** Admin only  
**Query params:** `from` (ISO date), `to` (ISO date) — defaults to current month

**Success 200**
```json
{
  "success": true,
  "stats": {
    "period": { "from": "...", "to": "..." },
    "revenue": { "totalPaise": 598800, "totalDisplay": "₹5988" },
    "orders": { "paid": 12, "failed": 3, "cancelled": 1, "created": 0, "total": 16 },
    "subscriptions": { "active": 45, "cancelled": 7 },
    "byPlan": [
      { "planKey": "pro", "planName": "Pro", "revenue": 359400, "revenueDisplay": "₹3594", "count": 6 }
    ]
  }
}
```

---

### GET `/admin/payments/:orderId`

Single order with associated payment records.

**Auth:** Admin only

**Success 200** — returns `order` + `payments[]` array (payment method details, error details if failed)

---

### POST `/admin/payments/:orderId/refund`

Initiate a full or partial refund. Admin-only. Triggers Razorpay refund API.

**Auth:** Admin only

**Request**
```json
{
  "reason": "Customer requested refund — within 7-day policy",
  "amountPaise": 29900
}
```
Omit `amountPaise` for a full refund.

**Success 200**
```json
{
  "success": true,
  "message": "Refund of ₹299 initiated successfully.",
  "refundId": "rfnd_XXXXXXXXXXXXXXXX",
  "refundAmount": 29900,
  "refundStatus": "created"
}
```

**Effects**
- Full refund: user downgraded to `free` plan immediately
- Partial refund: subscription remains active
- `sendRefundConfirmationEmail` sent to user
- `Order.refundStatus` and `Payment.refundStatus` updated

**Error responses**
| Status | Condition |
|--------|-----------|
| 400 | Order not in `paid` status |
| 400 | Order already fully refunded |
| 400 | Invalid partial refund amount |
| 403 | Not admin |
| 404 | Order not found |

---

### GET `/admin/users`

Paginated user list with subscription info.

**Auth:** Admin only  
**Query params:** `page`, `limit`, `plan`, `role`, `search` (name/email)

---

### GET `/admin/webhooks`

Recent webhook events for monitoring.

**Auth:** Admin only  
**Query params:** `page`, `limit`, `status`, `eventType`

---

## Error Response Format

All errors follow this structure:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "code": "MACHINE_READABLE_CODE"
}
```

Internal stack traces are never returned in production.

---

## Security Summary

| Threat | Mitigation |
|--------|-----------|
| Client-side price manipulation | Amount determined from server-side `PLANS` config only |
| Fake payment success | Backend HMAC signature verification required before activation |
| Timing attack on signature | `crypto.timingSafeEqual` used in all HMAC comparisons |
| IDOR — verify another user's order | `Order.userId === req.user._id` checked before verification |
| Duplicate webhook processing | `WebhookEvent.dedupeKey` unique index; atomic upsert |
| Duplicate verify calls | `Payment.razorpayPaymentId` unique index; idempotent response |
| Webhook spoofing | `x-razorpay-signature` verified against raw body + `RAZORPAY_WEBHOOK_SECRET` |
| Secret exposure | `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` never logged or returned |
| Unauthenticated access | All billing routes use `protect` middleware (webhook excluded by design) |
| Admin access by non-admin | `authorize('admin')` middleware on all `/admin/*` routes |
| Rate abuse | 5 order/min, 60 webhook/min, 120 admin/min, 100 global/15min |
| Expired subscription access | Auto-downgrade in `getBillingStatus` and `requirePlan` middleware |
