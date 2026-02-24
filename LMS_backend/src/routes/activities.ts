const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { requireHead } = require('../middleware/roles');

const router = Router();
const prisma = new PrismaClient();

// Get recent activities - Head only
router.get('/recent', authenticateToken, requireHead, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({ activities });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activities by entity
router.get('/entity/:entity/:entityId', authenticateToken, async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const activities = await prisma.activity.findMany({
      where: {
        entity,
        entityId
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({ activities });
  } catch (error) {
    console.error('Get entity activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activities by actor
router.get('/actor/:actorId', authenticateToken, async (req, res) => {
  try {
    const { actorId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const activities = await prisma.activity.findMany({
      where: {
        actorId
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ activities });
  } catch (error) {
    console.error('Get actor activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;