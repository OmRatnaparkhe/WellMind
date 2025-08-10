import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { startOfDay, endOfDay, subDays } from 'date-fns';
const router = Router();
// Schema for mood entry
const MoodEntrySchema = z.object({
    score: z.number().min(1).max(10),
    emoji: z.string().optional(),
    note: z.string().optional(),
});
// Create a new mood entry
router.post('/', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const moodData = MoodEntrySchema.parse(req.body);
        // Create mood entry
        const moodEntry = await prisma.moodEntry.create({
            data: {
                userId,
                score: moodData.score,
                emoji: moodData.emoji,
                note: moodData.note,
            },
        });
        // Check for concerning mood patterns
        if (moodData.score <= 3) {
            // Create a risk alert for low mood
            await prisma.riskAlert.create({
                data: {
                    userId,
                    type: 'mood',
                    source: 'mood_entry',
                    message: `Low mood score detected: ${moodData.score}/10`,
                    severity: moodData.score <= 2 ? 'high' : 'medium',
                    acknowledged: false,
                },
            });
        }
        // Update daily checklist to mark mood check-in as completed
        const today = startOfDay(new Date());
        await prisma.dailyChecklist.upsert({
            where: { userId_date: { userId, date: today } },
            update: { moodCheckin: true },
            create: { userId, date: today, moodCheckin: true },
        });
        res.json(moodEntry);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid mood data', details: error.format() });
        }
        console.error('Error creating mood entry:', error);
        res.status(500).json({ error: 'Failed to create mood entry' });
    }
});
// Get mood entries for a specific date range
router.get('/history', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const days = req.query.days ? parseInt(req.query.days) : 7;
        const endDate = endOfDay(new Date());
        const startDate = startOfDay(subDays(endDate, days - 1));
        const moodEntries = await prisma.moodEntry.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        res.json(moodEntries);
    }
    catch (error) {
        console.error('Error getting mood history:', error);
        res.status(500).json({ error: 'Failed to get mood history' });
    }
});
// Get today's mood entry
router.get('/today', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const today = startOfDay(new Date());
        const tomorrow = endOfDay(today);
        const moodEntry = await prisma.moodEntry.findFirst({
            where: {
                userId,
                createdAt: {
                    gte: today,
                    lte: tomorrow,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!moodEntry) {
            return res.status(404).json({ error: 'No mood entry found for today' });
        }
        res.json(moodEntry);
    }
    catch (error) {
        console.error('Error getting today\'s mood:', error);
        res.status(500).json({ error: 'Failed to get today\'s mood' });
    }
});
// Get mood trends (average by day for the past month)
router.get('/trends', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const days = req.query.days ? parseInt(req.query.days) : 30;
        const endDate = endOfDay(new Date());
        const startDate = startOfDay(subDays(endDate, days - 1));
        const moodEntries = await prisma.moodEntry.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        // Group by day and calculate average
        const moodByDay = moodEntries.reduce((acc, entry) => {
            const day = startOfDay(entry.createdAt).toISOString();
            if (!acc[day]) {
                acc[day] = { sum: 0, count: 0 };
            }
            acc[day].sum += entry.score;
            acc[day].count += 1;
            return acc;
        }, {});
        // Calculate averages and format response
        const trends = Object.entries(moodByDay).map(([day, { sum, count }]) => ({
            date: day,
            averageScore: sum / count,
        }));
        // Check for concerning trends (consistently low mood over time)
        if (trends.length >= 3) {
            const recentTrends = trends.slice(-3); // Get last 3 days
            const recentAverage = recentTrends.reduce((sum, day) => sum + day.averageScore, 0) / recentTrends.length;
            // If average mood over last 3 days is consistently low
            if (recentAverage <= 4) {
                // Create a risk alert for persistent low mood
                await prisma.riskAlert.create({
                    data: {
                        userId,
                        type: 'mood_trend',
                        source: 'mood_analysis',
                        message: `Persistent low mood detected over the past 3 days (avg: ${recentAverage.toFixed(1)}/10)`,
                        severity: recentAverage <= 3 ? 'high' : 'medium',
                        acknowledged: false,
                    },
                });
            }
        }
        res.json(trends);
    }
    catch (error) {
        console.error('Error getting mood trends:', error);
        res.status(500).json({ error: 'Failed to get mood trends' });
    }
});
export default router;
