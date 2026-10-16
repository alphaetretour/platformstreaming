const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all platforms
router.get('/', asyncHandler(async (req, res) => {
  const platforms = await prisma.platform.findMany({
    where: { isActive: true },
    orderBy: { displayName: 'asc' },
  });

  res.json({ platforms });
}));

// Get single platform
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const platform = await prisma.platform.findUnique({
    where: { id },
    include: {
      subscriptions: {
        where: { userId: req.user?.id },
      },
      credentials: {
        where: { userId: req.user?.id },
      },
    },
  });

  if (!platform) {
    return res.status(404).json({ error: 'Platform not found' });
  }

  res.json({ platform });
}));

// Create platform (Admin only)
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { name, displayName, logoUrl, baseUrl, apiEndpoint, isActive } = req.body;

  if (!name || !displayName) {
    return res.status(400).json({ error: 'Name and displayName are required' });
  }

  const platform = await prisma.platform.create({
    data: {
      name,
      displayName,
      logoUrl,
      baseUrl,
      apiEndpoint,
      isActive: isActive !== undefined ? isActive : true,
    },
  });

  res.status(201).json({ platform });
}));

// Update platform (Admin only)
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, displayName, logoUrl, baseUrl, apiEndpoint, isActive } = req.body;

  const platform = await prisma.platform.findUnique({
    where: { id },
  });

  if (!platform) {
    return res.status(404).json({ error: 'Platform not found' });
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (displayName) updateData.displayName = displayName;
  if (logoUrl) updateData.logoUrl = logoUrl;
  if (baseUrl) updateData.baseUrl = baseUrl;
  if (apiEndpoint) updateData.apiEndpoint = apiEndpoint;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedPlatform = await prisma.platform.update({
    where: { id },
    data: updateData,
  });

  res.json({ platform: updatedPlatform });
}));

// Delete platform (Admin only)
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const platform = await prisma.platform.findUnique({
    where: { id },
  });

  if (!platform) {
    return res.status(404).json({ error: 'Platform not found' });
  }

  await prisma.platform.delete({
    where: { id },
  });

  res.json({ message: 'Platform deleted successfully' });
}));

// Get platform connection status for user
router.get('/:id/connection-status', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const credential = await prisma.platformCredential.findFirst({
    where: {
      platformId: id,
      userId,
    },
    include: {
      platform: true,
    },
  });

  const subscription = await prisma.subscription.findFirst({
    where: {
      platformId: id,
      userId,
    },
    include: {
      platform: true,
    },
  });

  res.json({
    isConnected: !!credential?.isConnected,
    credential: credential ? {
      id: credential.id,
      isConnected: credential.isConnected,
      lastSync: credential.lastSync,
    } : null,
    subscription: subscription ? {
      id: subscription.id,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      autoRenew: subscription.autoRenew,
      price: subscription.price,
      currency: subscription.currency,
    } : null,
  });
}));

module.exports = router;
