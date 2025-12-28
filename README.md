# 导航网站服务 (Navigation)

导航网站系统，提供网站导航和收藏功能，集成统一认证服务。

## 📋 功能特性

- ✅ 网站分类管理
- ✅ 网站收藏功能
- ✅ 基于角色的权限控制
- ✅ 集成统一认证服务（website）
- ✅ 响应式前端界面

## 🛠️ 技术栈

**后端**: NestJS + TypeORM + MySQL  
**前端**: React + TypeScript + Vite

## 📂 项目结构

```
navigation/
├── backend/              # 后端服务（端口3001）
│   ├── src/
│   │   ├── auth/        # 认证集成模块
│   │   ├── categories/  # 分类管理
│   │   ├── websites/    # 网站管理
│   │   ├── guards/      # 权限守卫
│   │   ├── entities/    # 数据实体
│   │   └── main.ts
│   └── package.json
├── frontend/            # 前端服务（端口5174）
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── services/    # API服务
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml   # MySQL配置
└── README.md
```

## 🔗 依赖关系

本服务依赖于统一认证服务（website），必须先启动website后端。

```
导航前端 (5174) → 导航后端 (3001) → 统一认证 (3000)
                         ↓
                      MySQL (3307)
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- pnpm
- Docker & Docker Compose
- **统一认证服务已启动** (localhost:3000)

### 1. 配置环境变量

**只需要一个配置文件：** 在 `navigation` 目录创建 `.env` 文件

前后端和Docker都会自动读取此文件。

```env
# ==================== Docker 配置 ====================
MYSQL_ROOT_PASSWORD=your_strong_password
MYSQL_DATABASE=navigation
MYSQL_PORT=3307

# ==================== 后端配置 ====================
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=your_strong_password
DB_DATABASE=navigation

# 统一认证服务URL（重要！）
AUTH_SERVICE_URL=http://localhost:3000/api

NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5174

# ==================== 前端配置 ====================
VITE_API_BASE_URL=http://localhost:3001/api
VITE_AUTH_API_BASE_URL=http://localhost:3000
VITE_WEBSITE_URL=http://192.168.10.107:5173
```

**详细配置说明：** [ENVIRONMENT.md](./ENVIRONMENT.md)

### 2. 启动服务

```bash
# 启动数据库
docker-compose up -d

# 启动后端
cd backend
pnpm install
pnpm run start:dev

# 启动前端（新终端）
cd frontend
pnpm install
pnpm run dev
```

### 3. 访问应用

打开浏览器访问 http://localhost:5174

## 🔐 权限说明

- **guest（未登录）**：浏览公开网站
- **user**：添加网站、收藏网站、管理自己的网站
- **admin**：管理所有网站和分类

## 📦 生产环境部署

```bash
# 1. 构建后端
cd backend
pnpm install --prod
pnpm run build
pm2 start dist/main.js --name "navigation-backend"

# 2. 构建前端
cd frontend
pnpm install
pnpm run build
# 部署 dist 目录到 Nginx
```

**生产环境配置：** 在 `.env` 中修改对应变量

```env
NODE_ENV=production
VITE_API_BASE_URL=https://nav.yourdomain.com/api
VITE_AUTH_API_BASE_URL=https://auth.yourdomain.com
VITE_WEBSITE_URL=https://www.yourdomain.com
AUTH_SERVICE_URL=https://auth.yourdomain.com/api
```

## 🔧 API接口

### 网站管理
- `GET /api/websites` - 获取网站列表（公开）
- `POST /api/websites` - 添加网站（需登录）
- `PUT /api/websites/:id` - 更新网站（需权限）
- `DELETE /api/websites/:id` - 删除网站（需权限）

### 分类管理
- `GET /api/categories` - 获取分类列表（公开）
- `POST /api/categories` - 添加分类（需admin）
- `PUT /api/categories/:id` - 更新分类（需admin）
- `DELETE /api/categories/:id` - 删除分类（需admin）

### 收藏功能
- `POST /api/websites/:id/favorite` - 收藏网站
- `DELETE /api/websites/:id/favorite` - 取消收藏
- `GET /api/websites?categoryId=-1` - 获取我的收藏

## 📄 许可证

私有项目，未经授权不得使用。
