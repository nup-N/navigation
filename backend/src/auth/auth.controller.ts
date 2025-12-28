import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: { username: string; password: string; email: string }) {
    return this.authService.register(registerDto.username, registerDto.password, registerDto.email);
  }
}