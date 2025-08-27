import { Appointment } from '../Appointment';

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  updateStatus(appointmentId: string, status: Appointment['status']): Promise<void>;
  findById(appointmentId: string): Promise<Appointment | null>;
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
}
