import { AppointmentRequest } from '../Appointment';

export interface ValidationService {
  validateAppointmentRequest(request: AppointmentRequest): Promise<boolean>;
  validateInsuredId(insuredId: string): boolean;
  validateCountryISO(countryISO: string): boolean;
}
