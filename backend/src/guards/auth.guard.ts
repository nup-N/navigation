import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

/**
 * 认证守卫 - 强制要求用户登录
 * 用于保护需要认证的接口（如创建、更新、删除操作）
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('🔐 [AuthGuard] 认证守卫被调用');
    console.log('📋 [AuthGuard] 请求路径:', request.method, request.url);
    console.log('🎫 [AuthGuard] Authorization header:', request.headers.authorization);

    try {
      const authHeader = request.headers.authorization;
      // 检查是否提供了 Authorization header
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ [AuthGuard] 未提供有效的 Token');
        throw new UnauthorizedException('未提供认证令牌');
      }

      // 提取 Token
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

      // 验证 Token
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // 将用户信息附加到请求对象
      request.user = {
        id: decoded.sub || decoded.id,
        username: decoded.username,
        role: decoded.role,
      };

      console.log('✅ [AuthGuard] Token 验证成功');
      console.log('👤 [AuthGuard] 用户信息:', request.user);
      return true;
    } catch (error) {
      console.log('❌ [AuthGuard] Token 验证失败:', error.message);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('令牌已过期');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('无效的令牌');
      }
      throw new UnauthorizedException('认证失败');
    }
  }
}