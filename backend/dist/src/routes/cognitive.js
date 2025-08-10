import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { startOfDay, endOfDay, subDays } from 'date-fns';
const router = Router();
// Schema for cognitive entry
const CognitiveEntrySchema = z.object({
    exerciseType: z.enum(['memory', 'attention', 'problemSolving', 'processing']),
    score: z.number().min(0).max(100),
    duration: z.number().min(1), // duration in seconds
    metadata: z.record(z.string(), z.any()).optional(),
    summary: z.string().optional().default('Exercise completed'),
    videoId: z.string().optional(),
});
// Create a new cognitive exercise entry
router.post('/', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const cognitiveData = CognitiveEntrySchema.parse(req.body);
        // Create cognitive entry
        const cognitiveEntry = await prisma.cognitiveEntry.create({
            data: {
                userId,
                videoId: cognitiveData.videoId ?? 'default',
                summary: cognitiveData.summary || `Completed ${cognitiveData.exerciseType} exercise with score ${cognitiveData.score}`,
                comprehensionScore: cognitiveData.score,
                exerciseType: cognitiveData.exerciseType,
                score: cognitiveData.score,
                duration: cognitiveData.duration,
                metadata: cognitiveData.metadata || {},
            },
        });
        // Update daily checklist to mark cognitive task as completed
        const today = startOfDay(new Date());
        // If this came from a video summary, mark that task; otherwise mark generic cognitive task
        const updateData = cognitiveData.videoId ? { videoSummary: true } : { cognitiveTask: true };
        await prisma.dailyChecklist.upsert({
            where: { userId_date: { userId, date: today } },
            update: updateData,
            create: { userId, date: today, ...updateData },
        });
        res.json(cognitiveEntry);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid cognitive exercise data', details: error.format() });
        }
        console.error('Error creating cognitive entry:', error);
        res.status(500).json({ error: 'Failed to create cognitive entry' });
    }
});
// Get cognitive exercises for a specific date range
router.get('/history', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const days = req.query.days ? parseInt(req.query.days) : 30;
        const endDate = endOfDay(new Date());
        const startDate = startOfDay(subDays(endDate, days - 1));
        const cognitiveEntries = await prisma.cognitiveEntry.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(cognitiveEntries);
    }
    catch (error) {
        console.error('Error getting cognitive history:', error);
        res.status(500).json({ error: 'Failed to get cognitive history' });
    }
});
// Get cognitive performance trends by exercise type
router.get('/trends', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const days = req.query.days ? parseInt(req.query.days) : 30;
        const endDate = endOfDay(new Date());
        const startDate = startOfDay(subDays(endDate, days - 1));
        const cognitiveEntries = await prisma.cognitiveEntry.findMany({
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
        // Group by exercise type and day
        const trendsByType = {};
        cognitiveEntries.forEach(entry => {
            const day = startOfDay(entry.createdAt).toISOString();
            const type = entry.exerciseType ?? 'unknown';
            const score = typeof entry.score === 'number' ? entry.score : (typeof entry.comprehensionScore === 'number' ? entry.comprehensionScore * 10 : 0);
            if (!trendsByType[type]) {
                trendsByType[type] = {};
            }
            if (!trendsByType[type][day]) {
                trendsByType[type][day] = { sum: 0, count: 0 };
            }
            trendsByType[type][day].sum += score;
            trendsByType[type][day].count += 1;
        });
        // Calculate averages and format response
        const trends = Object.entries(trendsByType).map(([type, days]) => {
            const dataPoints = Object.entries(days).map(([day, { sum, count }]) => ({
                date: day,
                averageScore: sum / count,
            }));
            return {
                exerciseType: type,
                data: dataPoints,
            };
        });
        res.json(trends);
    }
    catch (error) {
        console.error('Error getting cognitive trends:', error);
        res.status(500).json({ error: 'Failed to get cognitive trends' });
    }
});
// Get recommended cognitive exercises based on user performance
router.get('/recommendations', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        // Get recent cognitive entries
        const days = 30; // Look at the last 30 days
        const endDate = endOfDay(new Date());
        const startDate = startOfDay(subDays(endDate, days - 1));
        const cognitiveEntries = await prisma.cognitiveEntry.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Calculate average scores by exercise type
        const scoresByType = {};
        const exerciseTypes = ['memory', 'attention', 'problemSolving', 'processing'];
        // Initialize all exercise types
        exerciseTypes.forEach(type => {
            scoresByType[type] = { sum: 0, count: 0 };
        });
        // Sum up scores by type
        cognitiveEntries.forEach(entry => {
            const type = entry.exerciseType ?? 'processing';
            const score = typeof entry.score === 'number' ? entry.score : (typeof entry.comprehensionScore === 'number' ? entry.comprehensionScore * 10 : 0);
            scoresByType[type].sum += score;
            scoresByType[type].count += 1;
        });
        // Calculate averages and find the lowest scoring type
        let lowestScore = 100;
        let lowestType = exerciseTypes[0];
        let highestScore = 0;
        let highestType = exerciseTypes[0];
        const averageScores = exerciseTypes.map(type => {
            const { sum, count } = scoresByType[type];
            const average = count > 0 ? sum / count : 50; // Default to middle score if no data
            if (average < lowestScore) {
                lowestScore = average;
                lowestType = type;
            }
            if (average > highestScore) {
                highestScore = average;
                highestType = type;
            }
            return {
                type,
                averageScore: average,
                count,
            };
        });
        // Generate recommendations
        const recommendations = {
            focusArea: {
                exerciseType: lowestType,
                reason: `This is your lowest scoring area with an average of ${lowestScore.toFixed(1)}`,
            },
            strengths: {
                exerciseType: highestType,
                reason: `This is your strongest area with an average of ${highestScore.toFixed(1)}`,
            },
            allScores: averageScores,
        };
        res.json(recommendations);
    }
    catch (error) {
        console.error('Error getting cognitive recommendations:', error);
        res.status(500).json({ error: 'Failed to get cognitive recommendations' });
    }
});
export default router;
