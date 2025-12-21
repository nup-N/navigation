import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from './roles.guard';

/**
 * 角色装饰器
 * 
 * 用于标记需要特定角色才能访问的路由
 * 
 * @example
 * @Roles('admin', 'super_admin')
 * @Get('admin-only')
 * adminOnly() {
 *   return '只有管理员可以访问';
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

