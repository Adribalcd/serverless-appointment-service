import { SNSMessageWrapper, AppointmentSQSMessage } from '../infra/types/LambdaTypes';

export class MessageParser {
  static parseAppointmentFromSQS(sqsBody: string): AppointmentSQSMessage {
    try {
      const snsMessage: SNSMessageWrapper = JSON.parse(sqsBody);

      const appointmentData: AppointmentSQSMessage = JSON.parse(snsMessage.Message);

      return appointmentData;
    } catch (error) {
      console.error('Error al parsear el mensaje desde SQS:', error);
      console.error('Contenido crudo de SQS:', sqsBody);
      throw new Error(`No se pudo parsear el mensaje de cita: ${error}`);
    }
  }

  static validateAppointmentMessage(data: any): AppointmentSQSMessage {
    if (!data.appointmentId || typeof data.appointmentId !== 'string') {
      throw new Error('El campo appointmentId es inválido o no está presente en el mensaje');
    }

    if (!data.insuredId || typeof data.insuredId !== 'string') {
      throw new Error('El campo insuredId es inválido o no está presente en el mensaje');
    }

    if (!data.scheduleId || typeof data.scheduleId !== 'number') {
      throw new Error('El campo scheduleId es inválido o no está presente en el mensaje');
    }

    if (!data.countryISO || !['PE', 'CL'].includes(data.countryISO)) {
      throw new Error('El campo countryISO es inválido, debe ser "PE" o "CL"');
    }

    return data as AppointmentSQSMessage;
  }
}
