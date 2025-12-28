import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { WebsitesService } from './websites.service';
import { Website } from '../entities/website.entity';
import { AuthGuard } from '../guards/auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

  /**
   * 网站控制器
   * 
   * 权限策略：
   * - GET 请求：使用 OptionalAuthGuard（可选认证，允许匿名访问）
   * - POST/PUT/DELETE 请求：使用 AuthGuard + RolesGuard（需要登录，根据角色控制权限）
   * - 特殊：POST :id/click 使用 OptionalAuthGuard（点击统计允许匿名）
   */
@Controller('websites')
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  /**
   * 获取所有网站（可按分类筛选）
   * 🔓 公开接口 - 允许匿名访问
   * - categoryId=-1 表示"我的"分类（需要登录）
   */
  @Get()
  @UseGuards(OptionalAuthGuard)
  async   findAll(
    @Query('categoryId') categoryId?: string,
    @Request() req?,
  ): Promise<Website[]> {
    // 处理"我的"分类（categoryId=-1）
    if (categoryId === '-1') {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('需要登录才能访问"我的"分类');
      }
      return this.websitesService.findMyWebsites(req.user.id);
    }

    if (categoryId) {
      return this.websitesService.findByCategory(+categoryId, req.user);
    }
    return this.websitesService.findAll(req.user);
  }

  /**
   * 检查是否已收藏
   * 🔐 需要 user 及以上角色
   * 注意：这个路由必须在 @Get(':id') 之前，否则会被 :id 路由匹配
   */
  @Get(':id/favorite')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async checkFavorite(@Param('id') id: string, @Request() req): Promise<{ isFavorite: boolean }> {
    const isFavorite = await this.websitesService.isFavorite(+id, req.user.id);
    return { isFavorite };
  }

  /**
   * 获取单个网站
   * 🔓 公开接口 - 允许匿名访问（但会检查权限）
   */
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(@Param('id') id: string, @Request() req): Promise<Website | null> {
    return this.websitesService.findOne(+id, req.user);
  }

  /**
   * 创建网站
   * 🔐 需要 user 及以上角色
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  create(@Body() website: Partial<Website>, @Request() req): Promise<Website> {
    return this.websitesService.create(website, req.user);
  }

  /**
   * 更新网站
   * 🔐 需要 user 及以上角色（只能更新自己创建的，admin可以更新所有）
   */
  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  update(
    @Param('id') id: string,
    @Body() website: Partial<Website>,
    @Request() req,
  ): Promise<Website | null> {
    return this.websitesService.update(+id, website, req.user);
  }

  /**
   * 删除网站
   * 🔐 需要 user 及以上角色（只能删除自己创建的，admin可以删除所有）
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.websitesService.remove(+id, req.user);
  }

  /**
   * 增加点击次数
   * 🔓 公开接口 - 允许匿名访问（统计功能）
   */
  @Post(':id/click')
  @UseGuards(OptionalAuthGuard)
  incrementClicks(@Param('id') id: string, @Request() req): Promise<void> {
    return this.websitesService.incrementClicks(+id);
  }

  /**
   * 收藏网站
   * 🔐 需要 user 及以上角色
   */
  @Post(':id/favorite')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async addFavorite(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    await this.websitesService.addFavorite(+id, req.user.id);
    return { message: '收藏成功' };
  }

  /**
   * 取消收藏
   * 🔐 需要 user 及以上角色
   */
  @Delete(':id/favorite')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('user')
  async removeFavorite(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    await this.websitesService.removeFavorite(+id, req.user.id);
    return { message: '取消收藏成功' };
  }

}
