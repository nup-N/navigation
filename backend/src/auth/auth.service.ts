import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    // website 认证系统运行在 3000 端口，路由前缀为 /api
    // 支持通过环境变量配置，如果未配置则使用默认的 localhost
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://localhost:3000/api');
    console.log('🔐 [AuthService] 认证服务 URL:', this.authServiceUrl);
  }

  async login(username: string, password: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/login`, {
          username,
          password,
        })
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('用户名或密码错误');
      }
      throw new UnauthorizedException('认证服务不可用');
    }
  }

  async register(username: string, password: string, email: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/register`, {
          username,
          password,
          email,
        })
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || '注册失败');
      }
      throw new Error('认证服务不可用');
    }
  }

  async validateToken(token: string) {
    try {
      const url = `${this.authServiceUrl}/auth/validate`;
      
      // 使用 /auth/validate 端点，通过 Authorization header 验证
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 5000,
          }
        )
      );
      
      if (response.data.valid) {
        return response.data.user;
      }
      
      throw new UnauthorizedException('Token 验证失败');
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new UnauthorizedException(`无法连接到认证服务: ${this.authServiceUrl}`);
      }
      
      if (error.response?.status === 401 || error.response?.data?.valid === false) {
        throw new UnauthorizedException('Token 验证失败');
      }
      
      throw new UnauthorizedException(`认证服务不可用: ${error.message}`);
    }
  }
}