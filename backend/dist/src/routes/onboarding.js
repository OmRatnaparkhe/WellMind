import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
const router = Router();
// Schema for consent settings
const ConsentSettingsSchema = z.object({
    dataUsage: z.boolean().default(false),
    shareClinical: z.boolean().default(false),
    receiveAlerts: z.boolean().default(true),
    storeCreativeContent: z.boolean().default(true),
    allowAnonymizedResearch: z.boolean().default(false),
});
// Schema for PHQ-9 survey
const PHQ9Schema = z.object({
    questions: z.array(z.object({
        id: z.number(),
        score: z.number().min(0).max(3),
    })).length(9),
});
// Schema for GAD-7 survey
const GAD7Schema = z.object({
    questions: z.array(z.object({
        id: z.number(),
        score: z.number().min(0).max(3),
    })).length(7),
});
// Schema for sleep survey
const SleepSurveySchema = z.object({
    qualityRating: z.number().min(1).max(10),
    hoursPerNight: z.number().min(0).max(24),
    troubleFallingAsleep: z.number().min(0).max(3),
    troubleStayingAsleep: z.number().min(0).max(3),
    feelingRested: z.number().min(0).max(3),
});
// Schema for social connectedness survey
const SocialSurveySchema = z.object({
    socialInteractions: z.number().min(0).max(3),
    feelingConnected: z.number().min(0).max(3),
    supportNetwork: z.number().min(0).max(3),
    loneliness: z.number().min(0).max(3),
});
// Get user's consent settings
router.get('/consent', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    const user = await prisma.userProfile.findUnique({
        where: { id: userId },
        select: { consentSettings: true },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.consentSettings || {});
});
// Update user's consent settings
router.post('/consent', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    try {
        const consentSettings = ConsentSettingsSchema.parse(req.body);
        const user = await prisma.userProfile.upsert({
            where: { id: userId },
            update: { consentSettings },
            create: {
                id: userId,
                email: `${userId}@clerk.local`,
                consentSettings,
            },
        });
        res.json({ success: true, consentSettings: user.consentSettings });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid consent settings', details: error.format() });
        }
        res.status(500).json({ error: 'Failed to update consent settings' });
    }
});
// Submit a survey response (PHQ-9, GAD-7, sleep, social)
router.post('/survey/:type', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    const { type } = req.params;
    try {
        let answers;
        let score = null;
        // Validate and process based on survey type
        switch (type) {
            case 'PHQ9':
                const phq9Data = PHQ9Schema.parse(req.body);
                answers = phq9Data;
                // Calculate PHQ-9 score (sum of all question scores)
                score = phq9Data.questions.reduce((sum, q) => sum + q.score, 0);
                break;
            case 'GAD7':
                const gad7Data = GAD7Schema.parse(req.body);
                answers = gad7Data;
                // Calculate GAD-7 score (sum of all question scores)
                score = gad7Data.questions.reduce((sum, q) => sum + q.score, 0);
                break;
            case 'sleep':
                const sleepData = SleepSurveySchema.parse(req.body);
                answers = sleepData;
                // Calculate sleep score (weighted average)
                score = (sleepData.qualityRating * 0.3 +
                    (sleepData.hoursPerNight >= 7 && sleepData.hoursPerNight <= 9 ? 10 : 5) * 0.3 +
                    (3 - sleepData.troubleFallingAsleep) * 0.15 +
                    (3 - sleepData.troubleStayingAsleep) * 0.15 +
                    sleepData.feelingRested * 0.1);
                break;
            case 'social':
                const socialData = SocialSurveySchema.parse(req.body);
                answers = socialData;
                // Calculate social connectedness score
                score = (socialData.socialInteractions * 0.25 +
                    socialData.feelingConnected * 0.3 +
                    socialData.supportNetwork * 0.25 +
                    (3 - socialData.loneliness) * 0.2) * (10 / 3); // Scale to 0-10
                break;
            default:
                return res.status(400).json({ error: 'Invalid survey type' });
        }
        // Create survey response
        const surveyResponse = await prisma.surveyResponse.create({
            data: {
                userId,
                surveyType: type,
                answers,
                score,
            },
        });
        // If this is part of the baseline questionnaire, update user's baseline status
        if (req.query.baseline === 'true') {
            await prisma.userProfile.update({
                where: { id: userId },
                data: { baselineCompleted: true },
            });
        }
        res.json({
            success: true,
            surveyResponse: {
                id: surveyResponse.id,
                surveyType: surveyResponse.surveyType,
                score: surveyResponse.score,
                createdAt: surveyResponse.createdAt,
            },
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid survey data', details: error.format() });
        }
        console.error('Survey submission error:', error);
        res.status(500).json({ error: 'Failed to submit survey' });
    }
});
// Get user's baseline completion status
router.get('/baseline-status', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    const user = await prisma.userProfile.findUnique({
        where: { id: userId },
        select: { baselineCompleted: true },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ baselineCompleted: user.baselineCompleted });
});
export default router;
