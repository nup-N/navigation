import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * 可选认证守卫 - 不强制要求用户登录
 * 如果提供了有效的 Token，会调用 website 认证系统解析用户信息
 * 如果没有提供或 Token 无效，仍然允许访问
 * 用于公开接口（如查询操作）
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // 调用 website 认证系统验证 Token
      return this.authService.validateToken(token).then(
        (user) => {
          // 将用户信息附加到请求对象
          request.user = {
            id: user.id || user.sub,
            username: user.username,
            role: user.role || 'user',
          };
          return true;
        },
        (error) => {
          // 即使 Token 验证失败，也允许访问
          return true;
        }
      );
    }
    
    // 无论是否有 Token，都允许访问
    return true;
  }
}