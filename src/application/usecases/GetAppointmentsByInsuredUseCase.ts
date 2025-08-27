import { Appointment } from '../../domain/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { ValidationService } from '../../domain/services/ValidationService';
import { ValidationError } from '../../domain/errors/DomainError';

export class GetAppointmentsByInsuredUseCase {
  constructor(
    private repository: AppointmentRepository,
    private validationService: ValidationService
  ) {}

  async execute(insuredId: string): Promise<Appointment[]> {
    if (!insuredId) {
      throw new ValidationError('insuredId es requerido');
    }

    if (!this.validationService.validateInsuredId(insuredId)) {
      throw new ValidationError('Invalid insuredId format');
    }

    const appointments = await this.repository.findByInsuredId(insuredId);

    return appointments || [];
  }
}
