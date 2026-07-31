import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService, // подсовываем куклу вместо настоящего JwtService
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('должен быть определён', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('должен вернуть access_token', () => {
      const user = { id: 'user-1', email: 'test@example.com' };
      mockJwtService.sign.mockReturnValue('поддельный-jwt-токен');
      const result = service.login(user);
      expect(result).toEqual({ access_token: 'поддельный-jwt-токен' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });
  });
});
