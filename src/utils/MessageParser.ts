import { SNSMessageWrapper, AppointmentSQSMessage } from '../infra/types/LambdaTypes';

export class MessageParser {
  static parseAppointmentFromSQS(sqsBody: string): AppointmentSQSMessage {
    try {
      // First parse the SQS body (contains SNS message)
      const snsMessage: SNSMessageWrapper = JSON.parse(sqsBody);

      // Then parse the actual message content
      const appointmentData: AppointmentSQSMessage = JSON.parse(snsMessage.Message);

      return appointmentData;
    } catch (error) {
      console.error('Error parsing message from SQS:', error);
      console.error('Raw SQS body:', sqsBody);
      throw new Error(`Failed to parse appointment message: ${error}`);
    }
  }

  static validateAppointmentMessage(data: any): AppointmentSQSMessage {
    if (!data.appointmentId || typeof data.appointmentId !== 'string') {
      throw new Error('Invalid appointmentId in message');
    }

    if (!data.insuredId || typeof data.insuredId !== 'string') {
      throw new Error('Invalid insuredId in message');
    }

    if (!data.scheduleId || typeof data.scheduleId !== 'number') {
      throw new Error('Invalid scheduleId in message');
    }

    if (!data.countryISO || !['PE', 'CL'].includes(data.countryISO)) {
      throw new Error('Invalid countryISO in message');
    }

    return data as AppointmentSQSMessage;
  }
}
