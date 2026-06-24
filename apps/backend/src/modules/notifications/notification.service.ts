import logger from '../../core/logger';
import { EmailChannel, SmsChannel, PushChannel, type INotificationChannel, type NotificationPayload, type SendReceipt } from './channels';

export class NotificationService {
  private channels: INotificationChannel[] = [];

  constructor() {
    this.channels.push(new EmailChannel(), new SmsChannel(), new PushChannel());
  }

  async send(payload: NotificationPayload, channelNames?: string[]): Promise<SendReceipt[]> {
    const targets = channelNames
      ? this.channels.filter((c) => channelNames.includes(c.channelName))
      : this.channels;

    if (targets.length === 0) {
      logger.warn(`[NotificationService] No channels available for: ${channelNames || 'all'}`);
      return [];
    }

    const results = await Promise.allSettled(
      targets.map((channel) => channel.send(payload)),
    );

    return results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      logger.error(`[NotificationService] Channel ${targets[i].channelName} failed:`, r.reason);
      return { channel: targets[i].channelName, success: false, message: String(r.reason) };
    });
  }
}

export const notificationService = new NotificationService();
