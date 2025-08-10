import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// Import the new clerkMiddleware
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import drawingsRouter from './routes/drawings.js';
import checklistRouter from './routes/checklist.js';
import libraryRouter from './routes/library.js';
import musicRouter from './routes/music.js';
import historyRouter from './routes/history.js';
import moodRouter from './routes/mood.js';
import journalRouter from './routes/journal';
import cognitiveRouter from './routes/cognitive';
import quizRouter from './routes/quiz.js';
import onboardingRouter from './routes/onboarding';
import wellnessRouter from './routes/wellness';
import alertsRouter from './routes/alerts';
const app = express();
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
// CORS: reflect request origin so credentials work across dev hosts
app.use(cors({
    origin: (_origin, callback) => callback(null, true),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Respond to CORS preflight before auth middleware blocks it
app.use((req, res, next) => {
    if (req.method === 'OPTIONS')
        return res.sendStatus(204);
    next();
});
// --- REFACTORED AUTHENTICATION ---
// Create a router for all protected API routes
const apiRouter = express.Router();
// Use the new, single clerkMiddleware to protect all routes in this router.
// It handles both authenticating the request and protecting the route.
apiRouter.use(ClerkExpressRequireAuth());
// --- PUBLIC ROUTES (if any) ---
app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});
// Attach Clerk auth to all requests, but allow health and library public endpoints unauthenticated
app.use((req, res, next) => {
    const openPaths = [
        '/api/health',
        '/api/library/public',
    ];
    if (req.method === 'GET' && (req.path === '/api/health' || req.path.startsWith('/api/library/public'))) {
        return next();
    }
    return ClerkExpressRequireAuth()(req, res, next);
});
// Guard: require authenticated user for secured /api routes
app.use('/api', (req, res, next) => {
    if (req.method === 'GET' && req.path.startsWith('/library/public'))
        return next();
    const auth = req.auth;
    if (!auth?.userId)
        return res.status(401).json({ error: 'Unauthorized' });
    next();
});
app.use('/api/drawings', drawingsRouter);
app.use('/api/checklist', checklistRouter);
app.use('/api/library', libraryRouter);
app.use('/api/music', musicRouter);
// Mount history API so /api/history works
app.use('/api/history', historyRouter);
app.use('/api/mood', moodRouter);
app.use('/api/journal', journalRouter);
app.use('/api/cognitive', cognitiveRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/wellness', wellnessRouter);
app.use('/api/alerts', alertsRouter);
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
    console.log(`MindWell backend listening on http://localhost:${port}`);
});
