export const ErrorMessages = {
  VALIDATION: {
    INVALID_INSURED_ID: 'El ID del asegurado debe tener exactamente 5 dígitos numéricos',
    INVALID_COUNTRY: 'El código de país debe ser PE (Perú) o CL (Chile)',
    INVALID_SCHEDULE_ID: 'El ID del horario debe ser un número positivo mayor a cero',
    INVALID_REQUEST: 'Los datos proporcionados no cumplen con los requisitos del sistema',
    REQUIRED_INSURED_ID: 'El parámetro insuredId es requerido',
  },
  HTTP: {
    MISSING_BODY: 'El cuerpo de la solicitud es requerido',
    INTERNAL_ERROR:
      'Ha ocurrido un error inesperado en el servidor. Por favor, inténtelo nuevamente.',
  },
} as const;
