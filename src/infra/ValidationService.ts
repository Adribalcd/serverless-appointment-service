import { ValidationService as IValidationService } from '../domain/services/ValidationService';
import { AppointmentRequest, CountryISO } from '../domain/Appointment';

export class ValidationService implements IValidationService {
  async validateAppointmentRequest(request: AppointmentRequest): Promise<boolean> {
    // Validaciones de negocio adicionales
    // Asumo que siempre es válido para este ejemplo
    return true;
  }

  validateInsuredId(insuredId: string): boolean {
    const regex = /^\d{5}$/;
    return regex.test(insuredId);
  }

  validateCountryISO(countryISO: string): boolean {
    return Object.values(CountryISO).includes(countryISO as CountryISO);
  }
}
