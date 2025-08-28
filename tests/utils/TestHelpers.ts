export const createMockServices = () => ({
  mockRepository: {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(),
    findByInsuredId: jest.fn(),
    updateStatus: jest.fn(),
  },
  mockNotificationService: {
    publishToCountry: jest.fn().mockResolvedValue(undefined),
    publishConfirmation: jest.fn(),
    publishAppointmentRequested: jest.fn(),
  },
  mockValidationService: {
    validateInsuredId: jest.fn(),
    validateCountryISO: jest.fn(),
    validateAppointmentRequest: jest.fn().mockResolvedValue(true),
  },
});
