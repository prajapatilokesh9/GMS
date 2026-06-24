import { v4 as uuidv4 } from 'uuid';

export interface BaseEvent {
  id: string;
  eventName: string;
  eventVersion: number;
  eventCategory: string;
  source: string;
  correlationId: string;
  causationId?: string;
  tenantId?: string;
  userId?: string;
  timestamp: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function createBaseEvent(
  eventName: string,
  category: string,
  payload: Record<string, unknown>,
  context?: { tenantId?: string; userId?: string; correlationId?: string },
): BaseEvent {
  return {
    id: uuidv4(),
    eventName,
    eventVersion: 1,
    eventCategory: category,
    source: 'fitcore.backend',
    correlationId: context?.correlationId || uuidv4(),
    tenantId: context?.tenantId,
    userId: context?.userId,
    timestamp: new Date().toISOString(),
    payload,
  };
}
