import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用 CORS，允许前端访问
  app.enableCors();
  
  // 监听 3001 端口
  await app.listen(3001);
  
  console.log('🚀 导航系统后端运行在: http://localhost:3001');
}
bootstrap();
