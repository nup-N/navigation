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
    console.log('🔓 [OptionalAuthGuard] 可选认证守卫被调用');
    console.log('📋 [OptionalAuthGuard] 请求路径:', request.method, request.url);

    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // 调用 website 认证系统验证 Token
      return this.authService.validateToken(token).then(
        (user) => {
          // 将用户信息附加到请求对象（包含角色）
          request.user = {
            id: user.id || user.sub,
            username: user.username,
            role: user.role || 'user', // 包含用户角色
          };
          console.log('✅ [OptionalAuthGuard] Token 验证成功');
          console.log('👤 [OptionalAuthGuard] 用户信息:', request.user);
          return true;
        },
        (error) => {
          // 即使 Token 验证失败，也允许访问
          console.log('⚠️ [OptionalAuthGuard] Token 验证失败，但仍允许访问:', error.message);
          return true;
        }
      );
    } else {
      console.log('ℹ️ [OptionalAuthGuard] 未提供 Token，允许匿名访问');
      // 无论是否有 Token，都允许访问
      return true;
    }
  }
}