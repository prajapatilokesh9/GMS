import { Request, Response, NextFunction } from 'express';
import { getDLQJobs, requeueDLQJob, listQueues } from '../../events/event-bus';

async function listDLQ(req: Request, res: Response, next: NextFunction) {
  try {
    const queueName = req.params.queue;
    const jobs = await getDLQJobs(queueName);
    res.json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
}

async function requeue(req: Request, res: Response, next: NextFunction) {
  try {
    const { queue, jobId } = req.params;
    const ok = await requeueDLQJob(queue, jobId);
    if (!ok) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'DLQ job not found' } });
      return;
    }
    res.json({ success: true, data: { message: 'Job re-queued' } });
  } catch (err) {
    next(err);
  }
}

async function listAllQueues(_req: Request, res: Response, next: NextFunction) {
  try {
    const queues = await listQueues();
    res.json({ success: true, data: queues });
  } catch (err) {
    next(err);
  }
}

export const eventsController = { listDLQ, requeue, listAllQueues };
