import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Website } from '../entities/website.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Website)
    private websiteRepository: Repository<Website>,
  ) {}

  /**
   * 获取所有分类
   * - 如果用户已登录，会在最前面添加"我的"分类（虚拟分类，不会保存到数据库）
   * - "我的"分类是每个用户独有的，但不会在数据库中创建记录
   */
  async findAll(user?: { id: number; role: string }): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      order: { sortOrder: 'ASC' },
    });

    // 如果用户已登录，添加"我的"分类（虚拟分类，ID为-1）
    // 注意：这里只是创建一个内存对象，不会保存到数据库
    if (user && user.id) {
      const myCategory = {
        id: -1, // 使用-1作为虚拟ID，不会与数据库中的ID冲突
        name: '我的',
        icon: '⭐',
        sortOrder: -1, // 置顶
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Category;
      return [myCategory, ...categories];
    }

    return categories;
  }

  async findOne(id: number): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async create(category: Partial<Category>): Promise<Category> {
    const newCategory = this.categoryRepository.create(category);
    return this.categoryRepository.save(newCategory);
  }

  async update(id: number, category: Partial<Category>): Promise<Category | null> {
    await this.categoryRepository.update(id, category);
    return this.findOne(id);
  }

  /**
   * 获取或创建"其他"分类
   * 用于存放没有分类的网站
   */
  async getOrCreateOtherCategory(): Promise<Category> {
    let otherCategory = await this.categoryRepository.findOne({
      where: { name: '其他' },
    });

    if (!otherCategory) {
      otherCategory = this.categoryRepository.create({
        name: '其他',
        icon: '📦',
        sortOrder: 9999, // 放在最后
      });
      otherCategory = await this.categoryRepository.save(otherCategory);
      console.log('✅ 创建"其他"分类:', otherCategory.id);
    }

    return otherCategory;
  }

  async remove(id: number): Promise<void> {
    // 检查分类是否存在
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException(`分类 ID ${id} 不存在`);
    }

    // 检查该分类下是否有网站
    const websites = await this.websiteRepository.find({
      where: { categoryId: id },
    });

    if (websites.length > 0) {
      // 获取或创建"其他"分类
      const otherCategory = await this.getOrCreateOtherCategory();

      // 将该分类下的所有网站移动到"其他"分类
      await this.websiteRepository.update(
        { categoryId: id },
        { categoryId: otherCategory.id },
      );

      console.log(`📦 已将 ${websites.length} 个网站移动到"其他"分类`);
    }

    // 删除分类
    await this.categoryRepository.delete(id);
    console.log(`✅ 已删除分类: ${category.name}`);
  }
}