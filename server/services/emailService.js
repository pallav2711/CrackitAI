/**
 * Email Service — Nodemailer
 *
 * Sends transactional emails for payment lifecycle events.
 * Uses the SMTP credentials from .env (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, etc.)
 *
 * All functions are fire-and-forget friendly:
 *   sendPaymentSuccessEmail(...).catch(err => console.warn(...))
 *
 * Templates use plain HTML — no additional template engine required.
 * Replace with a professional template library (MJML, Handlebars) when needed.
 *
 * Available email functions:
 *   sendPaymentSuccessEmail   — after successful payment
 *   sendPaymentFailedEmail    — after payment failure
 *   sendSubscriptionCancelledEmail — after cancellation
 *   sendSubscriptionExpiringEmail  — before subscription expires (call from a cron job)
 *   sendRefundConfirmationEmail    — after refund is processed (admin-triggered)
 */

import nodemailer from 'nodemailer';

// ── Transporter (lazy singleton) ──────────────────────────────────────────────

let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  const {
    EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, NODE_ENV,
  } = process.env;

  // In test/development without email config, return a no-op transporter
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('[emailService] Email not configured — no emails will be sent. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD.');
    _transporter = {
      sendMail: async (opts) => {
        if (NODE_ENV === 'development') {
          console.log(`[emailService DEV] Would send "${opts.subject}" to ${opts.to}`);
        }
        return { messageId: 'dev-noop' };
      },
    };
    return _transporter;
  }

  _transporter = nodemailer.createTransport({
    host:   EMAIL_HOST,
    port:   parseInt(EMAIL_PORT || '587', 10),
    secure: parseInt(EMAIL_PORT || '587', 10) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  return _transporter;
};

// ── Shared helpers ────────────────────────────────────────────────────────────

const FROM = process.env.EMAIL_FROM || '"CrackIt AI" <noreply@crackit.ai>';
const APP_URL = process.env.CLIENT_URL || 'https://crackiitai.vercel.app';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

/** Wraps content in a consistent branded HTML shell */
const wrapEmail = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f0e8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0a0a0a; }
    .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border: 3px solid #0a0a0a; box-shadow: 6px 6px 0 #0a0a0a; }
    .header { background: #0a0a0a; padding: 20px 28px; display: flex; align-items: center; gap: 12px; }
    .logo { color: #f5c518; font-size: 18px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
    .body { padding: 32px 28px; }
    h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin: 0 0 16px; }
    p { font-size: 14px; line-height: 1.6; margin: 0 0 14px; color: #333; }
    .badge { display: inline-block; background: #f5c518; color: #0a0a0a; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; padding: 3px 8px; border: 2px solid #0a0a0a; margin-bottom: 16px; }
    .info-box { background: #f5f0e8; border: 2px solid #0a0a0a; padding: 16px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-bottom: 1px solid #e0d9ca; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #666; font-weight: 600; }
    .info-value { font-weight: 700; }
    .btn { display: inline-block; background: #0a0a0a; color: #f5c518 !important; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; text-decoration: none; padding: 12px 24px; border: 2px solid #0a0a0a; margin: 8px 0; }
    .footer { background: #0a0a0a; padding: 16px 28px; }
    .footer p { color: rgba(255,255,255,0.3); font-size: 11px; margin: 0; }
    .red { color: #c0392b; }
    .green { color: #1a6b4a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">⚡ CrackIt AI</div>
    </div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">
      <p>CrackIt AI · Razorpay-secured payments · PCI-DSS Level 1</p>
      <p style="margin-top:4px;">If you didn't initiate this action, contact us at pallavkanani27@mail.com</p>
    </div>
  </div>
</body>
</html>`;

// ── Send helpers ──────────────────────────────────────────────────────────────

async function send({ to, subject, html }) {
  const transporter = getTransporter();
  const result = await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html,
  });
  return result;
}

// ═════════════════════════════════════════════════════════════════════════════
// Payment success
// ═════════════════════════════════════════════════════════════════════════════
/**
 * @param {object} opts
 * @param {string} opts.name
 * @param {string} opts.email
 * @param {string} opts.planName              — e.g. 'Pro'
 * @param {string} opts.amountDisplay         — e.g. '₹599'
 * @param {string} opts.razorpayPaymentId
 * @param {Date}   opts.currentPeriodEnd
 */
export const sendPaymentSuccessEmail = async ({
  name, email, planName, amountDisplay, razorpayPaymentId, currentPeriodEnd,
}) => {
  const subject = `Payment confirmed — ${planName} plan is active`;
  const html = wrapEmail(subject, `
    <div class="badge">Payment Confirmed</div>
    <h1>You're all set! 🎉</h1>
    <p>Hi ${name},</p>
    <p>Your payment was successful and your <strong>${planName}</strong> plan is now active. Start practising your interview skills right away.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Plan</span><span class="info-value">${planName}</span></div>
      <div class="info-row"><span class="info-label">Amount paid</span><span class="info-value">${amountDisplay}</span></div>
      <div class="info-row"><span class="info-label">Valid until</span><span class="info-value">${fmt(currentPeriodEnd)}</span></div>
      <div class="info-row"><span class="info-label">Payment ID</span><span class="info-value" style="font-family:monospace;font-size:11px;">${razorpayPaymentId}</span></div>
    </div>
    <p>A Razorpay receipt has also been sent to your registered email.</p>
    <a href="${APP_URL}/interview/setup" class="btn">Start Interview →</a>
    <p style="margin-top:20px;font-size:12px;color:#999;">If you have questions, reply to this email or contact us at pallavkanani27@mail.com</p>
  `);

  return send({ to: email, subject, html });
};

// ═════════════════════════════════════════════════════════════════════════════
// Payment failed
// ═════════════════════════════════════════════════════════════════════════════
export const sendPaymentFailedEmail = async ({ name, email, planName, errorDesc }) => {
  const subject = `Payment failed — ${planName} plan`;
  const html = wrapEmail(subject, `
    <div class="badge" style="background:#c0392b;color:#fff;">Payment Failed</div>
    <h1>Your payment didn't go through</h1>
    <p>Hi ${name},</p>
    <p>Unfortunately your payment for the <strong>${planName}</strong> plan could not be processed.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Reason</span><span class="info-value red">${errorDesc || 'Unknown error'}</span></div>
    </div>
    <p><strong>No amount has been charged</strong> to your account. If you see a pending deduction in your bank app, it will be reversed automatically within 3–5 business days.</p>
    <a href="${APP_URL}/billing" class="btn">Try Again →</a>
    <p style="margin-top:20px;font-size:12px;color:#999;">Need help? Contact us at pallavkanani27@mail.com</p>
  `);

  return send({ to: email, subject, html });
};

// ═════════════════════════════════════════════════════════════════════════════
// Subscription cancelled / auto-renew off
// ═════════════════════════════════════════════════════════════════════════════
export const sendSubscriptionCancelledEmail = async ({ name, email, planName, currentPeriodEnd }) => {
  const subject = `Auto-renew cancelled — ${planName} plan`;
  const html = wrapEmail(subject, `
    <div class="badge">Auto-Renew Off</div>
    <h1>Your subscription will not renew</h1>
    <p>Hi ${name},</p>
    <p>As requested, auto-renew for your <strong>${planName}</strong> plan has been turned off.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Plan stays active until</span><span class="info-value">${fmt(currentPeriodEnd)}</span></div>
    </div>
    <p>After <strong>${fmt(currentPeriodEnd)}</strong> your account will revert to the Free plan. You can re-subscribe any time from your billing page.</p>
    <a href="${APP_URL}/billing" class="btn">Manage Billing →</a>
  `);

  return send({ to: email, subject, html });
};

// ═════════════════════════════════════════════════════════════════════════════
// Subscription expiring soon (call from a scheduled job, e.g. 7 days before)
// ═════════════════════════════════════════════════════════════════════════════
export const sendSubscriptionExpiringEmail = async ({ name, email, planName, currentPeriodEnd }) => {
  const subject = `Your ${planName} plan expires on ${fmt(currentPeriodEnd)}`;
  const html = wrapEmail(subject, `
    <div class="badge" style="background:#e67e22;color:#fff;">Expiring Soon</div>
    <h1>Your plan expires soon</h1>
    <p>Hi ${name},</p>
    <p>Your <strong>${planName}</strong> plan will expire on <strong>${fmt(currentPeriodEnd)}</strong>.</p>
    <p>To keep your interview sessions and progress, renew your plan before it expires.</p>
    <a href="${APP_URL}/billing" class="btn">Renew Plan →</a>
    <p style="margin-top:20px;font-size:12px;color:#999;">If you no longer need the paid plan, no action is required — your account will move to Free automatically.</p>
  `);

  return send({ to: email, subject, html });
};

// ═════════════════════════════════════════════════════════════════════════════
// Refund confirmation (admin-triggered)
// ═════════════════════════════════════════════════════════════════════════════
export const sendRefundConfirmationEmail = async ({
  name, email, planName, refundAmountDisplay, razorpayPaymentId, refundId,
}) => {
  const subject = `Refund processed — ${refundAmountDisplay}`;
  const html = wrapEmail(subject, `
    <div class="badge" style="background:#1a6b4a;color:#fff;">Refund Processed</div>
    <h1>Your refund is on the way</h1>
    <p>Hi ${name},</p>
    <p>We've processed a refund for your <strong>${planName}</strong> plan purchase.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Refund amount</span><span class="info-value">${refundAmountDisplay}</span></div>
      <div class="info-row"><span class="info-label">Original payment ID</span><span class="info-value" style="font-family:monospace;font-size:11px;">${razorpayPaymentId}</span></div>
      <div class="info-row"><span class="info-label">Refund ID</span><span class="info-value" style="font-family:monospace;font-size:11px;">${refundId}</span></div>
      <div class="info-row"><span class="info-label">Expected in account</span><span class="info-value">5–7 business days</span></div>
    </div>
    <p>The refund will appear in your original payment source (UPI/card/bank) within 5–7 business days.</p>
    <p style="font-size:12px;color:#999;">Questions? Contact pallavkanani27@mail.com with your Refund ID.</p>
  `);

  return send({ to: email, subject, html });
};
