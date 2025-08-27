import {
  Appointment,
  AppointmentRequest,
  AppointmentStatus,
  CountryISO,
} from '../../domain/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { NotificationService } from '../../domain/services/NotificationService';
import { ValidationService } from '../../domain/services/ValidationService';
import { ValidationError } from '../../domain/errors/DomainError';
import { v4 as uuidv4 } from 'uuid';

export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private notificationService: NotificationService,
    private validationService: ValidationService
  ) {}

  async execute(request: AppointmentRequest): Promise<{ appointmentId: string; message: string }> {
    await this.validateRequest(request);

    const appointment: Appointment = {
      appointmentId: uuidv4(),
      insuredId: request.insuredId,
      scheduleId: request.scheduleId,
      countryISO: request.countryISO,
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

  private async validateRequest(request: AppointmentRequest): Promise<void> {
    if (!this.validationService.validateInsuredId(request.insuredId)) {
      throw new ValidationError('Invalid insuredId format');
    }

    if (!this.validationService.validateCountryISO(request.countryISO)) {
      throw new ValidationError('Invalid countryISO. Must be PE or CL');
    }

    if (!request.scheduleId || request.scheduleId <= 0) {
      throw new ValidationError('Invalid scheduleId');
    }

    const isValid = await this.validationService.validateAppointmentRequest(request);
    if (!isValid) {
      throw new ValidationError('Invalid appointment request');
    }
  }
}
