export interface CountryProcessor {
  process(appointment: AppointmentData): Promise<void>;
}

export interface AppointmentData {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
}
