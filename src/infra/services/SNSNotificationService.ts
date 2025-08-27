import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { AppointmentRequest, AppointmentConfirmation, CountryISO } from '../../domain/Appointment';
import { NotificationService } from '../../domain/services/NotificationService';

export class SNSNotificationService implements NotificationService {
  private snsClient: SNSClient;
  private eventBridgeClient: EventBridgeClient;

  constructor() {
    this.snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });
    this.eventBridgeClient = new EventBridgeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async publishToCountry(
    appointment: AppointmentRequest & { appointmentId: string }
  ): Promise<void> {
    const topicArn = process.env.SNS_TOPIC_ARN;

    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(appointment),
      Subject: `Appointment Request - ${appointment.countryISO}`,
    });

    await this.snsClient.send(command);
  }

  async publishConfirmation(confirmation: AppointmentConfirmation): Promise<void> {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: 'appointment.service',
          DetailType: 'Appointment Confirmed',
          Detail: JSON.stringify(confirmation),
          EventBusName: process.env.EVENTBRIDGE_BUS,
        },
      ],
    });

    await this.eventBridgeClient.send(command);
  }
  async publishAppointmentRequested(
    appointment: AppointmentRequest & { appointmentId: string }
  ): Promise<void> {
    const topicArn =
      appointment.countryISO === 'PE' ? process.env.SNS_TOPIC_PE! : process.env.SNS_TOPIC_CL!;

    await this.snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: JSON.stringify(appointment),
        Subject: `Appointment Request - ${appointment.countryISO}`,
      })
    );
  }
}
