import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Website } from '../entities/website.entity';
import { UserWebsiteFavorite } from '../entities/user-website-favorite.entity';

@Injectable()
export class WebsitesService {
  constructor(
    @InjectRepository(Website)
    private websiteRepository: Repository<Website>,
    @InjectRepository(UserWebsiteFavorite)
    private favoriteRepository: Repository<UserWebsiteFavorite>,
  ) {}

  /**
   * 获取所有网站
   * - guest/user: 只能看到公开的网站
   * - admin/super_admin: 可以看到所有网站
   */
  async findAll(user?: { id: number; role: string }): Promise<Website[]> {
    const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
    
    const where: any = {};
    if (!isAdmin) {
      // 非管理员只能看到公开的网站
      where.isPublic = true;
    }

    return this.websiteRepository.find({
      where,
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据分类获取网站
   * - guest/user: 只能看到公开的网站
   * - admin/super_admin: 可以看到所有网站
   */
  async findByCategory(categoryId: number, user?: { id: number; role: string }): Promise<Website[]> {
    const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
    
    const where: any = { categoryId };
    if (!isAdmin) {
      where.isPublic = true;
    }

    return this.websiteRepository.find({
      where,
      relations: ['category'],
    });
  }

  /**
   * 获取"我的"分类的网站（用户添加的私有网站 + 用户收藏的网站）
   * 
   * 注意：
   * - 只包括用户创建的私有网站（isPublic=false），不包括公开网站
   * - 包括用户收藏的所有网站（无论是否公开）
   * - 管理员添加到其他分类的公开网站不会出现在"我的"分类中
   */
  async findMyWebsites(userId: number): Promise<Website[]> {
    // 获取用户创建的私有网站（isPublic=false）
    // 这些网站属于"我的"分类，只属于该用户
    const myCreatedWebsites = await this.websiteRepository.find({
      where: { 
        userId,
        isPublic: false, // 只包括私有网站
      },
      relations: ['category'],
    });

    // 获取用户收藏的网站ID
    const favorites = await this.favoriteRepository.find({
      where: { userId },
    });
    const favoriteWebsiteIds = favorites.map(f => f.websiteId);

    // 获取用户收藏的网站（无论是否公开）
    const myFavoriteWebsites = favoriteWebsiteIds.length > 0
      ? await this.websiteRepository.find({
          where: { id: In(favoriteWebsiteIds) },
          relations: ['category'],
        })
      : [];

    // 合并并去重
    const allWebsites = [...myCreatedWebsites, ...myFavoriteWebsites];
    const uniqueWebsites = Array.from(
      new Map(allWebsites.map(w => [w.id, w])).values()
    );

    return uniqueWebsites;
  }

  async findOne(id: number, user?: { id: number; role: string }): Promise<Website | null> {
    const website = await this.websiteRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!website) {
      return null;
    }

    // 检查权限：非管理员只能查看公开网站或自己的网站
    const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
    if (!isAdmin && !website.isPublic && website.userId !== user?.id) {
      throw new ForbiddenException('无权访问此网站');
    }

    return website;
  }

  /**
   * 创建网站
   * - user及以上: 可以创建
   * - 创建时自动设置userId
   * - user用户：只能添加到"我的"分类，默认为私有（isPublic=false）
   * - admin用户：
   *   - 如果选择"我的"分类（categoryId=-1或未设置），则为私有（isPublic=false）
   *   - 如果选择其他分类，则为公开（isPublic=true），对所有人生效
   */
  async create(website: Partial<Website>, user: { id: number; role: string }): Promise<Website> {
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    
    const websiteData: Partial<Website> = {
      ...website,
      userId: user.id,
    };
    
    if (!isAdmin) {
      // user用户：只能添加到"我的"分类，默认为私有
      delete websiteData.categoryId; // "我的"分类是虚拟分类，不需要categoryId
      websiteData.isPublic = false;
    } else {
      // admin用户：
      // - 如果选择"我的"分类（categoryId=-1），则为私有，只属于该管理员
      // - 如果选择其他分类，则为公开，对所有人生效
      if (websiteData.categoryId === -1 || !websiteData.categoryId) {
        // "我的"分类：私有，只属于该管理员
        delete websiteData.categoryId; // "我的"分类是虚拟分类，不需要categoryId
        websiteData.isPublic = false;
      } else {
        // 其他分类：公开，对所有人生效
        websiteData.isPublic = true;
      }
    }
    
    const newWebsite = this.websiteRepository.create(websiteData);
    return this.websiteRepository.save(newWebsite);
  }

  /**
   * 更新网站
   * - user: 只能更新自己创建的网站
   * - admin/super_admin: 可以更新所有网站
   * - 管理员更新分类时，需要自动设置isPublic：
   *   - 如果选择"我的"分类（categoryId=-1或未设置），则为私有（isPublic=false）
   *   - 如果选择其他分类，则为公开（isPublic=true），对所有人生效
   */
  async update(
    id: number,
    website: Partial<Website>,
    user: { id: number; role: string },
  ): Promise<Website | null> {
    const existingWebsite = await this.findOne(id, user);
    if (!existingWebsite) {
      throw new NotFoundException(`网站 ID ${id} 不存在`);
    }

    // 检查权限
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    if (!isAdmin && existingWebsite.userId !== user.id) {
      throw new ForbiddenException('只能修改自己创建的网站');
    }

    // 处理分类和公开状态的逻辑
    if (isAdmin && 'categoryId' in website) {
      // 管理员更新分类时，需要自动设置isPublic
      if (website.categoryId === -1 || !website.categoryId) {
        // "我的"分类：私有
        delete website.categoryId; // "我的"分类是虚拟分类，不需要categoryId
        website.isPublic = false;
      } else {
        // 其他分类：公开，对所有人生效
        website.isPublic = true;
      }
    } else if (!isAdmin) {
      // user用户不能修改categoryId和isPublic
      delete website.categoryId;
      delete website.isPublic;
    }

    await this.websiteRepository.update(id, website);
    return this.findOne(id, user);
  }

  /**
   * 删除网站
   * - user: 只能删除自己创建的网站
   * - admin/super_admin: 可以删除所有网站
   */
  async remove(id: number, user: { id: number; role: string }): Promise<void> {
    const website = await this.findOne(id, user);
    if (!website) {
      throw new NotFoundException(`网站 ID ${id} 不存在`);
    }

    // 检查权限
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    if (!isAdmin && website.userId !== user.id) {
      throw new ForbiddenException('只能删除自己创建的网站');
    }

    // 删除该网站的所有收藏记录
    await this.favoriteRepository.delete({ websiteId: id });

    await this.websiteRepository.delete(id);
  }

  async incrementClicks(id: number): Promise<void> {
    await this.websiteRepository.increment({ id }, 'clicks', 1);
  }

  /**
   * 收藏网站
   * - user及以上: 可以收藏公开的网站
   */
  async addFavorite(websiteId: number, userId: number): Promise<void> {
    // 检查网站是否存在且为公开
    const website = await this.websiteRepository.findOne({ where: { id: websiteId } });
    if (!website) {
      throw new NotFoundException(`网站 ID ${websiteId} 不存在`);
    }

    // 检查是否已收藏
    const existing = await this.favoriteRepository.findOne({
      where: { userId, websiteId },
    });
    if (existing) {
      return; // 已收藏，直接返回
    }

    // 添加收藏
    const favorite = this.favoriteRepository.create({ userId, websiteId });
    await this.favoriteRepository.save(favorite);
  }

  /**
   * 取消收藏
   */
  async removeFavorite(websiteId: number, userId: number): Promise<void> {
    await this.favoriteRepository.delete({ userId, websiteId });
  }

  /**
   * 检查用户是否收藏了某个网站
   */
  async isFavorite(websiteId: number, userId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, websiteId },
    });
    return !!favorite;
  }
}