import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoriesService } from './categories/categories.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用 CORS，允许前端访问
  app.enableCors();
  
  // 初始化"其他"分类
  try {
    const categoriesService = app.get(CategoriesService);
    await categoriesService.getOrCreateOtherCategory();
    console.log('✅ "其他"分类已就绪');
  } catch (error) {
    console.warn('⚠️ 初始化"其他"分类失败:', error.message);
  }
  
  // 监听 3001 端口
  await app.listen(3001);
  
  console.log('🚀 导航系统后端运行在: http://localhost:3001');
}
bootstrap();
