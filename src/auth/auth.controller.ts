import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard) // сначала отработает LocalStrategy, проверит email+пароль
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user); // req.user уже заполнен guard'ом
  }
}
