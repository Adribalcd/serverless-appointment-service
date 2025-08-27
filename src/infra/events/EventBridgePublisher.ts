import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { EventPublisher } from '../../domain/events/EventPublisher';

export class EventBridgePublisher implements EventPublisher {
  private client: EventBridgeClient;
  private busName: string;

  constructor() {
    this.client = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });
    this.busName = process.env.EVENT_BUS_NAME || 'default';
  }

  async publish(eventName: string, payload: any): Promise<void> {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: 'appointment-service',
          DetailType: eventName,
          Detail: JSON.stringify(payload),
          EventBusName: this.busName,
        },
      ],
    });

    try {
      await this.client.send(command);
      console.log(`Evento enviado a EventBridge: ${eventName}`, payload);
    } catch (err) {
      console.error('Error enviando evento a EventBridge', err);
      throw err;
    }
  }
}
