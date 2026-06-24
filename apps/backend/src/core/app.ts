import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { config } from '../config';
import { errorHandler } from './error-handler';
import { router } from './router';
import { setupSwagger } from './swagger';
import logger from './logger';
import { getPrisma } from '../database/prisma.service';
import { getRedis } from '../config/redis';
import { trackRequestDuration } from '../monitoring/cloudwatch';

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: config.nodeEnv,
  enabled: !!process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});

Sentry.setupExpressErrorHandler(app);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => trackRequestDuration(req.method, req.path, res.statusCode, Date.now() - start));
  next();
});

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan('short', { stream: { write: (msg) => logger.http(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

setupSwagger(app);

app.use(config.apiPrefix, router);

app.get('/health', async (_req, res) => {
  const checks: Record<string, string> = {};

  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch {
    checks.database = 'disconnected';
  }

  try {
    const redis = getRedis();
    await redis.ping();
    checks.redis = 'connected';
  } catch {
    checks.redis = 'disconnected';
  }

  const allOk = checks.database === 'connected' && checks.redis === 'connected';

  res.status(allOk ? 200 : 503).json({
    success: true,
    data: {
      status: allOk ? 'ok' : 'degraded',
      checks,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use(errorHandler);

export default app;
