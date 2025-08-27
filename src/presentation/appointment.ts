import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { CreateAppointmentUseCase } from '../application/usecases/CreateAppointmentUseCase';
import { GetAppointmentsByInsuredUseCase } from '../application/usecases/GetAppointmentsByInsuredUseCase';
import { DynamoDBAppointmentRepository } from '../infra/repositories/DynamoDBAppointmentRepository';
import { SNSNotificationService } from '../infra/services/SNSNotificationService';
import { ValidationService } from '../infra/ValidationService';

const appointmentRepository = new DynamoDBAppointmentRepository();
const notificationService = new SNSNotificationService();
const validationService = new ValidationService();

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
      body: JSON.stringify({ error: 'insuredId is required' }),
    };
  }

  const result = await getAppointmentsByInsured.execute(insuredId);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
