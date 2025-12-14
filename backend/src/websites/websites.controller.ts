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
} from '@nestjs/common';
import { WebsitesService } from './websites.service';
import { Website } from '../entities/website.entity';
import { AuthGuard } from '../guards/auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';

/**
 * 网站控制器
 * 
 * 认证策略：
 * - GET 请求：使用 OptionalAuthGuard（可选认证，允许匿名访问）
 * - POST/PUT/DELETE 请求：使用 AuthGuard（强制认证，必须登录）
 * - 特殊：POST :id/click 使用 OptionalAuthGuard（点击统计允许匿名）
 */
@Controller('websites')
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  /**
   * 获取所有网站（可按分类筛选）
   * 🔓 公开接口 - 允许匿名访问
   */
  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(
    @Query('categoryId') categoryId?: string,
    @Request() req?,
  ): Promise<Website[]> {
    console.log('📋 [GET /websites] 获取网站列表');
    console.log('👤 当前用户:', req.user || '匿名用户');
    console.log('🔍 分类筛选:', categoryId || '全部');

    if (categoryId) {
      return this.websitesService.findByCategory(+categoryId);
    }
    return this.websitesService.findAll();
  }

  /**
   * 获取单个网站
   * 🔓 公开接口 - 允许匿名访问
   */
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(@Param('id') id: string, @Request() req): Promise<Website | null> {
    console.log(`📋 [GET /websites/${id}] 获取网站详情`);
    console.log('👤 当前用户:', req.user || '匿名用户');
    return this.websitesService.findOne(+id);
  }

  /**
   * 创建网站
   * 🔐 需要认证 - 必须登录
   */
  @Post()
  @UseGuards(AuthGuard)
  create(@Body() website: Partial<Website>, @Request() req): Promise<Website> {
    console.log('📋 [POST /websites] 创建网站');
    console.log('👤 操作用户:', req.user);
    console.log('📝 网站数据:', website);
    return this.websitesService.create(website);
  }

  /**
   * 更新网站
   * 🔐 需要认证 - 必须登录
   */
  @Put(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() website: Partial<Website>,
    @Request() req,
  ): Promise<Website | null> {
    console.log(`📋 [PUT /websites/${id}] 更新网站`);
    console.log('👤 操作用户:', req.user);
    console.log('📝 更新数据:', website);
    return this.websitesService.update(+id, website);
  }

  /**
   * 删除网站
   * 🔐 需要认证 - 必须登录
   */
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    console.log(`📋 [DELETE /websites/${id}] 删除网站`);
    console.log('👤 操作用户:', req.user);
    return this.websitesService.remove(+id);
  }

  /**
   * 增加点击次数
   * 🔓 公开接口 - 允许匿名访问（统计功能）
   */
  @Post(':id/click')
  @UseGuards(OptionalAuthGuard)
  incrementClicks(@Param('id') id: string, @Request() req): Promise<void> {
    console.log(`📋 [POST /websites/${id}/click] 增加点击次数`);
    console.log('👤 当前用户:', req.user || '匿名用户');
    return this.websitesService.incrementClicks(+id);
  }
}
