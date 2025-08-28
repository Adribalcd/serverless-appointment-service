import {
  AppointmentRequestSchema,
  AppointmentSQSMessageSchema,
} from '../../domain/validation/AppointmentSchemas';
import { AppointmentRequest } from '../../domain/Appointment';
import { ValidationService as IValidationService } from '../../domain/services/ValidationService';
import Joi from 'joi';

export class ValidationService implements IValidationService {
  validateAppointmentRequest(request: AppointmentRequest): boolean {
    const { error } = AppointmentRequestSchema.validate(request);

    if (error) {
      throw new Error(`Error de validacion: ${error.details[0].message}`);
    }

    return true;
  }

  validateInsuredId(insuredId: string): boolean {
    const schema = Joi.string().pattern(/^\d{5}$/);
    const { error } = schema.validate(insuredId);

    if (error) {
      throw new Error('insuredId debe tener 5 digitos');
    }

    return true;
  }

  validateCountryISO(countryISO: string): boolean {
    const schema = Joi.string().valid('PE', 'CL');
    const { error } = schema.validate(countryISO);

    if (error) {
      throw new Error('countryISO debe ser PE o CL');
    }

    return true;
  }

  validateSQSMessage(message: any): boolean {
    const { error } = AppointmentSQSMessageSchema.validate(message);

    if (error) {
      throw new Error(`Error de validacion en SQS: ${error.details[0].message}`);
    }

    return true;
  }

  validateAWSRegion(region: string): boolean {
    const validRegions = ['us-east-1', 'us-west-2', 'eu-west-1'];
    if (!validRegions.includes(region)) {
      throw new Error(`Invalid AWS region: ${region}`);
    }
    return true;
  }

  validateEnvironmentVariables(): boolean {
    const requiredVars = ['APPOINTMENT_TABLE', 'SNS_TOPIC_ARN', 'EVENT_BUS_NAME'];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }

    return true;
  }
}
