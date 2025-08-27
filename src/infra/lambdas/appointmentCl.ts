import mysql from 'mysql2/promise';
import { env } from '../../config/env';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const eb = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export const main = async (event: any) => {
  console.log('Event recibido:', JSON.stringify(event, null, 2));

  const connection = await mysql.createConnection({
    host: env.MYSQL_CL_HOST,
    user: env.MYSQL_CL_USER,
    password: env.MYSQL_CL_PASSWORD,
    database: env.MYSQL_CL_DB,
  });

  try {
    for (const record of event.Records) {
      let snsWrapper: any;
      let appointment: any;

      try {
        snsWrapper = JSON.parse(record.body);

        appointment = JSON.parse(snsWrapper.Message);
      } catch (err) {
        console.error(' Error parseando el mensaje:', record.body, err);
        continue;
      }

      console.log(' Cita CL a insertar:', appointment);

      const appointmentId = appointment.appointmentId ?? null;
      const insuredId = appointment.insuredId ?? null;
      const scheduleId = appointment.scheduleId ?? null;
      const countryISO = appointment.countryISO ?? null;

      if (!appointmentId || !insuredId || !scheduleId) {
        console.warn(' Registro omitido por faltar campos obligatorios:', appointment);
        continue;
      }

      try {
        await connection.execute('INSERT INTO appointments (insuredId, scheduleId) VALUES (?, ?)', [
          insuredId,
          scheduleId,
        ]);

        console.log(' Cita insertada correctamente:', { insuredId, scheduleId, countryISO });

        await eb.send(
          new PutEventsCommand({
            Entries: [
              {
                Source: 'custom.appointment',
                DetailType: 'AppointmentConfirmed',
                Detail: JSON.stringify({
                  appointmentId,
                  insuredId,
                  scheduleId,
                  countryISO,
                  status: 'completed',
                }),
                EventBusName: process.env.EVENT_BUS_NAME || 'default',
              },
            ],
          })
        );

        console.log(' Evento de confirmación enviado a EventBridge:', { appointmentId });
      } catch (err) {
        console.error(' Error en proceso (DB o EventBridge):', err, appointment);
      }
    }
  } finally {
    await connection.end();
  }

  return { statusCode: 200 };
};
