import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * 角色守卫 - 基于用户角色控制访问权限
 * 支持权限继承：更高权限等级拥有低等级角色的全部功能
 * 
 * 权限等级（从低到高）：
 * - guest: 访客
 * - user: 普通用户
 * - premium: 高级用户
 * - admin: 管理员
 * - super_admin: 超级管理员
 * 
 * 使用方式：
 * @Roles('user') // user及以上角色都可以访问
 * @UseGuards(AuthGuard, RolesGuard)
 */
export const ROLES_KEY = 'roles';

// 角色权限等级映射（数字越大权限越高）
const ROLE_LEVELS: Record<string, number> = {
  guest: 0,
  user: 1,
  premium: 2,
  admin: 3,
  super_admin: 4,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由或控制器上定义的角色要求
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有定义角色要求，则允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 获取请求对象和用户信息
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 如果没有用户信息（未登录），拒绝访问
    if (!user) {
      throw new ForbiddenException('需要登录才能访问');
    }

    // 检查用户角色是否满足要求（支持权限继承）
    const userRole = user.role || 'guest';
    const userLevel = ROLE_LEVELS[userRole] ?? 0;
    
    // 检查用户权限等级是否满足任一要求角色的权限等级
    const hasPermission = requiredRoles.some((requiredRole) => {
      const requiredLevel = ROLE_LEVELS[requiredRole] ?? 0;
      return userLevel >= requiredLevel;
    });

    if (!hasPermission) {
      throw new ForbiddenException(`需要以下角色之一才能访问: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}

