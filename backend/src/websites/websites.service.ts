import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Website } from '../entities/website.entity';

@Injectable()
export class WebsitesService {
  constructor(
    @InjectRepository(Website)
    private websiteRepository: Repository<Website>,
  ) {}

  async findAll(): Promise<Website[]> {
    return this.websiteRepository.find({
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Website[]> {
    return this.websiteRepository.find({
      where: { categoryId },
      relations: ['category'],
    });
  }

  async findOne(id: number): Promise<Website | null> {
    return this.websiteRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async create(website: Partial<Website>): Promise<Website> {
    const newWebsite = this.websiteRepository.create(website);
    return this.websiteRepository.save(newWebsite);
  }

  async update(id: number, website: Partial<Website>): Promise<Website | null> {
    await this.websiteRepository.update(id, website);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.websiteRepository.delete(id);
  }

  async incrementClicks(id: number): Promise<void> {
    await this.websiteRepository.increment({ id }, 'clicks', 1);
  }
}