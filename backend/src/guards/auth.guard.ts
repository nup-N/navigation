import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * 认证守卫 - 强制要求用户登录
 * 用于保护需要认证的接口（如创建、更新、删除操作）
 * 统一调用 website 认证系统进行 Token 验证
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    // 检查是否提供了 Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    // 提取 Token
    const token = authHeader.substring(7);

    // 调用 website 认证系统验证 Token
    return this.authService.validateToken(token).then(
      (user) => {
        // 将用户信息附加到请求对象（包含角色）
        request.user = {
          id: user.id || user.sub,
          username: user.username,
          role: user.role || 'user',
        };
        return true;
      },
      (error) => {
        throw new UnauthorizedException('认证失败');
      }
    );
  }
}