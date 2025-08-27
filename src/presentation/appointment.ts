import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { CreateAppointmentUseCase } from '../application/usecases/CreateAppointmentUseCase';
import { GetAppointmentsByInsuredUseCase } from '../application/usecases/GetAppointmentsByInsuredUseCase';
import { DynamoDBAppointmentRepository } from '../infra/repositories/DynamoDBAppointmentRepository';
import { SNSNotificationService } from '../infra/services/SNSNotificationService';
import { ValidationService } from '../infra/services/ValidationService';
import { ConfirmAppointmentUseCase } from '../application/usecases/ConfirmAppointmentUseCase';
import { EventBridgePublisher } from '../infra/events/EventBridgePublisher';

const appointmentRepository = new DynamoDBAppointmentRepository();
const notificationService = new SNSNotificationService();
const validationService = new ValidationService();
const eventPublisher = new EventBridgePublisher();

const confirmAppointmentUseCase = new ConfirmAppointmentUseCase(
  appointmentRepository,
  eventPublisher
);

export const createAppointment = new CreateAppointmentUseCase(
  appointmentRepository,
  notificationService,
  validationService
);
export const getAppointmentsByInsured = new GetAppointmentsByInsuredUseCase(
  appointmentRepository,
  validationService
);

export const createAppointmentHandler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Request body is required' }),
    };
  }

  const data = JSON.parse(event.body);
  const result = await createAppointment.execute(data);

  return {
    statusCode: 201,
    body: JSON.stringify(result),
  };
};

export const getAppointmentsByInsuredHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const insuredId = event.queryStringParameters?.insuredId;
  if (!insuredId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'insuredId es requerido' }),
    };
  }

  const result = await getAppointmentsByInsured.execute(insuredId);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};

export const processSQSConfirmationHandler = async (event: any) => {
  console.log('Procesando confirmaciones SQS:', JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      const eventBridgeMessage = JSON.parse(record.body);

      const appointmentData = eventBridgeMessage.detail;

      console.log('Datos de cita a confirmar:', appointmentData);

      await confirmAppointmentUseCase.execute(appointmentData.appointmentId);

      console.log('Cita confirmada:', appointmentData.appointmentId);
    }

    return { statusCode: 200 };
  } catch (error) {
    console.error('Error procesando confirmaciones:', error);
    throw error;
  }
};
