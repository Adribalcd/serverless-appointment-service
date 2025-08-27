import { CreateAppointmentUseCase } from '../src/application/usecases/CreateAppointmentUseCase';
import { AppointmentRepository } from '../src/domain/repositories/AppointmentRepository';
import { NotificationService } from '../src/domain/services/NotificationService';
import { ValidationService } from '../src/domain/services/ValidationService';
import { AppointmentRequest, CountryISO } from '../src/domain/Appointment';

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
      insuredId: '12345',
      scheduleId: 1,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(true);
    mockValidationService.validateAppointmentRequest.mockReturnValue(true);

    const result = await useCase.execute(request);

    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockNotificationService.publishToCountry).toHaveBeenCalled();
    expect(result).toHaveProperty('appointmentId');
    expect(result.message).toBe('El agendamiento está en proceso');
  });

  it('lanza error si insuredId es inválido', async () => {
    const request: AppointmentRequest = {
      insuredId: '',
      scheduleId: 1,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(false);
    await expect(useCase.execute(request)).rejects.toThrow('Invalid insuredId format');
  });

  it('lanza error si countryISO es inválido', async () => {
    const request: AppointmentRequest = {
      insuredId: '12345',
      scheduleId: 1,
      countryISO: 'AR' as CountryISO,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(false);

    await expect(useCase.execute(request)).rejects.toThrow('Invalid countryISO. Must be PE or CL');
  });

  it('lanza error si scheduleId es inválido', async () => {
    const request: AppointmentRequest = {
      insuredId: '12345',
      scheduleId: 0,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(true);

    await expect(useCase.execute(request)).rejects.toThrow('Invalid scheduleId');
  });

  it('lanza error si validateAppointmentRequest falla', async () => {
    const request: AppointmentRequest = {
      insuredId: '12345',
      scheduleId: 1,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(true);
    mockValidationService.validateAppointmentRequest.mockReturnValue(false);

    await expect(useCase.execute(request)).rejects.toThrow('Invalid appointment request');
  });

  it('verifica que se llamen todos los métodos en el orden correcto', async () => {
    const request: AppointmentRequest = {
      insuredId: '12345',
      scheduleId: 1,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(true);
    mockValidationService.validateAppointmentRequest.mockReturnValue(true);

    await useCase.execute(request);

    expect(mockValidationService.validateInsuredId).toHaveBeenCalledWith('12345');
    expect(mockValidationService.validateCountryISO).toHaveBeenCalledWith(CountryISO.PE);
    expect(mockValidationService.validateAppointmentRequest).toHaveBeenCalledWith(request);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentId: expect.any(String),
        insuredId: '12345',
        scheduleId: 1,
        countryISO: CountryISO.PE,
        status: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    );

    expect(mockNotificationService.publishToCountry).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentId: expect.any(String),
        insuredId: '12345',
        scheduleId: 1,
        countryISO: CountryISO.PE,
      })
    );
  });
});
