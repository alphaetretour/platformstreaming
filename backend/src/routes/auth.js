const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../config/jwt');
const { asyncHandler } = require('../middleware/errorHandler');

// Register a new user
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ error: 'User already exists with this email' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  res.status(201).json({
    user,
    token,
  });
}));

// Login user
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  // Return user without password
  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };

  res.json({
    user: userWithoutPassword,
    token,
  });
}));

// Get current user
router.get('/me', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      subscriptions: {
        include: {
          platform: {
            select: {
              id: true,
              name: true,
              displayName: true,
              logoUrl: true,
            },
          },
        },
      },
      credentials: {
        include: {
          platform: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const { verifyToken } = require('../config/jwt');
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token
    const newToken = generateToken({
      id: user.id,
      email: user.email,
    });

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}));

module.exports = router;
