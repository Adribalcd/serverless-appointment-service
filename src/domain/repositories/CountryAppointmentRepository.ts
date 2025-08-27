import { Appointment } from '../Appointment';

export interface CountryAppointmentRepository {
  saveToCountryDB(appointment: Appointment): Promise<boolean>;
}
