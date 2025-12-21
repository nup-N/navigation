#!/bin/bash

# Docker 环境下快速修复 MySQL 字符集脚本

echo "🔧 开始修复 MySQL 字符集..."

# 检查容器是否存在
CONTAINER_NAME="navigation-mysql"

if ! docker ps -a | grep -q $CONTAINER_NAME; then
    echo "❌ 错误: 找不到容器 $CONTAINER_NAME"
    echo "请先确认你的 MySQL 容器名称，然后修改脚本中的 CONTAINER_NAME 变量"
    exit 1
fi

# 检查容器是否运行
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "⚠️  容器未运行，正在启动..."
    docker start $CONTAINER_NAME
    sleep 5
fi

echo "📝 执行字符集修复 SQL..."

# 执行修复 SQL
docker exec -i $CONTAINER_NAME mysql -u root -proot navigation << EOF
ALTER DATABASE navigation CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE categories MODIFY COLUMN title VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE categories MODIFY COLUMN icon VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE websites CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE websites MODIFY COLUMN title VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE websites MODIFY COLUMN url VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE websites MODIFY COLUMN description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE websites MODIFY COLUMN icon VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
EOF

if [ $? -eq 0 ]; then
    echo "✅ 字符集修复完成！"
    echo "⚠️  注意: 已经乱码的数据无法恢复，需要重新插入正确的数据"
    echo "🔄 请重启后端服务以使更改生效"
else
    echo "❌ 修复失败，请检查错误信息"
    exit 1
fi

