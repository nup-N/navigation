import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsitesController } from './websites.controller';
import { WebsitesService } from './websites.service';
import { Website } from '../entities/website.entity';
import { Category } from '../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Website, Category])],
  controllers: [WebsitesController],
  providers: [WebsitesService],
})
export class WebsitesModule {}