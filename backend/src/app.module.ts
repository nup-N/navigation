import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { WebsitesModule } from './websites/websites.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Category } from './entities/category.entity';
import { Website } from './entities/website.entity';

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
      entities: [Category, Website],
      synchronize: true,
    }),
    CategoriesModule,
    WebsitesModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}