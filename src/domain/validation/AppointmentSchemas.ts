import Joi from 'joi';

export const AppointmentRequestSchema = Joi.object({
  insuredId: Joi.string()
    .pattern(/^\d{5}$/)
    .required()
    .messages({
      'string.pattern.base': 'insuredId must be exactly 5 digits',
      'any.required': 'insuredId is required',
    }),

  scheduleId: Joi.number().integer().positive().required().messages({
    'number.positive': 'scheduleId must be a positive number',
    'any.required': 'scheduleId is required',
  }),

  countryISO: Joi.string().valid('PE', 'CL').required().messages({
    'any.only': 'countryISO must be either PE or CL',
    'any.required': 'countryISO is required',
  }),
});

export const AppointmentSQSMessageSchema = Joi.object({
  appointmentId: Joi.string().uuid().required(),

  insuredId: Joi.string()
    .pattern(/^\d{5}$/)
    .required(),

  scheduleId: Joi.number().integer().positive().required(),

  countryISO: Joi.string().valid('PE', 'CL').required(),
});
