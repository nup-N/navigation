-- MySQL 初始化脚本：设置 UTF-8 字符集
-- 此脚本会在容器首次启动时自动执行

-- 设置数据库字符集
ALTER DATABASE navigation CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 确保连接使用 UTF-8
SET NAMES utf8mb4;

