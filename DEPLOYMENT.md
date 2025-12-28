# 导航网站服务 - 部署指南

## ⚠️ 重要提示

本服务依赖统一认证服务（website），**必须先部署统一认证服务**！

## 📋 部署前准备

- Node.js >= 18
- pnpm
- Docker & Docker Compose
- PM2（生产环境）
- Nginx（前端部署）
- **统一认证服务已部署并运行**

## 🚀 快速部署

### 1. 克隆代码

```bash
git clone <repository-url>
cd navigation
```

### 2. 配置环境变量

#### `.env` (项目根目录 - Docker配置)

```env
MYSQL_ROOT_PASSWORD=<强密码>
MYSQL_DATABASE=navigation
MYSQL_PORT=3307
```

#### `backend/.env`

```env
# 数据库
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=<与上面相同>
DB_DATABASE=navigation

# 统一认证服务URL（重要！）
AUTH_SERVICE_URL=http://localhost:3000/api

# 应用配置
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://nav.yourdomain.com
```

#### `frontend/.env`

```env
VITE_API_BASE_URL=https://nav.yourdomain.com/api
VITE_AUTH_API_BASE_URL=https://auth.yourdomain.com
VITE_WEBSITE_URL=https://www.yourdomain.com
```

### 3. 启动数据库

```bash
docker-compose up -d
```

### 4. 部署后端

```bash
cd backend
pnpm install --prod
pnpm run build
pm2 start dist/main.js --name "navigation-backend"
pm2 save
pm2 startup
```

### 5. 部署前端

```bash
cd frontend
pnpm install
pnpm run build
```

#### Nginx配置

```nginx
server {
    listen 80;
    server_name nav.yourdomain.com;
    
    # 前端静态文件
    location / {
        root /path/to/navigation/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL证书（推荐）

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d nav.yourdomain.com
```

## 🔧 维护命令

```bash
# 查看后端日志
pm2 logs navigation-backend

# 重启后端
pm2 restart navigation-backend

# 查看数据库
docker-compose logs mysql_navigation

# 数据库备份
docker exec navigation-mysql mysqldump -uroot -p<password> navigation > backup.sql
```

## 🔍 故障排查

### 1. 后端启动失败

检查：
- 统一认证服务是否运行
- MySQL是否启动：`docker ps`
- 环境变量是否正确配置
- 端口3001是否被占用

### 2. 前端无法访问

检查：
- Nginx配置是否正确
- API代理是否正常
- 前端环境变量是否正确

### 3. 认证失败

检查：
- `AUTH_SERVICE_URL` 配置是否正确
- 统一认证服务是否可访问
- 网络连接是否正常

## 📦 更新部署

```bash
# 拉取最新代码
git pull

# 更新后端
cd backend
pnpm install --prod
pnpm run build
pm2 restart navigation-backend

# 更新前端
cd frontend
pnpm install
pnpm run build
sudo systemctl reload nginx
```

## 🔐 安全建议

1. 修改所有默认密码为强密码
2. 配置防火墙，只开放必要端口
3. 定期备份数据库
4. 使用HTTPS
5. 定期更新依赖包

## 📞 技术支持

如有问题，请联系技术团队。
