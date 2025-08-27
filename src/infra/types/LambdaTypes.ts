export interface SNSMessageWrapper {
  Message: string;
  MessageId: string;
  Subject?: string;
  Timestamp: string;
  TopicArn: string;
  Type: string;
}

export interface AppointmentSQSMessage {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
}
