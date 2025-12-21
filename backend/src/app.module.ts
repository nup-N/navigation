import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { WebsitesModule } from './websites/websites.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Category } from './entities/category.entity';
import { Website } from './entities/website.entity';
import { UserWebsiteFavorite } from './entities/user-website-favorite.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,  // 改成 3307
      username: 'root',
      password: 'root',
      database: 'navigation',
      entities: [Category, Website, UserWebsiteFavorite],
      synchronize: true,
      // 设置字符集为 UTF-8，支持中文
      charset: 'utf8mb4',
      extra: {
        // MySQL 连接选项
        charset: 'utf8mb4',
      },
      // 连接后执行的 SQL，确保使用 UTF-8
      connectTimeout: 60000,
    }),
    CategoriesModule,
    WebsitesModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}