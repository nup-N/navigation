@echo off
chcp 65001 >nul
echo 🔧 开始修复 MySQL 字符集...

REM 检查容器是否存在
set CONTAINER_NAME=navigation-mysql

docker ps -a | findstr %CONTAINER_NAME% >nul
if errorlevel 1 (
    echo ❌ 错误: 找不到容器 %CONTAINER_NAME%
    echo 请先确认你的 MySQL 容器名称，然后修改脚本中的 CONTAINER_NAME 变量
    pause
    exit /b 1
)

REM 检查容器是否运行
docker ps | findstr %CONTAINER_NAME% >nul
if errorlevel 1 (
    echo ⚠️  容器未运行，正在启动...
    docker start %CONTAINER_NAME%
    timeout /t 5 /nobreak >nul
)

echo 📝 执行字符集修复 SQL...

REM 执行修复 SQL
docker exec -i %CONTAINER_NAME% mysql -u root -proot navigation -e "ALTER DATABASE navigation CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
docker exec -i %CONTAINER_NAME% mysql -u root -proot navigation -e "ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
docker exec -i %CONTAINER_NAME% mysql -u root -proot navigation -e "ALTER TABLE categories MODIFY COLUMN title VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
docker exec -i %CONTAINER_NAME% mysql -u root -proot navigation -e "ALTER TABLE categories MODIFY COLUMN icon VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
docker exec -i %CONTAINER_NAME% mysql -u root -proot navigation -e "ALTER TABLE websites CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
docker exec -i %CONTAINER_NAME% mysql -u root -proot navigation -e "ALTER TABLE websites MODIFY COLUMN title VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
docker exec -i %CONTAINER_NAME% mysql -u root -proot navigation -e "ALTER TABLE websites MODIFY COLUMN url VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
docker exec -i %CONTAINER_NAME% mysql -u root -proot navigation -e "ALTER TABLE websites MODIFY COLUMN description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
docker exec -i %CONTAINER_NAME% mysql -u root -proot navigation -e "ALTER TABLE websites MODIFY COLUMN icon VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

if errorlevel 1 (
    echo ❌ 修复失败，请检查错误信息
    pause
    exit /b 1
) else (
    echo ✅ 字符集修复完成！
    echo ⚠️  注意: 已经乱码的数据无法恢复，需要重新插入正确的数据
    echo 🔄 请重启后端服务以使更改生效
)

pause

