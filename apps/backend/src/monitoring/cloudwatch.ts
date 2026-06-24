import { CloudWatchClient, PutMetricDataCommand, StandardUnit } from '@aws-sdk/client-cloudwatch';
import { CloudWatchLogsClient, PutLogEventsCommand, CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';
import { config } from '../config';
import logger from '../core/logger';

const cwClient = config.awsRegion ? new CloudWatchClient({ region: config.awsRegion }) : null;
const logsClient = config.awsRegion ? new CloudWatchLogsClient({ region: config.awsRegion }) : null;

let logStreamName: string;

async function ensureLogStream(logGroupName: string): Promise<string> {
  if (logStreamName) return logStreamName;
  logStreamName = `backend-${config.nodeEnv}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  try {
    await logsClient!.send(new CreateLogStreamCommand({
      logGroupName,
      logStreamName,
    }));
  } catch {
    // stream likely exists
  }
  return logStreamName;
}

export async function putMetric(name: string, value: number, unit: StandardUnit = StandardUnit.Count): Promise<void> {
  if (!config.awsRegion) return;
  try {
    await cwClient!.send(new PutMetricDataCommand({
      Namespace: 'FitCorePro',
      MetricData: [{ MetricName: name, Value: value, Unit: unit, Timestamp: new Date() }],
    }));
  } catch (err) {
    logger.warn(`[CloudWatch] Failed to put metric ${name}:`, err);
  }
}

export async function putLog(logGroupName: string, message: string): Promise<void> {
  if (!config.awsRegion) return;
  try {
    const streamName = await ensureLogStream(logGroupName);
    await logsClient!.send(new PutLogEventsCommand({
      logGroupName,
      logStreamName: streamName,
      logEvents: [{ timestamp: Date.now(), message }],
    }));
  } catch (err) {
    logger.warn(`[CloudWatch] Failed to put log:`, err);
  }
}

export function trackRequestDuration(method: string, path: string, statusCode: number, durationMs: number): void {
  putMetric('RequestDuration', durationMs, StandardUnit.Milliseconds);
  putMetric('RequestCount', 1);
  if (statusCode >= 500) putMetric('ServerErrorCount', 1);
  if (statusCode >= 400 && statusCode < 500) putMetric('ClientErrorCount', 1);
}
