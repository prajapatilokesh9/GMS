import { Queue, Worker } from 'bullmq';
import { getRedis } from '../config/redis';
import type { BaseEvent } from './BaseEvent';
import logger from '../core/logger';

const DLQ_SUFFIX = '.dlq';

const DEFAULT_QUEUE_OPTIONS = {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600 * 24 },
    removeOnFail: { age: 3600 * 24 * 7 },
  },
};

const queues = new Map<string, Queue>();
const dlqQueues = new Map<string, Queue>();

function getQueue(name: string): Queue {
  if (!queues.has(name)) {
    const queue = new Queue(name, {
      connection: getRedis() as any,
      ...DEFAULT_QUEUE_OPTIONS,
    });
    queues.set(name, queue);
  }
  return queues.get(name)!;
}

function getDLQQueue(name: string): Queue {
  const dlqName = name + DLQ_SUFFIX;
  if (!dlqQueues.has(name)) {
    const queue = new Queue(dlqName, {
      connection: getRedis() as any,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: { age: 3600 * 24 * 30 },
        removeOnFail: { age: 3600 * 24 * 30 },
      },
    });
    dlqQueues.set(name, queue);
  }
  return dlqQueues.get(name)!;
}

export async function publishEvent(queueName: string, event: BaseEvent): Promise<void> {
  const queue = getQueue(queueName);
  await queue.add(event.eventName, event, {
    jobId: event.id,
  });
  logger.debug(`Event published: ${event.eventName} -> ${queueName} [${event.id}]`);
}

export function createWorker(
  queueName: string,
  handler: (event: BaseEvent) => Promise<void>,
): Worker {
  const worker = new Worker(
    queueName,
    async (job) => {
      const event = job.data as BaseEvent;
      logger.info(`Processing event: ${event.eventName} [${event.id}]`);
      await handler(event);
    },
    { connection: getRedis() as any },
  );

  worker.on('completed', (job) => {
    logger.debug(`Event completed: ${job!.name} [${job!.id}]`);
  });

  worker.on('failed', async (job, err) => {
    logger.error(`Event failed: ${job!.name} [${job!.id}]: ${err.message}`);
    const dlq = getDLQQueue(queueName);
    await dlq.add(job!.name, job!.data, {
      jobId: job!.id + '_' + Date.now(),
    });
    logger.warn(`Event moved to DLQ: ${job!.name} [${job!.id}] -> ${queueName}${DLQ_SUFFIX}`);
  });

  return worker;
}

export async function getDLQJobs(queueName: string): Promise<unknown[]> {
  const dlq = getDLQQueue(queueName);
  const jobs = await dlq.getJobs();
  return jobs.map((j) => ({
    id: j.id,
    name: j.name,
    timestamp: j.timestamp,
    data: j.data,
    failedReason: j.failedReason,
    attemptsMade: j.attemptsMade,
  }));
}

export async function requeueDLQJob(queueName: string, jobId: string): Promise<boolean> {
  const dlq = getDLQQueue(queueName);
  const job = await dlq.getJob(jobId);
  if (!job) return false;
  const event = job.data as BaseEvent;
  const original = getQueue(queueName);
  await original.add(job.name, event, { jobId: event.id });
  await dlq.remove(jobId);
  logger.info(`Event re-queued from DLQ: ${job.name} -> ${queueName}`);
  return true;
}

export async function listQueues(): Promise<string[]> {
  return Array.from(queues.keys());
}

export async function closeQueues(): Promise<void> {
  for (const queue of queues.values()) {
    await queue.close();
  }
  queues.clear();
  for (const queue of dlqQueues.values()) {
    await queue.close();
  }
  dlqQueues.clear();
}
