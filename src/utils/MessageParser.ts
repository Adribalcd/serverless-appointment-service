import { SNSMessageWrapper, AppointmentSQSMessage } from '../infra/types/LambdaTypes';
import { AppointmentSQSMessageSchema } from '../domain/validation/AppointmentSchemas';

export class MessageParser {
  static parseAppointmentFromSQS(sqsBody: string): AppointmentSQSMessage {
    try {
      const snsMessage: SNSMessageWrapper = JSON.parse(sqsBody);
      const appointmentData = JSON.parse(snsMessage.Message);

      const { error, value } = AppointmentSQSMessageSchema.validate(appointmentData);

      if (error) {
        throw new Error(`Mensaje de cita inválido: ${error.details[0].message}`);
      }

      return value as AppointmentSQSMessage;
    } catch (error) {
      console.error('Error parseando mensaje desde SQS:', error);
      console.error('Cuerpo SQS sin procesar:', sqsBody);
      throw new Error(`Falló al parsear mensaje de cita: ${error}`);
    }
  }

  static validateAppointmentMessage(data: any): AppointmentSQSMessage {
    const { error, value } = AppointmentSQSMessageSchema.validate(data);

    if (error) {
      throw new Error(`Validación falló: ${error.details[0].message}`);
    }

    return value;
  }
}
