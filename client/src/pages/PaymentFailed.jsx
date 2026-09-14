/**
 * /payment/failed
 *
 * Shown when:
 *  - Razorpay redirects here after a payment failure (URL error params)
 *  - billingService.startCheckout catches a payment.failed event
 *  - User cancels the Razorpay modal and is explicitly routed here
 *
 * IMPORTANT: Never expose internal Razorpay error codes or stack traces to users.
 * Show friendly messages; log technical details server-side only.
 */

import { useSearchParams, Link } from 'react-router-dom';
import {
  AlertCircle, RefreshCw, ArrowRight,
  Mail, Zap, Shield, CreditCard,
} from 'lucide-react';

/* ─── Friendly error mapping ──────────────────────────────────────────────── */
const REASON_MAP = {
  // Razorpay error codes
  BAD_REQUEST_ERROR:   'The payment request was invalid. Please try again with a different payment method.',
  GATEWAY_ERROR:       'The payment gateway encountered an issue. Please try a different payment method or try again in a few minutes.',
  NETWORK_ERROR:       'A network error interrupted your payment. Your account has not been charged.',
  SERVER_ERROR:        'An unexpected error occurred on the payment gateway. Please try again in a few minutes.',
  // Razorpay reason strings
  payment_cancelled:   'You closed the payment window without completing the payment. No charge was made.',
  payment_failed:      'Your payment could not be processed. Please check your payment details and try again.',
  // Generic fallback
  default:             'Your payment was not completed. No charges have been made to your account.',
};

const friendlyMessage = (code, reason, description) => {
  return REASON_MAP[code] || REASON_MAP[reason] || description || REASON_MAP.default;
};

/* ─── Troubleshooting tips ────────────────────────────────────────────────── */
const TIPS = [
  { icon: CreditCard, text: 'Check that your card / UPI details are correct and the payment method is active.' },
  { icon: Shield,     text: 'Some banks block online payments by default — check your banking app settings.' },
  { icon: RefreshCw,  text: 'Try a different payment method (UPI, card, or net banking).' },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function PaymentFailed() {
  const [params] = useSearchParams();

  const errorCode   = params.get('error[code]')        || params.get('reason')              || '';
  const errorDesc   = params.get('error[description]') || params.get('description')         || '';
  const errorReason = params.get('error[reason]')      || params.get('error[source]')       || '';
  const orderId     = params.get('razorpay_order_id')  || params.get('order_id')            || '';

  const message = friendlyMessage(errorCode, errorReason, errorDesc);

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="bg-nb-black border-3 border-nb-black border-b-0 px-6 py-4 flex items-center gap-3">
          <div className="w-7 h-7 bg-nb-yellow flex items-center justify-center border-2 border-nb-yellow">
            <Zap className="w-4 h-4 text-nb-black" />
          </div>
          <span className="text-sm font-black uppercase tracking-tighter text-nb-yellow">CrackIt AI</span>
          <div className="flex-1" />
          <span className="text-[10px] font-mono text-nb-yellow/40 uppercase tracking-widest hidden sm:block">
            Secured by Razorpay
          </span>
        </div>

        {/* Body */}
        <div className="border-3 border-nb-black bg-white p-8 md:p-10 space-y-6" style={{ boxShadow: '8px 8px 0 #111111' }}>

          {/* Icon + title */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-nb-red border-3 border-nb-black  mx-auto flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-nb-red text-white px-3 py-1 border-2 border-nb-black mb-3">
                PAYMENT NOT COMPLETED
              </span>
              <h1 className="text-3xl font-black uppercase tracking-tight">Payment failed</h1>
              <p className="text-sm font-medium text-nb-black/60 mt-2 leading-relaxed max-w-sm mx-auto">
                {message}
              </p>
            </div>
          </div>

          {/* No-charge reassurance */}
          <div className="border-3 border-nb-black bg-nb-yellow p-5 space-y-2">
            <p className="text-xs font-black uppercase tracking-widest">No charge was made</p>
            <p className="text-sm font-medium text-nb-black/70 leading-relaxed">
              If you see a pending deduction in your banking app, it will be reversed
              automatically within 3–5 business days. This is a standard bank authorisation
              hold, not a completed charge.
            </p>
          </div>

          {/* Error reference */}
          {(errorCode || orderId) && (
            <div className="border-3 border-nb-black bg-[#F5F1E8] p-4 font-mono text-xs text-nb-black/50 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/40 mb-2 not-italic">
                Reference
              </p>
              {errorCode && <p>Error code: {errorCode}</p>}
              {orderId   && <p>Order ID: {orderId}</p>}
            </div>
          )}

          {/* Troubleshooting tips */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/40">
              Troubleshooting
            </p>
            {TIPS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5 text-nb-black/40" />
                <p className="text-sm font-medium text-nb-black/70 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/billing" className="btn btn-black flex-1 justify-center">
              <RefreshCw className="w-4 h-4" /> Try again
            </Link>
            <Link to="/pricing" className="btn flex-1 justify-center">
              View plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Support */}
          <div className="border-t-2 border-nb-black pt-5 text-center space-y-1">
            <p className="text-xs font-bold text-nb-black/40 uppercase tracking-widest">Need help?</p>
            <a
              href="mailto:pallavkanani27@mail.com"
              className="inline-flex items-center gap-2 text-sm font-black hover:text-nb-red transition-colors"
            >
              <Mail className="w-4 h-4" />
              pallavkanani27@mail.com
            </a>
            <p className="text-xs font-medium text-nb-black/40 mt-1">
              Include your Order ID above — we respond within 1 business day.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="border-3 border-nb-black border-t-0 bg-nb-black px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
            Secured by Razorpay · PCI-DSS Level 1
          </span>
          <Link to="/" className="text-xs font-bold text-nb-yellow/60 hover:text-nb-yellow transition-colors">
            ← Home
          </Link>
        </div>

      </div>
    </div>
  );
}
