import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { WebsitesModule } from './websites/websites.module';
import { AuthModule } from './auth/auth.module';
import { Category } from './entities/category.entity';
import { Website } from './entities/website.entity';
import { UserWebsiteFavorite } from './entities/user-website-favorite.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'], // 优先使用当前目录，然后是父目录
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [Category, Website, UserWebsiteFavorite],
        synchronize: configService.get('NODE_ENV') === 'development',
        charset: 'utf8mb4',
        extra: {
          charset: 'utf8mb4',
        },
        connectTimeout: 60000,
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    CategoriesModule,
    WebsitesModule,
    AuthModule,
  ],
})
export class AppModule {}