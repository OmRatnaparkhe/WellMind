import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';

const router = Router();

// Schema for creating a new alert
const AlertSchema = z.object({
  type: z.enum(['journal', 'mood', 'mood_trend', 'quiz', 'other']),
  source: z.enum(['journal_entry', 'mood_entry', 'mood_analysis', 'quiz_result', 'system']),
  message: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high']),
});

// Get all unacknowledged alerts for the current user
router.get('/unacknowledged', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userId = (req as any).auth.userId;

    const alerts = await prisma.riskAlert.findMany({
      where: {
        userId,
        acknowledged: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching unacknowledged alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get all alerts for the current user
router.get('/', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userId = (req as any).auth.userId;
    const { limit = '10', offset = '0' } = req.query;

    const alerts = await prisma.riskAlert.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.riskAlert.count({
      where: {
        userId,
      },
    });

    res.json({
      alerts,
      total,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create a new alert
router.post('/', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userId = (req as any).auth.userId;
    const validatedData = AlertSchema.parse(req.body);

    const alert = await prisma.riskAlert.create({
      data: {
        userId,
        type: validatedData.type,
        source: validatedData.source,
        message: validatedData.message,
        severity: validatedData.severity,
        acknowledged: false,
      },
    });

    res.status(201).json(alert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error creating alert:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  }
});

// Mark an alert as acknowledged
router.get('/acknowledge/:id', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userId = (req as any).auth.userId;
    const { id } = req.params;

    const alert = await prisma.riskAlert.findUnique({
      where: {
        id,
      },
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (alert.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to acknowledge this alert' });
    }

    const updatedAlert = await prisma.riskAlert.update({
      where: {
        id,
      },
      data: {
        acknowledged: true,
      },
    });

    res.json(updatedAlert);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

export default router;