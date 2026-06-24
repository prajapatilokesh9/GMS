import type { BaseEvent } from '../BaseEvent';
import { createWorker } from '../event-bus';
import logger from '../../core/logger';
import { notificationService } from '../../modules/notifications/notification.service';

export function startGymConsumer(): void {
  createWorker('gym', async (event: BaseEvent) => {
    switch (event.eventName) {
      case 'gym.documents_uploaded': {
        const { gymId, documentTypes } = event.payload as any;
        logger.info(`Gym ${gymId} uploaded documents: ${documentTypes.join(', ')}`);
        break;
      }
      case 'gym.verification_status_changed': {
        const { gymId, newStatus, rejectionReason } = event.payload as any;
        logger.info(`Gym ${gymId} verification status changed to ${newStatus}`);
        if (rejectionReason) logger.info(`Rejection reason: ${rejectionReason}`);
        break;
      }
      case 'gym.staff_added': {
        const { gymId, userId, roleSlug } = event.payload as any;
        logger.info(`User ${userId} added as ${roleSlug} to gym ${gymId}`);
        break;
      }
      case 'gym.staff_removed': {
        const { gymId, userId } = event.payload as any;
        logger.info(`User ${userId} removed from gym ${gymId}`);
        break;
      }
      default:
        logger.warn(`Unknown gym event: ${event.eventName}`);
    }
  });
}

export function startUserConsumer(): void {
  createWorker('user', async (event: BaseEvent) => {
    switch (event.eventName) {
      case 'user.profile_updated': {
        const { userId, changedFields } = event.payload as any;
        logger.info(`User ${userId} updated fields: ${changedFields.join(', ')}`);
        break;
      }
      default:
        logger.warn(`Unknown user event: ${event.eventName}`);
    }
  });
}

export function startNotificationConsumer(): void {
  createWorker('notification', async (event: BaseEvent) => {
    switch (event.eventName) {
      case 'notification.email.required': {
        const { to, template, data } = event.payload as any;
        const recipients = Array.isArray(to) ? to.join(', ') : to;
        logger.info(`[EmailWorker] Would send email to ${recipients} using template ${template}`);
        if (data) logger.info(`[EmailWorker] Template data: ${JSON.stringify(data)}`);
        break;
      }
      case 'notification.sms.required': {
        const { to, template } = event.payload as any;
        const recipients = Array.isArray(to) ? to.join(', ') : to;
        logger.info(`[SmsWorker] Would send SMS to ${recipients} using template ${template}`);
        break;
      }
      case 'notification.push.required': {
        const { deviceTokens, title } = event.payload as any;
        logger.info(`[PushWorker] Would send push "${title}" to ${deviceTokens.length} devices`);
        break;
      }
      default:
        logger.warn(`Unknown notification event: ${event.eventName}`);
    }
  });
}
