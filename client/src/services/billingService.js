/**
 * Billing Service — Razorpay Checkout + Billing API
 *
 * This module is the single frontend touchpoint for all payment operations.
 * No component should call api.* billing endpoints directly — use this service.
 *
 * Security:
 *  - The Razorpay KEY_SECRET never touches the frontend.
 *    The public KEY_ID is received from the backend /create-order response.
 *  - Payment verification (HMAC check) is always done server-side via /billing/verify.
 *  - This module never decides whether a payment succeeded — only the backend does.
 *
 * UX:
 *  - Duplicate checkout requests are blocked while one is in-flight.
 *  - Full loading / success / error states exposed via callbacks.
 *  - Razorpay script loaded lazily and cached.
 */

import api from './api.js';

// ── Script loader ─────────────────────────────────────────────────────────────

let _scriptLoaded = false;
let _scriptLoading = null;

/**
 * Dynamically loads the Razorpay Checkout script.
 * Cached after first load — safe to call multiple times.
 * @returns {Promise<boolean>} true if loaded successfully
 */
export const loadRazorpayScript = () => {
  if (_scriptLoaded && window.Razorpay) return Promise.resolve(true);

  // Return the in-flight promise if already loading
  if (_scriptLoading) return _scriptLoading;

  _scriptLoading = new Promise((resolve) => {
    if (window.Razorpay) {
      _scriptLoaded = true;
      _scriptLoading = null;
      return resolve(true);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      _scriptLoaded = true;
      _scriptLoading = null;
      resolve(true);
    };

    script.onerror = () => {
      _scriptLoading = null;
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return _scriptLoading;
};

// ── API wrappers ──────────────────────────────────────────────────────────────

/**
 * Fetch the user's current billing status, plan limits, and available plans.
 * @returns {Promise<{billing: object}>}
 */
export const getBillingStatus = async () => {
  const res = await api.get('/billing/status');
  return res.data;
};

/**
 * Create a Razorpay order for the given plan key.
 * The backend determines the amount — never sent from frontend.
 * @param {string} planKey — one of: basic | pro | annual_basic | annual_pro
 * @returns {Promise<{order, key, testMode}>}
 */
export const createOrder = async (planKey) => {
  const res = await api.post('/billing/create-order', { plan: planKey });
  return res.data;
};

/**
 * Verify a completed Razorpay payment with the server.
 * This is called after the checkout modal returns payment IDs.
 * The server re-verifies the HMAC signature — never trust frontend status.
 * @returns {Promise<{success, subscription}>}
 */
export const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, plan }) => {
  const res = await api.post('/billing/verify', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
  });
  return res.data;
};

/**
 * Fetch paginated payment history for the current user.
 * @param {number} page
 * @param {number} limit
 */
export const getPaymentHistory = async (page = 1, limit = 10) => {
  const res = await api.get('/billing/history', { params: { page, limit } });
  return res.data;
};

/**
 * Disable auto-renew (soft cancel).
 * Plan stays active until currentPeriodEnd.
 */
export const cancelSubscription = async () => {
  const res = await api.post('/billing/cancel');
  return res.data;
};

// ── In-flight guard ───────────────────────────────────────────────────────────
// Prevents double-clicking the upgrade button from creating two Razorpay sessions.
let _checkoutInFlight = false;

// ── Full checkout flow ────────────────────────────────────────────────────────

/**
 * Orchestrates the complete Razorpay payment flow:
 *   1. Guard against duplicate calls
 *   2. Load Razorpay checkout.js
 *   3. Call /billing/create-order (server sets the price)
 *   4. Open Razorpay checkout modal
 *   5. On modal success: call /billing/verify (server verifies HMAC)
 *   6. Invoke onSuccess(result) or onError(message)
 *
 * @param {string}   planKey    — plan identifier (e.g. 'pro')
 * @param {object}   user       — { name, email } for prefill (cosmetic only)
 * @param {function} onSuccess  — called with the verify response on success
 * @param {function} onError    — called with a user-friendly error string
 * @param {function} [onDismiss] — called if user closes modal without paying
 */
export const startCheckout = async (planKey, user, onSuccess, onError, onDismiss) => {
  if (_checkoutInFlight) {
    onError('A checkout is already in progress. Please wait.');
    return;
  }

  _checkoutInFlight = true;

  try {
    // ── Step 1: Load Razorpay script ────────────────────────────────────────
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error(
        'Could not load the payment gateway. Check your internet connection and try again.'
      );
    }

    // ── Step 2: Create order on backend (amount set server-side) ────────────
    let orderData;
    try {
      orderData = await createOrder(planKey);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not create payment order. Please try again.';
      throw new Error(msg);
    }

    const { order, key, testMode } = orderData;

    if (!order?.id || !key) {
      throw new Error('Invalid order response from server. Please try again.');
    }

    if (testMode && process.env.NODE_ENV !== 'production') {
      console.info('[billingService] Razorpay is in TEST mode — no real money will be charged.');
    }

    // ── Step 3: Open Razorpay checkout modal ────────────────────────────────
    await new Promise((resolve, reject) => {
      const options = {
        key,
        amount:      order.amount,
        currency:    order.currency,
        name:        'CrackIt AI',
        description: order.planDetails?.description || `${order.planDetails?.name} plan`,
        order_id:    order.id,

        prefill: {
          name:  user?.name  || '',
          email: user?.email || '',
        },

        theme: {
          color: '#1a6b4a',   // deep green — matches neo-brutalist design system
        },

        // Razorpay Checkout success handler — fires BEFORE the modal closes
        handler: async (response) => {
          try {
            // ── Step 4: Server-side signature verification ──────────────────
            const result = await verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan:                planKey,
            });

            if (result.success) {
              resolve(result);
            } else {
              reject(new Error(result.message || 'Payment verification failed.'));
            }
          } catch (verifyErr) {
            const msg =
              verifyErr?.response?.data?.message ||
              verifyErr.message ||
              'Payment verification failed. Contact support if money was deducted.';
            reject(new Error(msg));
          }
        },

        modal: {
          ondismiss: () => {
            // User closed modal without paying — not an error
            if (onDismiss) onDismiss();
            // Resolve with null so the Promise doesn't hang
            resolve(null);
          },
          // Confirm before closing if payment is in-flight
          confirm_close: true,
          escape: false,
        },

        // Retry settings (Razorpay built-in)
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const rzp = new window.Razorpay(options);

      // Razorpay payment failure callback
      rzp.on('payment.failed', (response) => {
        const errMsg =
          response?.error?.description ||
          response?.error?.reason ||
          'Payment failed. Please try a different payment method.';
        reject(new Error(errMsg));
      });

      rzp.open();
    }).then((result) => {
      if (result) {
        onSuccess(result);
      }
      // result === null means user dismissed — onDismiss already called above
    });

  } catch (err) {
    const userMsg =
      err?.response?.data?.message ||
      err.message ||
      'Something went wrong with the payment. Please try again.';
    onError(userMsg);
  } finally {
    _checkoutInFlight = false;
  }
};

/**
 * Reset the in-flight guard (useful in tests).
 */
export const _resetCheckoutGuard = () => { _checkoutInFlight = false; };
