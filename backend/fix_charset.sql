-- 修复 MySQL 数据库字符集为 UTF-8
-- 执行此脚本以修复现有数据库的字符集问题

-- 1. 修改数据库字符集
ALTER DATABASE navigation CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 2. 修改 categories 表的字符集
ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3. 修改 websites 表的字符集
ALTER TABLE websites CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 4. 修改 categories 表的 title 字段字符集
ALTER TABLE categories MODIFY COLUMN title VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 5. 修改 categories 表的 icon 字段字符集
ALTER TABLE categories MODIFY COLUMN icon VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 6. 修改 websites 表的 title 字段字符集
ALTER TABLE websites MODIFY COLUMN title VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 7. 修改 websites 表的 url 字段字符集
ALTER TABLE websites MODIFY COLUMN url VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 8. 修改 websites 表的 description 字段字符集
ALTER TABLE websites MODIFY COLUMN description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 9. 修改 websites 表的 icon 字段字符集
ALTER TABLE websites MODIFY COLUMN icon VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

