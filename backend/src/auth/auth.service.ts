import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  // website 认证系统运行在 3000 端口，路由前缀为 /api
  // 支持通过环境变量配置，如果未配置则尝试从请求中推断
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api';

  constructor(private httpService: HttpService) {
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

  async validateToken(token: string) {
    try {
      const url = `${this.authServiceUrl}/auth/validate`;
      console.log('🔍 [AuthService] 验证 Token，URL:', url);
      
      // 使用 /auth/validate 端点，通过 Authorization header 验证（更符合 RESTful 设计）
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 5000, // 5秒超时
          }
        )
      );
      // 如果验证成功，返回用户信息
      if (response.data.valid) {
        console.log('✅ [AuthService] Token 验证成功');
        return response.data.user;
      }
      console.log('❌ [AuthService] Token 验证失败: 返回 valid=false');
      throw new UnauthorizedException('Token 验证失败');
    } catch (error: any) {
      console.error('❌ [AuthService] Token 验证异常:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.error('❌ [AuthService] 无法连接到认证服务:', this.authServiceUrl);
        throw new UnauthorizedException(`无法连接到认证服务: ${this.authServiceUrl}`);
      }
      
      if (error.response?.status === 401 || error.response?.data?.valid === false) {
        throw new UnauthorizedException('Token 验证失败');
      }
      throw new UnauthorizedException(`认证服务不可用: ${error.message}`);
    }
  }
}