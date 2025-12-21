import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '../guards/auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, AuthGuard, OptionalAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, AuthGuard, OptionalAuthGuard, RolesGuard],
})
export class AuthModule {}