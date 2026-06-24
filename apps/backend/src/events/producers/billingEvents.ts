import { createBaseEvent } from '../BaseEvent';
import { publishEvent } from '../event-bus';

const BILLING_QUEUE = 'billing';

export async function publishBillingEvent(
  eventName: string,
  payload: Record<string, unknown>,
  context?: { tenantId?: string; userId?: string; correlationId?: string },
) {
  const event = createBaseEvent(eventName, 'billing', payload, context);
  await publishEvent(BILLING_QUEUE, event);
  return event;
}

export async function publishPaymentEvent(
  eventName: string,
  payload: Record<string, unknown>,
  context?: { tenantId?: string; userId?: string; correlationId?: string },
) {
  const event = createBaseEvent(eventName, 'payment', payload, context);
  await publishEvent(BILLING_QUEUE, event);
  return event;
}