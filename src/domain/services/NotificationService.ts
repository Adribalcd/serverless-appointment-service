import { AppointmentRequest, AppointmentConfirmation } from '../Appointment';

export interface NotificationService {
  publishToCountry(appointment: AppointmentRequest & { appointmentId: string }): Promise<void>;
  publishConfirmation(confirmation: AppointmentConfirmation): Promise<void>;
  publishAppointmentRequested(
    appointment: AppointmentRequest & { appointmentId: string }
  ): Promise<void>;
}
