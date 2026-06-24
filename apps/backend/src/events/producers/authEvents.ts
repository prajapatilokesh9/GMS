import { createBaseEvent, type BaseEvent } from '../BaseEvent';
import { publishEvent } from '../event-bus';

const AUTH_QUEUE = 'auth';

export async function publishUserRegisteredEvent(
  userId: string,
  email: string,
  tenantId: string,
): Promise<BaseEvent> {
  const event = createBaseEvent(
    'user.registered',
    'auth',
    { userId, email },
    { tenantId, userId },
  );
  await publishEvent(AUTH_QUEUE, event);
  return event;
}

export async function publishUserLoggedInEvent(
  userId: string,
  tenantId: string,
): Promise<BaseEvent> {
  const event = createBaseEvent(
    'user.logged_in',
    'auth',
    { userId },
    { tenantId, userId },
  );
  await publishEvent(AUTH_QUEUE, event);
  return event;
}

export async function publishPasswordResetEvent(
  userId: string,
  email: string,
  tenantId: string,
): Promise<BaseEvent> {
  const event = createBaseEvent(
    'user.password_reset_requested',
    'auth',
    { userId, email },
    { tenantId, userId },
  );
  await publishEvent(AUTH_QUEUE, event);
  return event;
}
