import logger from '../../core/logger';

export interface SendReceipt {
  channel: string;
  success: boolean;
  message: string;
}

export interface NotificationPayload {
  to: string | string[];
  subject?: string;
  body: string;
  template?: string;
  data?: Record<string, unknown>;
  cc?: string[];
  bcc?: string[];
  metadata?: Record<string, unknown>;
}

export interface INotificationChannel {
  readonly channelName: string;
  send(payload: NotificationPayload): Promise<SendReceipt>;
}

export class EmailChannel implements INotificationChannel {
  readonly channelName = 'email';

  async send(payload: NotificationPayload): Promise<SendReceipt> {
    const recipients = Array.isArray(payload.to) ? payload.to.join(', ') : payload.to;
    logger.info(`[EmailChannel] Would send email to ${recipients}`);
    logger.info(`[EmailChannel] Subject: ${payload.subject || '(no subject)'}`);
    logger.info(`[EmailChannel] Template: ${payload.template || 'raw'}`);
    if (payload.data) {
      logger.info(`[EmailChannel] Data: ${JSON.stringify(payload.data)}`);
    }
    return { channel: 'email', success: true, message: `Email logged for ${recipients}` };
  }
}

export class SmsChannel implements INotificationChannel {
  readonly channelName = 'sms';

  async send(payload: NotificationPayload): Promise<SendReceipt> {
    const recipients = Array.isArray(payload.to) ? payload.to.join(', ') : payload.to;
    logger.info(`[SmsChannel] Would send SMS to ${recipients}`);
    logger.info(`[SmsChannel] Body: ${payload.body.substring(0, 160)}`);
    if (payload.data) {
      logger.info(`[SmsChannel] Data: ${JSON.stringify(payload.data)}`);
    }
    return { channel: 'sms', success: true, message: `SMS logged for ${recipients}` };
  }
}

export class PushChannel implements INotificationChannel {
  readonly channelName = 'push';

  async send(payload: NotificationPayload): Promise<SendReceipt> {
    const recipients = Array.isArray(payload.to) ? payload.to.join(', ') : payload.to;
    logger.info(`[PushChannel] Would send push notification to ${recipients}`);
    logger.info(`[PushChannel] Title: ${payload.subject || '(no title)'}`);
    if (payload.data) {
      logger.info(`[PushChannel] Data: ${JSON.stringify(payload.data)}`);
    }
    return { channel: 'push', success: true, message: `Push logged for ${recipients}` };
  }
}
