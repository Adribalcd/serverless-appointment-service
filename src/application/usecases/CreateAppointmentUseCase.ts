import { Appointment, AppointmentStatus, CountryISO } from '../../domain/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { NotificationService } from '../../domain/services/NotificationService';
import { ValidationService } from '../../domain/services/ValidationService';
import { ValidationError } from '../../domain/errors/DomainError';
import { v4 as uuidv4 } from 'uuid';

export type CreateAppointmentDto = {
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
};

export type CreateAppointmentResult = {
  appointmentId: string;
  message: string;
};

export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private notificationService: NotificationService,
    private validationService: ValidationService
  ) {}

  async execute(dto: CreateAppointmentDto): Promise<CreateAppointmentResult> {
    await this.validateRequest(dto);

    const appointment: Appointment = {
      appointmentId: uuidv4(),
      insuredId: dto.insuredId,
      scheduleId: dto.scheduleId,
      countryISO: dto.countryISO as CountryISO,
      status: AppointmentStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.appointmentRepository.save(appointment);

    await this.notificationService.publishToCountry({
      appointmentId: appointment.appointmentId,
      insuredId: appointment.insuredId,
      scheduleId: appointment.scheduleId,
      countryISO: appointment.countryISO,
    });

    return {
      appointmentId: appointment.appointmentId,
      message: 'El agendamiento está en proceso',
    };
  }

  private async validateRequest(dto: CreateAppointmentDto): Promise<void> {
    if (!this.validationService.validateInsuredId(dto.insuredId)) {
      throw new ValidationError('Formato invalido para insuredId');
    }

    if (!this.validationService.validateCountryISO(dto.countryISO)) {
      throw new ValidationError('countryISO debe ser PE o CL');
    }

    if (!dto.scheduleId || dto.scheduleId <= 0) {
      throw new ValidationError('scheduleId es invalido');
    }

    const isValid = await this.validationService.validateAppointmentRequest(dto);
    if (!isValid) {
      throw new ValidationError('invalida solicitud');
    }
  }
}
