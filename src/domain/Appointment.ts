export enum CountryISO {
  PE = 'PE',
  CL = 'CL',
}

export enum AppointmentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export type AppointmentRequest = {
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
};

export type Appointment = AppointmentRequest & {
  appointmentId: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentConfirmation = {
  appointmentId: string;
  status: AppointmentStatus.COMPLETED;
  processedAt: string;
};
