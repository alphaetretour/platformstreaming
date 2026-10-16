const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const axios = require('axios');

// Streaming platform API configurations
const PLATFORM_CONFIGS = {
  netflix: {
    authUrl: 'https://www.netflix.com/api/auth',
    validateUrl: 'https://www.netflix.com/api/validate',
    tokenUrl: 'https://www.netflix.com/api/token',
  },
  disneyplus: {
    authUrl: 'https://www.disneyplus.com/api/auth',
    validateUrl: 'https://www.disneyplus.com/api/validate',
  },
  amazonprime: {
    authUrl: 'https://www.primevideo.com/api/auth',
    validateUrl: 'https://www.primevideo.com/api/validate',
  },
  hbo: {
    authUrl: 'https://www.hbomax.com/api/auth',
    validateUrl: 'https://www.hbomax.com/api/validate',
  },
  apple: {
    authUrl: 'https://www.apple.com/tv/api/auth',
    validateUrl: 'https://www.apple.com/tv/api/validate',
  },
  canalplus: {
    authUrl: 'https://www.canalplus.com/api/auth',
    validateUrl: 'https://www.canalplus.com/api/validate',
  },
  salto: {
    authUrl: 'https://www.salto.fr/api/auth',
    validateUrl: 'https://www.salto.fr/api/validate',
  },
  mycanal: {
    authUrl: 'https://www.mycanal.fr/api/auth',
    validateUrl: 'https://www.mycanal.fr/api/validate',
  },
};

// Get all credentials for current user
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const credentials = await prisma.platformCredential.findMany({
    where: { userId },
    include: {
      platform: true,
    },
    orderBy: { platform: { displayName: 'asc' } },
  });

  res.json({ credentials });
}));

// Get single credential
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const credential = await prisma.platformCredential.findUnique({
    where: { id },
    include: {
      platform: true,
    },
  });

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  // Check if credential belongs to current user
  if (credential.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized to access this resource' });
  }

  // Mask sensitive data
  const maskedCredential = {
    ...credential,
    password: credential.password ? '***' : null,
    accessToken: credential.accessToken ? '***' : null,
    refreshToken: credential.refreshToken ? '***' : null,
  };

  res.json({ credential: maskedCredential });
}));

// Connect to a platform (save credentials)
router.post('/connect', authenticate, asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { platformId, username, password, accessToken, refreshToken, metadata } = req.body;

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

  // Check if user already has credentials for this platform
  const existingCredential = await prisma.platformCredential.findFirst({
    where: {
      userId,
      platformId,
    },
  });

  let credential;

  if (existingCredential) {
    // Update existing credential
    credential = await prisma.platformCredential.update({
      where: { id: existingCredential.id },
      data: {
        username: username || existingCredential.username,
        password: password ? await hashPassword(password) : existingCredential.password,
        accessToken: accessToken || existingCredential.accessToken,
        refreshToken: refreshToken || existingCredential.refreshToken,
        tokenExpiry: refreshToken ? new Date(Date.now() + 24 * 60 * 60 * 1000) : existingCredential.tokenExpiry,
        isConnected: true,
        lastSync: new Date(),
        metadata: metadata || existingCredential.metadata,
      },
      include: {
        platform: true,
      },
    });
  } else {
    // Create new credential
    credential = await prisma.platformCredential.create({
      data: {
        userId,
        platformId,
        username,
        password: password ? await hashPassword(password) : null,
        accessToken,
        refreshToken,
        tokenExpiry: refreshToken ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
        isConnected: true,
        lastSync: new Date(),
        metadata,
      },
      include: {
        platform: true,
      },
    });
  }

  // Try to validate connection
  try {
    const isValid = await validatePlatformConnection(platform.name, credential);
    
    if (!isValid) {
      // Connection failed, but we still save the credentials
      await prisma.platformCredential.update({
        where: { id: credential.id },
        data: { isConnected: false },
      });
      
      return res.status(200).json({ 
        credential: { ...credential, isConnected: false },
        message: 'Credentials saved but connection validation failed' 
      });
    }
  } catch (error) {
    console.error('Connection validation error:', error.message);
    // Don't fail the request, just log the error
  }

  res.status(201).json({ 
    credential: { 
      ...credential, 
      password: credential.password ? '***' : null,
      accessToken: credential.accessToken ? '***' : null,
      refreshToken: credential.refreshToken ? '***' : null,
    },
    message: 'Connected successfully' 
  });
}));

// Disconnect from a platform
router.post('/:id/disconnect', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const credential = await prisma.platformCredential.findUnique({
    where: { id },
  });

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  // Check if credential belongs to current user
  if (credential.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized to disconnect this resource' });
  }

  const disconnectedCredential = await prisma.platformCredential.update({
    where: { id },
    data: {
      isConnected: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      lastSync: new Date(),
    },
    include: {
      platform: true,
    },
  });

  res.json({ 
    credential: disconnectedCredential,
    message: 'Disconnected successfully' 
  });
}));

// Delete credential
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const credential = await prisma.platformCredential.findUnique({
    where: { id },
  });

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  // Check if credential belongs to current user
  if (credential.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized to delete this resource' });
  }

  await prisma.platformCredential.delete({
    where: { id },
  });

  res.json({ message: 'Credential deleted successfully' });
}));

// Test connection to a platform
router.post('/:id/test', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const credential = await prisma.platformCredential.findUnique({
    where: { id },
    include: {
      platform: true,
    },
  });

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  // Check if credential belongs to current user
  if (credential.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized to test this connection' });
  }

  try {
    const isValid = await validatePlatformConnection(credential.platform.name, credential);
    
    // Update connection status
    await prisma.platformCredential.update({
      where: { id },
      data: {
        isConnected: isValid,
        lastSync: new Date(),
      },
    });

    res.json({ 
      isConnected: isValid,
      message: isValid ? 'Connection successful' : 'Connection failed' 
    });
  } catch (error) {
    console.error('Connection test error:', error.message);
    res.status(500).json({ 
      isConnected: false,
      error: error.message,
      message: 'Connection test failed' 
    });
  }
}));

// Helper functions
async function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function validatePlatformConnection(platformName, credential) {
  const config = PLATFORM_CONFIGS[platformName.toLowerCase()];
  
  if (!config) {
    // For unknown platforms, assume connection is valid if we have credentials
    return !!(credential.username || credential.accessToken);
  }

  try {
    // Simulate API call to validate connection
    // In production, you would make actual API calls here
    
    // For demo purposes, we'll just check if we have valid credentials
    if (credential.accessToken) {
      // Check if token is expired
      if (credential.tokenExpiry && new Date() > new Date(credential.tokenExpiry)) {
        return false;
      }
      return true;
    }

    if (credential.username && credential.password) {
      // Simulate login
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Validation error for ${platformName}:`, error.message);
    return false;
  }
}

module.exports = router;
