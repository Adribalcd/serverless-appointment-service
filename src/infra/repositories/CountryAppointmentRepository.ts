import mysql from 'mysql2/promise';
import { Appointment } from '../../domain/Appointment';
import { CountryAppointmentRepository as ICountryAppointmentRepository } from '../../domain/repositories/CountryAppointmentRepository';

export class MySQLCountryAppointmentRepository implements ICountryAppointmentRepository {
  private connectionConfig = {
    host: process.env.RDS_HOST,
    user: process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB,
    ssl: {
      rejectUnauthorized: false,
    },
  };

  async saveToCountryDB(appointment: Appointment): Promise<boolean> {
    let connection;

    try {
      connection = await mysql.createConnection(this.connectionConfig);

      const query = `
        INSERT INTO appointments 
        (appointment_id, insured_id, schedule_id, country_iso, status, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        appointment.appointmentId,
        appointment.insuredId,
        appointment.scheduleId,
        appointment.countryISO,
        appointment.status,
        appointment.createdAt,
        appointment.updatedAt,
      ];

      await connection.execute(query, values);
      return true;
    } catch (error) {
      console.error('Error saving to country DB:', error);
      return false;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
