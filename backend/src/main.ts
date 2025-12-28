import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // 设置全局路由前缀
  app.setGlobalPrefix('api');
  
  // 启用 CORS
  const corsOrigin = configService.get('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin 
      ? corsOrigin.split(',').map(origin => origin.trim())
      : true,
    credentials: true,
  });
  
  // 从环境变量读取端口
  const port = configService.get('PORT', 3001);
  await app.listen(port, '0.0.0.0');
  
  const nodeEnv = configService.get('NODE_ENV', 'development');
  console.log(`🚀 导航系统后端运行在: http://0.0.0.0:${port} [${nodeEnv}]`);
}
bootstrap();
