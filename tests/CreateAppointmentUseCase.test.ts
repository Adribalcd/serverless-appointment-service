import { CreateAppointmentUseCase } from '../src/application/usecases/CreateAppointmentUseCase';
import { AppointmentRepository } from '../src/domain/repositories/AppointmentRepository';
import { NotificationService } from '../src/domain/services/NotificationService';
import { ValidationService } from '../src/domain/services/ValidationService';
import { CountryISO } from '../src/domain/Appointment';

describe('CreateAppointmentUseCase', () => {
  let useCase: CreateAppointmentUseCase;
  let mockRepository: any;
  let mockNotificationService: any;
  let mockValidationService: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByInsuredId: jest.fn(),
      updateStatus: jest.fn(),
    };

    mockNotificationService = {
      publishToCountry: jest.fn().mockResolvedValue(undefined),
      publishConfirmation: jest.fn(),
      publishAppointmentRequested: jest.fn(),
    };

    mockValidationService = {
      validateInsuredId: jest.fn(),
      validateCountryISO: jest.fn(),
      validateAppointmentRequest: jest.fn().mockResolvedValue(true),
    };

    useCase = new CreateAppointmentUseCase(
      mockRepository,
      mockNotificationService,
      mockValidationService
    );
  });

  it('crea una cita válida y la guarda', async () => {
    const dto = {
      insuredId: '12345',
      scheduleId: 1,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(true);
    mockValidationService.validateAppointmentRequest.mockResolvedValue(true);

    const result = await useCase.execute(dto);

    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockNotificationService.publishToCountry).toHaveBeenCalled();
    expect(result).toHaveProperty('appointmentId');
    expect(result.message).toBe('El agendamiento está en proceso');
  });

  it('lanza error si insuredId es inválido', async () => {
    const dto = {
      insuredId: '',
      scheduleId: 1,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(false);
    // ✅ ACTUALIZADO: Usar el mensaje centralizado
    await expect(useCase.execute(dto)).rejects.toThrow(
      'El ID del asegurado debe tener exactamente 5 dígitos numéricos'
    );
  });

  it('lanza error si countryISO es inválido', async () => {
    const dto = {
      insuredId: '12345',
      scheduleId: 1,
      countryISO: 'AR' as CountryISO,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(false);

    // ✅ ACTUALIZADO: Usar el mensaje centralizado
    await expect(useCase.execute(dto)).rejects.toThrow(
      'El código de país debe ser PE (Perú) o CL (Chile)'
    );
  });

  it('lanza error si scheduleId es inválido', async () => {
    const dto = {
      insuredId: '12345',
      scheduleId: 0,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(true);

    // ✅ ACTUALIZADO: Usar el mensaje centralizado
    await expect(useCase.execute(dto)).rejects.toThrow(
      'El ID del horario debe ser un número positivo mayor a cero'
    );
  });

  it('lanza error si validateAppointmentRequest falla', async () => {
    const dto = {
      insuredId: '12345',
      scheduleId: 1,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(true);
    mockValidationService.validateAppointmentRequest.mockResolvedValue(false);

    // ✅ ACTUALIZADO: Usar el mensaje centralizado
    await expect(useCase.execute(dto)).rejects.toThrow(
      'Los datos proporcionados no cumplen con los requisitos del sistema'
    );
  });

  it('verifica que se llamen todos los métodos en el orden correcto', async () => {
    const dto = {
      insuredId: '12345',
      scheduleId: 1,
      countryISO: CountryISO.PE,
    };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockValidationService.validateCountryISO.mockReturnValue(true);
    mockValidationService.validateAppointmentRequest.mockResolvedValue(true);

    await useCase.execute(dto);

    expect(mockValidationService.validateInsuredId).toHaveBeenCalledWith('12345');
    expect(mockValidationService.validateCountryISO).toHaveBeenCalledWith(CountryISO.PE);
    expect(mockValidationService.validateAppointmentRequest).toHaveBeenCalledWith(dto);

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
