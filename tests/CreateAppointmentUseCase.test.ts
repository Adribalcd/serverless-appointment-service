import { CreateAppointmentUseCase } from '../src/application/usecases/CreateAppointmentUseCase';
import { AppointmentRepository } from '../src/domain/repositories/AppointmentRepository';
import { NotificationService } from '../src/domain/services/NotificationService';
import { ValidationService } from '../src/domain/services/ValidationService';
import { AppointmentRequest, CountryISO } from '../src/domain/Appointment';

// Mocks
const mockRepository: jest.Mocked<AppointmentRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByInsuredId: jest.fn(),
  updateStatus: jest.fn(),
};

const mockNotificationService: jest.Mocked<NotificationService> = {
  publishToCountry: jest.fn().mockResolvedValue(undefined),
  publishConfirmation: jest.fn().mockResolvedValue(undefined),
  publishAppointmentRequested: jest.fn().mockResolvedValue(undefined),
};

const mockValidationService: jest.Mocked<ValidationService> = {
  validateInsuredId: jest.fn(),
  validateCountryISO: jest.fn(),
  validateAppointmentRequest: jest.fn(),
};

describe('CreateAppointmentUseCase', () => {
  let useCase: CreateAppointmentUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateAppointmentUseCase(
      mockRepository,
      mockNotificationService,
      mockValidationService
    );
  });

  it('crea una cita válida y la guarda', async () => {
    const request: AppointmentRequest = {
      insuredId: '12345678', // válido
      scheduleId: 1,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(true);
    mockValidationService.validateAppointmentRequest.mockResolvedValue(true);

    const result = await useCase.execute(request);

    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockNotificationService.publishToCountry).toHaveBeenCalled();
    expect(result).toHaveProperty('appointmentId');
    expect(result.message).toBe('El agendamiento está en proceso');
  });

  it('lanza error si insuredId es inválido', async () => {
    const request: AppointmentRequest = {
      insuredId: '', // inválido
      scheduleId: 1,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(false);

    await expect(useCase.execute(request)).rejects.toThrow('Invalid insuredId format');
  });
});
