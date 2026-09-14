/**
 * Admin Service — payment management API client
 *
 * All calls require the logged-in user to have role === 'admin'.
 * The backend enforces this via protect + authorize('admin') middleware.
 */

import api from './api.js';

// ── Payment list ──────────────────────────────────────────────────────────────
export const listPayments = async ({ page = 1, limit = 20, status, planKey, userId, from, to } = {}) => {
  const params = { page, limit };
  if (status)  params.status  = status;
  if (planKey) params.planKey = planKey;
  if (userId)  params.userId  = userId;
  if (from)    params.from    = from;
  if (to)      params.to      = to;
  const res = await api.get('/admin/payments', { params });
  return res.data;
};

// ── Revenue / subscription stats ──────────────────────────────────────────────
export const getPaymentStats = async ({ from, to } = {}) => {
  const params = {};
  if (from) params.from = from;
  if (to)   params.to   = to;
  const res = await api.get('/admin/payments/stats', { params });
  return res.data;
};

// ── Single order detail ───────────────────────────────────────────────────────
export const getOrderDetail = async (orderId) => {
  const res = await api.get(`/admin/payments/${orderId}`);
  return res.data;
};

// ── Initiate refund (admin-only) ──────────────────────────────────────────────
export const initiateRefund = async (orderId, { amountPaise, reason } = {}) => {
  const res = await api.post(`/admin/payments/${orderId}/refund`, { amountPaise, reason });
  return res.data;
};

// ── User list ─────────────────────────────────────────────────────────────────
export const listUsers = async ({ page = 1, limit = 20, plan, role, search } = {}) => {
  const params = { page, limit };
  if (plan)   params.plan   = plan;
  if (role)   params.role   = role;
  if (search) params.search = search;
  const res = await api.get('/admin/users', { params });
  return res.data;
};

// ── Webhook events ────────────────────────────────────────────────────────────
export const listWebhookEvents = async ({ page = 1, limit = 20, status, eventType } = {}) => {
  const params = { page, limit };
  if (status)    params.status    = status;
  if (eventType) params.eventType = eventType;
  const res = await api.get('/admin/webhooks', { params });
  return res.data;
};
