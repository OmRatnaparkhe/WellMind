import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
const router = Router();
function startOfDayUTC(date = new Date()) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    return d;
}
router.get('/today', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    const today = startOfDayUTC();
    let checklist = await prisma.dailyChecklist.findUnique({ where: { userId_date: { userId, date: today } } });
    if (!checklist) {
        await prisma.userProfile.upsert({ where: { id: userId }, update: {}, create: { id: userId, email: `${userId}@clerk.local` } });
        checklist = await prisma.dailyChecklist.create({ data: { userId, date: today } });
    }
    res.json(checklist);
});
router.post('/complete', async (req, res) => {
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId;
    const { task } = req.body;
    if (!task)
        return res.status(400).json({ error: 'task required' });
    const today = startOfDayUTC();
    const updated = await prisma.dailyChecklist.upsert({
        where: { userId_date: { userId, date: today } },
        update: { [task]: true },
        create: { userId, date: today, [task]: true },
    });
    res.json(updated);
});
export default router;
