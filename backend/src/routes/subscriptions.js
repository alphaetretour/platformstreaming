const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { SubscriptionStatus } = require('@prisma/client');

// Get all subscriptions for current user
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: {
      platform: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ subscriptions });
}));

// Get single subscription
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      platform: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  // Check if subscription belongs to current user
  if (subscription.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized to access this resource' });
  }

  res.json({ subscription });
}));

// Create subscription
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { platformId, price, currency, autoRenew, startDate, endDate } = req.body;

  if (!platformId) {
    return res.status(400).json({ error: 'Platform ID is required' });
  }

  // Check if platform exists
  const platform = await prisma.platform.findUnique({
    where: { id: platformId },
  });

  if (!platform) {
    return res.status(404).json({ error: 'Platform not found' });
  }

  // Check if user already has subscription to this platform
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      platformId,
    },
  });

  if (existingSubscription) {
    return res.status(409).json({ error: 'You already have a subscription to this platform' });
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      platformId,
      status: SubscriptionStatus.ACTIVE,
      price: price || 0,
      currency: currency || 'EUR',
      autoRenew: autoRenew !== undefined ? autoRenew : true,
      startDate: startDate || new Date(),
      endDate,
    },
    include: {
      platform: true,
    },
  });

  res.status(201).json({ subscription });
}));

// Update subscription
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { status, autoRenew, endDate, price, currency } = req.body;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
  });

  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  // Check if subscription belongs to current user
  if (subscription.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized to update this resource' });
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (autoRenew !== undefined) updateData.autoRenew = autoRenew;
  if (endDate) updateData.endDate = endDate;
  if (price !== undefined) updateData.price = price;
  if (currency) updateData.currency = currency;

  // If status is CANCELLED, set endDate to now if not provided
  if (status === SubscriptionStatus.CANCELLED && !endDate) {
    updateData.endDate = new Date();
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { id },
    data: updateData,
    include: {
      platform: true,
    },
  });

  res.json({ subscription: updatedSubscription });
}));

// Cancel subscription
router.post('/:id/cancel', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
  });

  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  // Check if subscription belongs to current user
  if (subscription.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized to cancel this resource' });
  }

  // Check if already cancelled
  if (subscription.status === SubscriptionStatus.CANCELLED) {
    return res.status(400).json({ error: 'Subscription is already cancelled' });
  }

  const cancelledSubscription = await prisma.subscription.update({
    where: { id },
    data: {
      status: SubscriptionStatus.CANCELLED,
      endDate: new Date(),
      updatedAt: new Date(),
    },
    include: {
      platform: true,
    },
  });

  res.json({ 
    subscription: cancelledSubscription,
    message: 'Subscription cancelled successfully' 
  });
}));

// Resume subscription
router.post('/:id/resume', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
  });

  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  // Check if subscription belongs to current user
  if (subscription.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized to resume this resource' });
  }

  // Check if can be resumed
  if (subscription.status !== SubscriptionStatus.CANCELLED && 
      subscription.status !== SubscriptionStatus.SUSPENDED) {
    return res.status(400).json({ error: 'Only cancelled or suspended subscriptions can be resumed' });
  }

  const resumedSubscription = await prisma.subscription.update({
    where: { id },
    data: {
      status: SubscriptionStatus.ACTIVE,
      endDate: null,
      updatedAt: new Date(),
    },
    include: {
      platform: true,
    },
  });

  res.json({ 
    subscription: resumedSubscription,
    message: 'Subscription resumed successfully' 
  });
}));

// Delete subscription
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
  });

  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  // Check if subscription belongs to current user
  if (subscription.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized to delete this resource' });
  }

  await prisma.subscription.delete({
    where: { id },
  });

  res.json({ message: 'Subscription deleted successfully' });
}));

// Get subscription statistics for user
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const [activeSubscriptions, totalSpent, subscriptionsByPlatform] = await Promise.all([
    prisma.subscription.count({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    }),
    prisma.subscription.aggregate({
      where: { userId },
      _sum: { price: true },
    }),
    prisma.subscription.groupBy({
      by: ['platformId'],
      where: { userId },
      _count: { _all: true },
      include: {
        platform: {
          select: {
            id: true,
            displayName: true,
            logoUrl: true,
          },
        },
      },
    }),
  ]);

  res.json({
    activeSubscriptions,
    totalSpent: totalSpent._sum.price || 0,
    subscriptionsByPlatform,
  });
}));

module.exports = router;
