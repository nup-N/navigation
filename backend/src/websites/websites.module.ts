import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsitesController } from './websites.controller';
import { WebsitesService } from './websites.service';
import { Website } from '../entities/website.entity';
import { Category } from '../entities/category.entity';
import { UserWebsiteFavorite } from '../entities/user-website-favorite.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Website, Category, UserWebsiteFavorite]),
    AuthModule, // 导入 AuthModule 以使用 AuthGuard 和 OptionalAuthGuard
  ],
  controllers: [WebsitesController],
  providers: [WebsitesService],
})
export class WebsitesModule {}