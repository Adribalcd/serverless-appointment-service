import { CountryProcessor, AppointmentData } from '../interfaces/CountryProcessor';
import mysql from 'mysql2/promise';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { env } from '../../config/env';

export class ClProcessor implements CountryProcessor {
  private eb = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

  async process(appointment: AppointmentData): Promise<void> {
    const connection = await mysql.createConnection({
      host: env.MYSQL_CL_HOST,
      user: env.MYSQL_CL_USER,
      password: env.MYSQL_CL_PASSWORD,
      database: env.MYSQL_CL_DB,
    });

    try {
      // Lógica específica de Chile (puedes agregar validaciones específicas aquí)
      await this.insertAppointment(connection, appointment);
      await this.sendConfirmationEvent(appointment);

      console.log('✅ Cita CL procesada correctamente:', appointment);
    } finally {
      await connection.end();
    }
  }

  private async insertAppointment(connection: any, appointment: AppointmentData): Promise<void> {
    await connection.execute('INSERT INTO appointments (insuredId, scheduleId) VALUES (?, ?)', [
      appointment.insuredId,
      appointment.scheduleId,
    ]);
  }

  private async sendConfirmationEvent(appointment: AppointmentData): Promise<void> {
    await this.eb.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: 'custom.appointment',
            DetailType: 'AppointmentConfirmed',
            Detail: JSON.stringify({
              ...appointment,
              status: 'completed',
            }),
            EventBusName: process.env.EVENT_BUS_NAME || 'default',
          },
        ],
      })
    );
  }
}
