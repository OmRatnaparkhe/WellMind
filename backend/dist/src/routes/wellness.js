import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { startOfWeek, endOfWeek, addDays, startOfDay } from 'date-fns';
const router = Router();
// Helper function to get the start of the week
function getWeekStart(date = new Date()) {
    return startOfWeek(date, { weekStartsOn: 1 }); // Week starts on Monday
}
// Helper function to get the end of the week
function getWeekEnd(date = new Date()) {
    return endOfWeek(date, { weekStartsOn: 1 }); // Week ends on Sunday
}
// Calculate and store wellness score (only Mood, Cognitive, Daily Checklist)
async function calculateWellnessScore(userId, weekOf) {
    const weekStart = getWeekStart(weekOf);
    const weekEnd = getWeekEnd(weekOf);
    // 1) Mood: average (1-10) → percentage
    const moodEntries = await prisma.moodEntry.findMany({
        where: {
            userId,
            createdAt: { gte: weekStart, lte: weekEnd },
        },
    });
    const moodAvg10 = moodEntries.length > 0
        ? moodEntries.reduce((sum, e) => sum + e.score, 0) / moodEntries.length
        : 5; // neutral
    const moodScore = Math.max(0, Math.min(100, Math.round(moodAvg10 * 10)));
    // 2) Cognitive: prefer `score` (0-100). If missing, fallback to `comprehensionScore` (0-10) → percentage
    const cognitiveEntries = await prisma.cognitiveEntry.findMany({
        where: {
            userId,
            createdAt: { gte: weekStart, lte: weekEnd },
        },
    });
    let cognitiveScore = 50; // neutral default
    if (cognitiveEntries.length > 0) {
        const pctScores = cognitiveEntries.map((e) => {
            if (typeof e.score === 'number')
                return e.score;
            if (typeof e.comprehensionScore === 'number')
                return e.comprehensionScore * 10;
            return 50;
        });
        const avg = pctScores.reduce((a, b) => a + b, 0) / pctScores.length;
        cognitiveScore = Math.max(0, Math.min(100, Math.round(avg)));
    }
    // 2.5) Weekly Quiz: use this week's quizResponse (percentage 0-100) if exists
    const weeklyQuiz = await prisma.quiz.findFirst({
        where: { type: 'weekly', createdAt: { gte: weekStart, lte: weekEnd } },
    });
    let weeklyQuizScore = 50;
    if (weeklyQuiz) {
        const resp = await prisma.quizResponse.findFirst({
            where: { userId, quizId: weeklyQuiz.id },
            orderBy: { createdAt: 'desc' },
            select: { score: true },
        });
        if (typeof resp?.score === 'number')
            weeklyQuizScore = Math.max(0, Math.min(100, Math.round(resp.score)));
    }
    // 3) Daily Checklist: use three measured tasks from dashboard (describedDay, videoSummary, readBook)
    const checklists = await prisma.dailyChecklist.findMany({
        where: {
            userId,
            date: { gte: startOfDay(weekStart), lte: startOfDay(weekEnd) },
        },
    });
    // Map date string (yyyy-mm-dd) → record
    const dateKey = (d) => startOfDay(d).toISOString();
    const checklistByDay = new Map();
    for (const c of checklists)
        checklistByDay.set(dateKey(c.date), c);
    let checklistScores = [];
    for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        if (day > weekEnd)
            break;
        const key = dateKey(day);
        const rec = checklistByDay.get(key);
        const tasks = [rec?.describedDay, rec?.videoSummary, rec?.readBook];
        const completed = tasks.filter(Boolean).length;
        const pct = Math.round((completed / 3) * 100);
        checklistScores.push(pct);
    }
    const checklistScore = checklistScores.length > 0
        ? Math.round(checklistScores.reduce((a, b) => a + b, 0) / checklistScores.length)
        : 0;
    // Overall percentage with weights: Mood 35%, Cognitive 25%, Checklist 25%, Weekly Quiz 15%
    const overallScore = Math.round(moodScore * 0.35 +
        cognitiveScore * 0.25 +
        checklistScore * 0.25 +
        weeklyQuizScore * 0.15);
    // Simple recommendations tied to these three pillars
    const recommendations = [];
    if (moodScore < 50)
        recommendations.push('Try a quick mood check-in and a short gratitude note today.');
    if (cognitiveScore < 50)
        recommendations.push('Do one focused cognitive exercise to boost attention.');
    if (checklistScore < 50)
        recommendations.push('Aim to complete at least two checklist items today.');
    if (weeklyQuizScore < 50)
        recommendations.push('Take the weekly check-in to get personalized recommendations.');
    // Persist. Schema still has legacy fields; store only what we use and zero the rest.
    const wellnessScore = await prisma.wellnessScore.upsert({
        where: {
            userId_weekOf: {
                userId,
                weekOf: weekStart,
            },
        },
        update: {
            overallScore,
            moodScore,
            cognitiveScore,
            // Reuse sleepScore column to store checklist score; reuse socialScore to store weekly quiz score
            sleepScore: checklistScore,
            socialScore: weeklyQuizScore,
            // Legacy/unused fields set to 0
            stressScore: 0,
            recommendations,
        },
        create: {
            userId,
            weekOf: weekStart,
            overallScore,
            moodScore,
            cognitiveScore,
            sleepScore: checklistScore,
            stressScore: 0,
            socialScore: weeklyQuizScore,
            recommendations,
        },
    });
    return wellnessScore;
}
// Get current week's wellness score
router.get('/current', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const weekStart = getWeekStart();
        // Always recalculate to avoid stale data
        const wellnessScore = await calculateWellnessScore(userId, new Date());
        res.json(wellnessScore);
    }
    catch (error) {
        console.error('Error getting wellness score:', error);
        res.status(500).json({ error: 'Failed to get wellness score' });
    }
});
// Get wellness score history
router.get('/history', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const wellnessScores = await prisma.wellnessScore.findMany({
            where: { userId },
            orderBy: { weekOf: 'desc' },
            take: limit,
        });
        res.json(wellnessScores);
    }
    catch (error) {
        console.error('Error getting wellness score history:', error);
        res.status(500).json({ error: 'Failed to get wellness score history' });
    }
});
// Manually trigger wellness score calculation
router.post('/calculate', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const date = req.body.date ? new Date(req.body.date) : new Date();
        const wellnessScore = await calculateWellnessScore(userId, date);
        res.json(wellnessScore);
    }
    catch (error) {
        console.error('Error calculating wellness score:', error);
        res.status(500).json({ error: 'Failed to calculate wellness score' });
    }
});
export default router;
