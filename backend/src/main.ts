import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoriesService } from './categories/categories.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // 启用 CORS
  const corsOrigin = configService.get('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin 
      ? corsOrigin.split(',').map(origin => origin.trim())
      : true, // 开发环境允许所有来源，生产环境应配置具体域名
    credentials: true,
  });
  
  // 初始化"其他"分类
  try {
    const categoriesService = app.get(CategoriesService);
    await categoriesService.getOrCreateOtherCategory();
    console.log('✅ "其他"分类已就绪');
  } catch (error) {
    console.warn('⚠️ 初始化"其他"分类失败:', error.message);
  }
  
  // 从环境变量读取端口
  const port = configService.get('PORT', 3001);
  await app.listen(port, '0.0.0.0');
  
  const nodeEnv = configService.get('NODE_ENV', 'development');
  console.log(`🚀 导航系统后端运行在: http://0.0.0.0:${port}`);
  console.log(`📋 环境: ${nodeEnv}`);
  
  if (nodeEnv === 'production') {
    console.log('⚠️  生产环境模式 - 请确保已配置强密码和密钥！');
  }
}
bootstrap();
