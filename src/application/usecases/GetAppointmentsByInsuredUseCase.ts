import { Appointment } from '../../domain/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { ValidationService } from '../../domain/services/ValidationService';
import { ValidationError } from '../../domain/errors/DomainError';
import { ErrorMessages } from '../../domain/constants/ErrorMessages';

export type GetAppointmentsByInsuredDto = {
  insuredId: string;
};

export class GetAppointmentsByInsuredUseCase {
  constructor(
    private repository: AppointmentRepository,
    private validationService: ValidationService
  ) {}

  async execute(dto: GetAppointmentsByInsuredDto): Promise<Appointment[]> {
    if (!dto.insuredId) {
      throw new ValidationError(ErrorMessages.VALIDATION.REQUIRED_INSURED_ID);
    }

    if (!this.validationService.validateInsuredId(dto.insuredId)) {
      throw new ValidationError(ErrorMessages.VALIDATION.INVALID_INSURED_ID);
    }

    const appointments = await this.repository.findByInsuredId(dto.insuredId);

    return appointments || [];
  }
}
