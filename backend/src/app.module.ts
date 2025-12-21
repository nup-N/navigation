import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3307),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'root'),
        database: configService.get('DB_DATABASE', 'navigation'),
        entities: [Category, Website, UserWebsiteFavorite],
        // 生产环境应关闭 synchronize，使用迁移
        synchronize: configService.get('NODE_ENV') === 'development',
        // 设置字符集为 UTF-8，支持中文
        charset: 'utf8mb4',
        extra: {
          charset: 'utf8mb4',
        },
        connectTimeout: 60000,
        // 生产环境关闭 SQL 日志
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    CategoriesModule,
    WebsitesModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}