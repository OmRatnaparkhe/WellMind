// history.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns'; // Import date-fns

const prisma = new PrismaClient();
const router = Router();

// Get user's drawing history (grouped by day)
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Get all drawings for the user, ordered by creation date (newest first)
    const drawings = await prisma.drawing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Group drawings by the day in the user's local timezone
    const drawingsByDay = drawings.reduce((acc, drawing) => {
      // Use date-fns to format the date in the local timezone
      // The `format` function will use the local timezone of the machine running this code
      const day = format(new Date(drawing.createdAt), 'yyyy-MM-dd');
      
      if (!acc[day]) {
        acc[day] = [];
      }
      
      acc[day].push(drawing);
      return acc;
    }, {} as Record<string, typeof drawings>);

    // Convert to array format for easier consumption by frontend
    const result = Object.entries(drawingsByDay).map(([date, items]) => ({
      date,
      items,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;