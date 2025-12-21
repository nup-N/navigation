import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '../entities/category.entity';
import { AuthGuard } from '../guards/auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

/**
 * 分类控制器
 * 
 * 认证策略：
 * - GET 请求：使用 OptionalAuthGuard（可选认证，允许匿名访问）
 * - POST/PUT/DELETE 请求：使用 AuthGuard（强制认证，必须登录）
 */
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * 获取所有分类
   * 🔓 公开接口 - 允许匿名访问
   * - 如果用户已登录，会在最前面添加"我的"分类
   */
  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(@Request() req): Promise<Category[]> {
    console.log('📋 [GET /categories] 获取所有分类');
    console.log('👤 当前用户:', req.user || '匿名用户');
    return this.categoriesService.findAll(req.user);
  }

  /**
   * 获取单个分类
   * 🔓 公开接口 - 允许匿名访问
   */
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(@Param('id') id: string, @Request() req): Promise<Category | null> {
    console.log(`📋 [GET /categories/${id}] 获取分类详情`);
    console.log('👤 当前用户:', req.user || '匿名用户');
    return this.categoriesService.findOne(+id);
  }

  /**
   * 创建分类
   * 🔐 需要 admin 及以上角色
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() category: Partial<Category>, @Request() req): Promise<Category> {
    console.log('📋 [POST /categories] 创建分类');
    console.log('👤 操作用户:', req.user);
    console.log('📝 分类数据:', category);
    return this.categoriesService.create(category);
  }

  /**
   * 更新分类
   * 🔐 需要 admin 及以上角色
   */
  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() category: Partial<Category>,
    @Request() req,
  ): Promise<Category | null> {
    console.log(`📋 [PUT /categories/${id}] 更新分类`);
    console.log('👤 操作用户:', req.user);
    console.log('📝 更新数据:', category);
    return this.categoriesService.update(+id, category);
  }

  /**
   * 删除分类
   * 🔐 需要 admin 及以上角色
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    console.log(`📋 [DELETE /categories/${id}] 删除分类`);
    console.log('👤 操作用户:', req.user);
    return this.categoriesService.remove(+id);
  }
}