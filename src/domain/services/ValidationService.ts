import { AppointmentRequestSchema } from '../validation/AppointmentSchemas';
import { AppointmentRequest } from '../Appointment';

export class ValidationService {
  validateAppointmentRequest(request: AppointmentRequest): boolean {
    const { error } = AppointmentRequestSchema.validate(request);

    if (error) {
      throw new Error(`Validacion Fallo: ${error.details[0].message}`);
    }

    return true;
  }

  validateInsuredId(insuredId: string): boolean {
    return /^\d{5}$/.test(insuredId);
  }

  validateCountryISO(countryISO: string): boolean {
    return ['PE', 'CL'].includes(countryISO);
  }
}
