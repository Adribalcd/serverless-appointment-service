import { EventPublisher } from '../../domain/events/EventPublisher';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { AppointmentStatus } from '../../domain/Appointment';

export class ConfirmAppointmentUseCase {
  constructor(
    private repository: AppointmentRepository,
    private publisher: EventPublisher
  ) {}

  async execute(appointmentId: string): Promise<void> {
    const appointment = await this.repository.findById(appointmentId);
    if (!appointment) {
      throw new Error(`No existe cita con id ${appointmentId}`);
    }

    await this.repository.updateStatus(appointmentId, AppointmentStatus.COMPLETED);

    await this.publisher.publish('AppointmentConfirmed', {
      appointmentId,
      insuredId: appointment.insuredId,
      countryISO: appointment.countryISO,
      processedAt: new Date().toISOString(),
    });
  }
}
