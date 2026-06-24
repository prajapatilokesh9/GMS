import { createBaseEvent } from '../BaseEvent';
import { publishEvent } from '../event-bus';

const GYM_QUEUE = 'gym';
const USER_QUEUE = 'user';
const NOTIFICATION_QUEUE = 'notification';

export async function publishUserProfileUpdatedEvent(
  userId: string,
  tenantId: string,
  changedFields: string[],
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>,
) {
  const event = createBaseEvent(
    'user.profile_updated',
    'user',
    { userId, changedFields, oldValues, newValues },
    { tenantId, userId },
  );
  await publishEvent(USER_QUEUE, event);
  return event;
}

export async function publishGymDocumentsUploadedEvent(
  gymId: string,
  tenantId: string,
  documentTypes: string[],
  uploadedBy: string,
) {
  const event = createBaseEvent(
    'gym.documents_uploaded',
    'gym',
    { gymId, documentTypes, uploadedBy },
    { tenantId, userId: uploadedBy },
  );
  await publishEvent(GYM_QUEUE, event);
  return event;
}

export async function publishGymVerificationStatusChangedEvent(
  gymId: string,
  tenantId: string,
  oldStatus: string,
  newStatus: string,
  reviewerId: string,
  rejectionReason?: string,
) {
  const event = createBaseEvent(
    'gym.verification_status_changed',
    'gym',
    { gymId, oldStatus, newStatus, reviewerId, rejectionReason },
    { tenantId, userId: reviewerId },
  );
  await publishEvent(GYM_QUEUE, event);
  return event;
}

export async function publishGymStaffAddedEvent(
  gymId: string,
  tenantId: string,
  userId: string,
  roleSlug: string,
  addedBy: string,
) {
  const event = createBaseEvent(
    'gym.staff_added',
    'gym',
    { gymId, userId, roleSlug, addedBy },
    { tenantId, userId },
  );
  await publishEvent(GYM_QUEUE, event);
  return event;
}

export async function publishGymStaffRemovedEvent(
  gymId: string,
  tenantId: string,
  userId: string,
  removedBy: string,
) {
  const event = createBaseEvent(
    'gym.staff_removed',
    'gym',
    { gymId, userId, removedBy },
    { tenantId, userId: removedBy },
  );
  await publishEvent(GYM_QUEUE, event);
  return event;
}

export async function publishNotificationEmailRequired(
  to: string[],
  template: string,
  data: Record<string, unknown>,
  correlationId: string,
  cc?: string[],
  bcc?: string[],
) {
  const event = createBaseEvent(
    'notification.email.required',
    'notification',
    { to, template, data, cc, bcc },
    { correlationId },
  );
  await publishEvent(NOTIFICATION_QUEUE, event);
  return event;
}

export async function publishNotificationSmsRequired(
  to: string[],
  template: string,
  data: Record<string, unknown>,
  correlationId: string,
) {
  const event = createBaseEvent(
    'notification.sms.required',
    'notification',
    { to, template, data },
    { correlationId },
  );
  await publishEvent(NOTIFICATION_QUEUE, event);
  return event;
}

export async function publishNotificationPushRequired(
  deviceTokens: string[],
  title: string,
  body: string,
  data: Record<string, unknown>,
  correlationId: string,
) {
  const event = createBaseEvent(
    'notification.push.required',
    'notification',
    { deviceTokens, title, body, data },
    { correlationId },
  );
  await publishEvent(NOTIFICATION_QUEUE, event);
  return event;
}
