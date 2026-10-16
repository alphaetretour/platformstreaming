const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all users (Admin only)
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      subscriptions: {
        include: {
          platform: true,
        },
      },
    },
  });

  res.json({ users });
}));

// Get single user
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Only allow access to own profile or admin
  if (req.user.id !== id) {
    return res.status(403).json({ error: 'Not authorized to access this resource' });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      subscriptions: {
        include: {
          platform: true,
        },
      },
      credentials: {
        include: {
          platform: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
}));

// Update user
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, name, currentPassword, newPassword } = req.body;

  // Only allow update of own profile
  if (req.user.id !== id) {
    return res.status(403).json({ error: 'Not authorized to update this resource' });
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updateData = {};

  if (email) updateData.email = email;
  if (name) updateData.name = name;

  // Handle password change
  if (currentPassword && newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(newPassword, salt);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ user: updatedUser });
}));

// Delete user
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Only allow deletion of own profile
  if (req.user.id !== id) {
    return res.status(403).json({ error: 'Not authorized to delete this resource' });
  }

  // First, delete related credentials and subscriptions
  await prisma.platformCredential.deleteMany({
    where: { userId: id },
  });

  await prisma.subscription.deleteMany({
    where: { userId: id },
  });

  await prisma.user.delete({
    where: { id },
  });

  res.json({ message: 'User deleted successfully' });
}));

module.exports = router;
