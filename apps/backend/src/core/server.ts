import app from './app';
import { config } from '../config';
import logger from './logger';
import { startAuthConsumer } from '../events/consumers/authEventsConsumer';
import { startGymConsumer, startUserConsumer, startNotificationConsumer } from '../events/consumers/notificationConsumers';
import { startBillingConsumer } from '../events/consumers/billingConsumers';

async function start(): Promise<void> {
  startAuthConsumer();
  startGymConsumer();
  startUserConsumer();
  startNotificationConsumer();
  startBillingConsumer();

  app.listen(config.port, () => {
    logger.info(`FitCore Pro backend running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`API prefix: ${config.apiPrefix}`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
