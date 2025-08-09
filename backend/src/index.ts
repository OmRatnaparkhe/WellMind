import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// Import the new clerkMiddleware
import { clerkMiddleware } from '@clerk/express';
import drawingsRouter from './routes/drawings.js';
import checklistRouter from './routes/checklist.js';
import libraryRouter from './routes/library.js';
import musicRouter from './routes/music.js';
import historyRouter from './routes/history.js';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// --- REFACTORED AUTHENTICATION ---
// Create a router for all protected API routes
const apiRouter = express.Router();

// Use the new, single clerkMiddleware to protect all routes in this router.
// It handles both authenticating the request and protecting the route.
apiRouter.use(clerkMiddleware());

// Attach your specific routes to this now-protected router
apiRouter.use('/drawings', drawingsRouter);
apiRouter.use('/checklist', checklistRouter);
apiRouter.use('/library', libraryRouter);
apiRouter.use('/music', musicRouter);

// --- PUBLIC ROUTES (if any) ---
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Attach Clerk auth to all requests
app.use(ClerkExpressWithAuth());

// Guard: require authenticated user for all /api routes
app.use('/api', (req, res, next) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
});
app.use('/api/drawings', drawingsRouter);
app.use('/api/checklist', checklistRouter);
app.use('/api/library', libraryRouter);
app.use('/api/music', musicRouter);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`MindWell backend listening on http://localhost:${port}`);
});