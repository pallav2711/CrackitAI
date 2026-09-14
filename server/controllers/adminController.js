/**
 * Admin Controller — Payment Management
 *
 * All routes require JWT + role === 'admin'.
 * Never exposes Razorpay secrets or user passwords.
 *
 * Endpoints:
 *   GET  /api/admin/payments           — paginated payment list with filters
 *   GET  /api/admin/payments/stats     — revenue summary + status counts
 *   GET  /api/admin/payments/:orderId  — single order detail
 *   POST /api/admin/payments/:orderId/refund — initiate refund (admin-only)
 *   GET  /api/admin/users              — paginated user list
 *   GET  /api/admin/webhooks           — recent webhook events
 */

import mongoose from 'mongoose';
import User         from '../models/User.js';
import Order        from '../models/Order.js';
import Payment      from '../models/Payment.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { initiateRefund } from '../services/razorpayService.js';
import { sendRefundConfirmationEmail } from '../services/emailService.js';
import { PLANS } from './billingController.js';

const log = (level, ...args) => {
  if (process.env.NODE_ENV !== 'test') console[level]('[admin]', ...args);
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/admin/payments
// Query params: page, limit, status, planKey, userId, from, to
// ═════════════════════════════════════════════════════════════════════════════
export const listPayments = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;

    // Build query filters
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.planKey) filter.planKey = req.query.planKey;

    if (req.query.userId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.userId)) {
        return res.status(400).json({ success: false, message: 'Invalid userId format.' });
      }
      filter.userId = new mongoose.Types.ObjectId(req.query.userId);
    }

    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to)   filter.createdAt.$lte = new Date(req.query.to);
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email role')
        .select('-notes')
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      payments: orders.map(o => ({
        _id:               o._id,
        razorpayOrderId:   o.razorpayOrderId,
        razorpayPaymentId: o.razorpayPaymentId,
        user: {
          id:    o.userId?._id,
          name:  o.userId?.name,
          email: o.userId?.email,
        },
        planKey:      o.planKey,
        planName:     o.planName,
        amountDisplay: o.amountDisplay,
        amount:       o.amount,
        currency:     o.currency,
        status:       o.status,
        refundStatus: o.refundStatus,
        refundId:     o.refundId,
        refundAmount: o.refundAmount,
        activatedAt:  o.activatedAt,
        refundedAt:   o.refundedAt,
        createdAt:    o.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    log('error', 'listPayments:', err.message);
    res.status(500).json({ success: false, message: 'Failed to list payments.' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/admin/payments/stats
// Revenue summary and subscription stats
// ═════════════════════════════════════════════════════════════════════════════
export const getPaymentStats = async (req, res) => {
  try {
    // Date range — default to current month
    const now   = new Date();
    const from  = req.query.from
      ? new Date(req.query.from)
      : new Date(now.getFullYear(), now.getMonth(), 1); // start of month
    const to    = req.query.to ? new Date(req.query.to) : now;

    const [
      totalRevenue,
      statusCounts,
      planCounts,
      activeSubscriptions,
      cancelledSubscriptions,
      revenueByPlan,
    ] = await Promise.all([
      // Total revenue (paid orders in range)
      Order.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Count by status
      Order.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Count by plan (paid only)
      Order.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$planKey', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      ]),

      // Active subscriptions right now
      User.countDocuments({
        'subscription.status': 'active',
        'subscription.plan':   { $ne: 'free' },
        'subscription.currentPeriodEnd': { $gt: now },
      }),

      // Cancelled subscriptions
      User.countDocuments({ 'subscription.status': 'cancelled' }),

      // Revenue by plan for the period
      Order.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$planKey', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
      ]),
    ]);

    const totalRevenuePaise = totalRevenue[0]?.total || 0;
    const statusMap = Object.fromEntries(statusCounts.map(s => [s._id, s.count]));

    res.json({
      success: true,
      stats: {
        period: { from, to },
        revenue: {
          totalPaise:   totalRevenuePaise,
          totalDisplay: `₹${(totalRevenuePaise / 100).toFixed(0)}`,
        },
        orders: {
          paid:      statusMap.paid      || 0,
          failed:    statusMap.failed    || 0,
          cancelled: statusMap.cancelled || 0,
          created:   statusMap.created   || 0,
          total:     Object.values(statusMap).reduce((a, b) => a + b, 0),
        },
        subscriptions: {
          active:    activeSubscriptions,
          cancelled: cancelledSubscriptions,
        },
        byPlan: revenueByPlan.map(p => ({
          planKey:      p._id,
          planName:     PLANS[p._id]?.name || p._id,
          revenue:      p.revenue,
          revenueDisplay: `₹${(p.revenue / 100).toFixed(0)}`,
          count:        p.count,
        })),
      },
    });
  } catch (err) {
    log('error', 'getPaymentStats:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load payment stats.' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/admin/payments/:orderId
// Single order detail with associated payments + user
// ═════════════════════════════════════════════════════════════════════════════
export const getOrderDetail = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }

    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'name email role subscription')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Fetch associated payment records
    const payments = await Payment.find({ razorpayOrderId: order.razorpayOrderId })
      .select('-razorpayPayload -razorpaySignature')
      .lean();

    res.json({
      success: true,
      order: {
        _id:               order._id,
        razorpayOrderId:   order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        user: {
          id:           order.userId?._id,
          name:         order.userId?.name,
          email:        order.userId?.email,
          currentPlan:  order.userId?.subscription?.plan,
          planStatus:   order.userId?.subscription?.status,
        },
        planKey:        order.planKey,
        planName:       order.planName,
        amountDisplay:  order.amountDisplay,
        amount:         order.amount,
        currency:       order.currency,
        status:         order.status,
        billingName:    order.billingName,
        billingEmail:   order.billingEmail,
        gstin:          order.gstin,
        refundStatus:   order.refundStatus,
        refundId:       order.refundId,
        refundAmount:   order.refundAmount,
        refundReason:   order.refundReason,
        activatedAt:    order.activatedAt,
        refundedAt:     order.refundedAt,
        createdAt:      order.createdAt,
      },
      payments: payments.map(p => ({
        _id:               p._id,
        razorpayPaymentId: p.razorpayPaymentId,
        status:            p.status,
        amount:            p.amount,
        method:            p.method,
        bank:              p.bank,
        vpa:               p.vpa,
        cardNetwork:       p.cardNetwork,
        cardLast4:         p.cardLast4,
        signatureVerified: p.signatureVerified,
        verifiedBy:        p.verifiedBy,
        errorCode:         p.errorCode,
        errorDescription:  p.errorDescription,
        refundId:          p.refundId,
        refundStatus:      p.refundStatus,
        createdAt:         p.createdAt,
      })),
    });
  } catch (err) {
    log('error', 'getOrderDetail:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load order detail.' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/admin/payments/:orderId/refund
// Admin-only refund initiation
// Body: { amountPaise (optional, for partial), reason }
// ═════════════════════════════════════════════════════════════════════════════
export const initiateRefundAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }

    const { reason, amountPaise } = req.body;

    const order = await Order.findById(req.params.orderId).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: `Cannot refund an order with status "${order.status}". Only paid orders can be refunded.`,
      });
    }

    if (order.refundStatus === 'full') {
      return res.status(400).json({ success: false, message: 'This order has already been fully refunded.' });
    }

    if (!order.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'No Razorpay payment ID on this order.' });
    }

    // Validate partial refund amount
    if (amountPaise !== undefined) {
      if (!Number.isInteger(amountPaise) || amountPaise < 100 || amountPaise > order.amount) {
        return res.status(400).json({
          success: false,
          message: `Invalid refund amount. Must be an integer in paise between 100 and ${order.amount}.`,
        });
      }
    }

    // ── Initiate refund via Razorpay ─────────────────────────────────────────
    const rzRefund = await initiateRefund({
      razorpayPaymentId: order.razorpayPaymentId,
      amountPaise,
      reason,
      notes: {
        adminId:    req.user._id.toString(),
        adminEmail: req.user.email,
        orderId:    order._id.toString(),
      },
    });

    const isFullRefund = !amountPaise || amountPaise >= order.amount;
    const refundStatus = isFullRefund ? 'full' : 'partial';
    const refundAmountActual = rzRefund.amount; // paise, as confirmed by Razorpay

    // ── Update Order ──────────────────────────────────────────────────────────
    await Order.findByIdAndUpdate(order._id, {
      refundId:     rzRefund.id,
      refundAmount: refundAmountActual,
      refundStatus,
      refundReason: reason || 'Admin-initiated refund',
      refundedAt:   new Date(),
    });

    // ── Update Payment record ────────────────────────────────────────────────
    await Payment.findOneAndUpdate(
      { razorpayPaymentId: order.razorpayPaymentId },
      {
        refundId:     rzRefund.id,
        refundAmount: refundAmountActual,
        refundStatus,
        refundedAt:   new Date(),
        status:       isFullRefund ? 'refunded' : 'captured',
      }
    );

    // ── Downgrade user if full refund ────────────────────────────────────────
    if (isFullRefund && order.userId) {
      await User.findByIdAndUpdate(order.userId._id, {
        'subscription.plan':   'free',
        'subscription.status': 'inactive',
        'subscription.autoRenew': false,
      });
      log('info', `User ${order.userId._id} downgraded to free after full refund ${rzRefund.id}`);
    }

    // ── Send refund email ────────────────────────────────────────────────────
    if (order.userId) {
      const refundDisplay = `₹${(refundAmountActual / 100).toFixed(0)}`;
      sendRefundConfirmationEmail({
        name:                order.userId.name,
        email:               order.userId.email,
        planName:            order.planName,
        refundAmountDisplay: refundDisplay,
        razorpayPaymentId:   order.razorpayPaymentId,
        refundId:            rzRefund.id,
      }).catch(err => log('warn', 'Failed to send refund email:', err.message));
    }

    log('info', `Refund initiated: order=${order._id} refund=${rzRefund.id} amount=${refundAmountActual} by admin=${req.user._id}`);

    res.json({
      success:      true,
      message:      `Refund of ₹${(refundAmountActual / 100).toFixed(0)} initiated successfully.`,
      refundId:     rzRefund.id,
      refundAmount: refundAmountActual,
      refundStatus: rzRefund.status,
    });
  } catch (err) {
    log('error', 'initiateRefundAdmin:', err.message);
    res.status(500).json({
      success: false,
      message: err.message.includes('Razorpay') || err.message.includes('refund')
        ? err.message
        : 'Failed to process refund.',
    });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/admin/users
// User list with subscription info
// Query: page, limit, plan, role, search (name/email)
// ═════════════════════════════════════════════════════════════════════════════
export const listUsers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.plan) filter['subscription.plan'] = req.query.plan;
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      const re = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { email: re }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email role subscription.plan subscription.status subscription.currentPeriodEnd subscription.autoRenew stats.interviewsTaken createdAt')
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users: users.map(u => ({
        id:              u._id,
        name:            u.name,
        email:           u.email,
        role:            u.role,
        plan:            u.subscription?.plan || 'free',
        planStatus:      u.subscription?.status,
        periodEnd:       u.subscription?.currentPeriodEnd,
        autoRenew:       u.subscription?.autoRenew,
        interviewsTaken: u.stats?.interviewsTaken || 0,
        joinedAt:        u.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    log('error', 'listUsers:', err.message);
    res.status(500).json({ success: false, message: 'Failed to list users.' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/admin/webhooks
// Recent webhook events for monitoring
// ═════════════════════════════════════════════════════════════════════════════
export const listWebhookEvents = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.eventType) filter.eventType = req.query.eventType;

    const [events, total] = await Promise.all([
      WebhookEvent.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-payload') // don't return full payload in list
        .lean(),
      WebhookEvent.countDocuments(filter),
    ]);

    res.json({
      success: true,
      events: events.map(e => ({
        _id:         e._id,
        eventType:   e.eventType,
        entityId:    e.entityId,
        status:      e.status,
        attempts:    e.attempts,
        summary:     e.summary,
        lastError:   e.lastError,
        processedAt: e.processedAt,
        createdAt:   e.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    log('error', 'listWebhookEvents:', err.message);
    res.status(500).json({ success: false, message: 'Failed to list webhook events.' });
  }
};
