import { CountryProcessorFactory } from '../../domain/factories/CountryProcessorFactory';

export const main = async (event: any) => {
  console.log('Event recibido:', JSON.stringify(event, null, 2));

  const processor = CountryProcessorFactory.create('PE');

  try {
    for (const record of event.Records) {
      const appointment = await parseAppointmentFromRecordPe(record);
      if (appointment) {
        await processor.process(appointment);
      }
    }
  } catch (error) {
    console.error('Error procesando citas PE:', error);
    throw error;
  }

  return { statusCode: 200 };
};

async function parseAppointmentFromRecordPe(record: any) {
  try {
    const snsWrapper = JSON.parse(record.body);
    const appointment = JSON.parse(snsWrapper.Message);

    if (!appointment.appointmentId || !appointment.insuredId || !appointment.scheduleId) {
      console.warn(' Registro omitido por faltar campos obligatorios:', appointment);
      return null;
    }

    return appointment;
  } catch (err) {
    console.error(' Error parseando mensaje:', record.body, err);
    return null;
  }
}
