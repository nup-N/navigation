# 环境变量配置指南

## 📋 配置文件位置

**只需要一个配置文件：** `navigation/.env`

前后端会自动从项目根目录读取此文件。

## 🔧 完整配置模板

在 `navigation/.env` 文件中配置以下内容：

```env
# ==================== Docker 配置 ====================
# MySQL 配置
MYSQL_ROOT_PASSWORD=your_strong_password_here
MYSQL_DATABASE=navigation
MYSQL_USER=root
MYSQL_PASSWORD=your_strong_password_here
MYSQL_PORT=3307

# ==================== 后端配置 ====================
# 数据库配置
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=your_strong_password_here
DB_DATABASE=navigation

# 统一认证服务（website后端）- 重要！
AUTH_SERVICE_URL=http://localhost:3000/api

# 应用配置
NODE_ENV=development
PORT=3001

# CORS配置（多个来源用逗号分隔）
CORS_ORIGIN=http://localhost:5174,http://192.168.10.107:5174

# ==================== 前端配置 ====================
# API配置
VITE_API_BASE_URL=http://localhost:3001/api
VITE_AUTH_API_BASE_URL=http://localhost:3000

# Website前端URL（底部链接，根据部署环境修改）
VITE_WEBSITE_URL=http://192.168.10.107:5173
```

## 🚀 生产环境配置

```env
# ==================== Docker 配置 ====================
MYSQL_ROOT_PASSWORD=<强密码>
MYSQL_DATABASE=navigation
MYSQL_PORT=3307

# ==================== 后端配置 ====================
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=<强密码>
DB_DATABASE=navigation

AUTH_SERVICE_URL=https://auth.yourdomain.com/api

NODE_ENV=production
PORT=3001

CORS_ORIGIN=https://nav.yourdomain.com

# ==================== 前端配置 ====================
VITE_API_BASE_URL=https://nav.yourdomain.com/api
VITE_AUTH_API_BASE_URL=https://auth.yourdomain.com
VITE_WEBSITE_URL=https://www.yourdomain.com
```

## ⚠️ 重要说明

### 配置读取机制
- ✅ **后端**：自动从 `navigation/.env` 读取
- ✅ **前端**：自动从 `navigation/.env` 读取
- ✅ **Docker**：docker-compose.yml 从同目录读取

### 密码一致性
确保以下配置保持一致：
```env
MYSQL_ROOT_PASSWORD=same_password
MYSQL_PASSWORD=same_password
DB_PASSWORD=same_password
```

### 必填配置项
- `MYSQL_ROOT_PASSWORD` - MySQL密码
- `DB_PASSWORD` - 后端数据库密码
- `AUTH_SERVICE_URL` - 统一认证服务地址（必须正确配置！）

## 🔒 安全建议

1. **永远不要提交 `.env` 文件到 Git**
2. **使用强密码**（至少12位，包含大小写字母、数字、特殊字符）
3. **生产环境必须修改所有默认密码**
4. **定期更换密码**

## 📝 快速开始

### 1. 创建配置文件
```bash
# 在 navigation 目录下创建 .env
cd navigation
touch .env
```

### 2. 复制上述配置模板

### 3. 修改所有密码和URL

### 4. 启动服务
```bash
# 启动数据库
docker-compose up -d

# 启动后端（会自动读取根目录的.env）
cd backend
pnpm install
pnpm run start:dev

# 启动前端（会自动读取根目录的.env）
cd frontend
pnpm install
pnpm run dev
```

## 🔍 验证配置

启动后检查日志：
```bash
# 后端日志应该显示：
# 🚀 导航系统后端运行在: http://0.0.0.0:3001 [development]

# 如果看到 "AUTH_SERVICE_URL 未配置" 错误
# 说明 .env 文件未正确加载或缺少 AUTH_SERVICE_URL
```

## 📂 文件结构

```
navigation/
├── .env                 # ✅ 唯一的环境变量文件
├── backend/            # 自动读取 ../.env
│   └── src/
├── frontend/           # 自动读取 ../.env (envDir: '..')
│   └── src/
└── docker-compose.yml  # 读取 ./.env
```

## ❓ 常见问题

### Q: 后端无法连接数据库？
**A:** 检查 `DB_PASSWORD` 是否与 `MYSQL_PASSWORD` 一致

### Q: 前端无法访问API？
**A:** 检查 `VITE_API_BASE_URL` 配置是否正确

### Q: 认证失败？
**A:** 检查 `AUTH_SERVICE_URL` 是否指向正确的 website 后端地址，并确保 website 服务已启动

### Q: 修改.env后不生效？
**A:** 重启后端和前端服务：
```bash
# 后端会自动重载（watch模式）
# 前端需要手动重启：Ctrl+C 然后重新 pnpm run dev
```
