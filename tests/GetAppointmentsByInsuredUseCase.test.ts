import { GetAppointmentsByInsuredUseCase } from '../src/application/usecases/GetAppointmentsByInsuredUseCase';
import { Appointment, AppointmentStatus, CountryISO } from '../src/domain/Appointment';
import { AppointmentRepository } from '../src/domain/repositories/AppointmentRepository';
import { ValidationService } from '../src/domain/services/ValidationService';

describe('GetAppointmentsByInsuredUseCase', () => {
  let mockRepository: jest.Mocked<AppointmentRepository>;
  let mockValidationService: jest.Mocked<ValidationService>;
  let useCase: GetAppointmentsByInsuredUseCase;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      updateStatus: jest.fn(),
      findById: jest.fn(),
      findByInsuredId: jest.fn(),
    } as unknown as jest.Mocked<AppointmentRepository>;

    mockValidationService = {
      validateInsuredId: jest.fn(),
      validateCountryISO: jest.fn(),
      validateAppointmentRequest: jest.fn(),
    } as unknown as jest.Mocked<ValidationService>;

    useCase = new GetAppointmentsByInsuredUseCase(mockRepository, mockValidationService);
  });

  it('debería devolver citas cuando insuredId es válido', async () => {
    const dto = { insuredId: '12345' };
    const appointments: Appointment[] = [
      {
        appointmentId: '1',
        insuredId: dto.insuredId,
        scheduleId: 101,
        countryISO: CountryISO.PE,
        status: AppointmentStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        appointmentId: '2',
        insuredId: dto.insuredId,
        scheduleId: 102,
        countryISO: CountryISO.PE,
        status: AppointmentStatus.COMPLETED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockRepository.findByInsuredId.mockResolvedValue(appointments);

    const result = await useCase.execute(dto);

    expect(result).toHaveLength(2);
    expect(mockRepository.findByInsuredId).toHaveBeenCalledWith(dto.insuredId);
    expect(mockValidationService.validateInsuredId).toHaveBeenCalledWith(dto.insuredId);
  });

  it('debería lanzar error si insuredId está vacío', async () => {
    const dto = { insuredId: '' };
    await expect(useCase.execute(dto)).rejects.toThrow('insuredId es requerido');
  });

  it('debería lanzar error si insuredId tiene formato inválido', async () => {
    const dto = { insuredId: 'ABC' };
    mockValidationService.validateInsuredId.mockReturnValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow('Formato invalido para insuredId');
  });

  it('debería devolver lista vacía si no hay citas', async () => {
    const dto = { insuredId: '12345' };

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockRepository.findByInsuredId.mockResolvedValue([]);

    const result = await useCase.execute(dto);

    expect(result).toEqual([]);
    expect(mockRepository.findByInsuredId).toHaveBeenCalledWith(dto.insuredId);
  });

  it('debería manejar errores del repositorio', async () => {
    const dto = { insuredId: '12345' };
    const repositoryError = new Error('Database connection failed');

    mockValidationService.validateInsuredId.mockReturnValue(true);
    mockRepository.findByInsuredId.mockRejectedValue(repositoryError);

    await expect(useCase.execute(dto)).rejects.toThrow('Database connection failed');
  });

  it('debería validar insuredId antes de consultar el repositorio', async () => {
    const dto = { insuredId: 'INVALID' };

    mockValidationService.validateInsuredId.mockReturnValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow('Formato invalido para insuredId');

    expect(mockRepository.findByInsuredId).not.toHaveBeenCalled();
  });
});
