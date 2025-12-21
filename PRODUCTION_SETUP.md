# 生产环境配置指南

## 重要提示

⚠️ **在生产环境部署前，必须修改所有默认密码！**

## 步骤 1: 创建环境变量文件

### 1.1 导航网站根目录 `.env`

在 `navigation/` 目录下创建 `.env` 文件：

```bash
cd navigation
cat > .env << 'EOF'
# ==================== Docker Compose 数据库配置 ====================
MYSQL_ROOT_PASSWORD=<生成强密码>
MYSQL_DATABASE=navigation
MYSQL_USER=root
MYSQL_PASSWORD=<生成强密码>
MYSQL_PORT=3307
EOF
```

### 1.2 后端 `.env`

在 `navigation/backend/` 目录下创建 `.env` 文件：

```bash
cd navigation/backend
cat > .env << 'EOF'
# ==================== 数据库配置 ====================
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=<与上面的MYSQL_PASSWORD相同>
DB_DATABASE=navigation

# ==================== 认证服务配置 ====================
AUTH_SERVICE_URL=http://localhost:3000/api

# ==================== 应用配置 ====================
NODE_ENV=production
PORT=3001
EOF
```

### 1.3 前端 `.env`

在 `navigation/frontend/` 目录下创建 `.env` 文件：

```bash
cd navigation/frontend
cat > .env << 'EOF'
# ==================== API 配置 ====================
VITE_API_BASE_URL=http://your-server-ip:3001
VITE_AUTH_API_BASE_URL=http://your-server-ip:3000
EOF
```

## 步骤 2: 生成强密码

```bash
# 生成随机密码（32字符）
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## 步骤 3: 设置文件权限

```bash
chmod 600 navigation/.env
chmod 600 navigation/backend/.env
chmod 600 navigation/frontend/.env
```

## 步骤 4: 启动服务

```bash
cd navigation
docker-compose up -d
```

## 注意事项

1. **不要将 `.env` 文件提交到 Git**
2. **定期更换密码**
3. **使用强密码（至少32字符）**
4. **限制数据库访问（仅允许本地连接）**
5. **生产环境前端 API 地址应使用 HTTPS**

