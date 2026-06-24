import { createWorker } from '../event-bus';
import type { BaseEvent } from '../BaseEvent';
import logger from '../../core/logger';

export function startAuthConsumer(): void {
  createWorker('auth', async (event: BaseEvent) => {
    switch (event.eventName) {
      case 'user.registered':
        logger.info(`Processing user registration event: ${event.payload.userId}`);
        break;
      case 'user.logged_in':
        logger.info(`Processing login event for user: ${event.payload.userId}`);
        break;
      case 'user.password_reset_requested':
        logger.info(`Processing password reset for user: ${event.payload.email}`);
        break;
      default:
        logger.warn(`Unknown auth event: ${event.eventName}`);
    }
  });
}
