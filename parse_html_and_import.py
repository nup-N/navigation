#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从HTML文件中提取网站信息并批量导入到导航系统
使用正则表达式直接提取，更可靠
"""

import re
import requests
import time
from urllib.parse import urlparse

# 后端 API 地址
API_BASE_URL = "http://localhost:3001"

# 登录凭证（根据你的实际情况修改）
LOGIN_USERNAME = "admin"  # 修改为你的用户名
LOGIN_PASSWORD = "123456"  # 修改为你的密码

# 全局 token
AUTH_TOKEN = None


def parse_html_file(html_file_path):
    """从HTML文件中解析网站信息"""
    print(f"\n📄 正在解析HTML文件: {html_file_path}")
    
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except Exception as e:
        print(f"❌ 读取文件失败: {e}")
        return []
    
    websites = []
    
    # 提取所有分类及其内容
    # 匹配 <h4 class="text-gray"... id="分类名">分类名</h4> 到下一个 <h4> 或文件结束
    category_pattern = r'<h4[^>]*class="text-gray"[^>]*id="([^"]+)"[^>]*>([^<]+)</h4>(.*?)(?=<h4[^>]*class="text-gray"|$)'
    
    category_matches = re.finditer(category_pattern, html_content, re.DOTALL)
    
    for match in category_matches:
        category_id = match.group(1)
        category_name = match.group(2).strip()
        category_content = match.group(3)
        
        print(f"\n📁 发现分类: {category_name} (ID: {category_id})")
        
        # 在该分类内容中查找所有网站
        # 匹配网站div: <div class="col-sm-3">...<div class="xe-widget xe-conversations"...onclick="window.open('URL', '_blank')"...</div></div>
        website_pattern = r'<div\s+class="col-sm-3">.*?<div[^>]*class="xe-widget[^"]*xe-conversations[^"]*"[^>]*onclick="window\.open\([\'"]?([^\'"]+)[\'"]?[^>]*>.*?<strong>([^<]+)</strong>.*?<p[^>]*class="[^"]*overflowClip_2[^"]*"[^>]*>([^<]+)</p>.*?</div>.*?</div>'
        
        website_matches = re.finditer(website_pattern, category_content, re.DOTALL)
        
        for site_match in website_matches:
            url = site_match.group(1).strip()
            title = site_match.group(2).strip()
            description = site_match.group(3).strip()
            
            # 处理URL
            if url.startswith('//'):
                url = 'https:' + url
            elif not url.startswith('http'):
                url = 'https://' + url
            
            # 提取图标
            icon = ""
            # 在网站div中查找图标
            site_div_start = site_match.start()
            site_div_end = site_match.end()
            site_div_html = category_content[site_div_start:site_div_end]
            
            # 查找图标img标签
            icon_match = re.search(r'<img[^>]*(?:data-src|src)=[\'"]?([^\'"\s>]+)[\'"]?', site_div_html)
            if icon_match:
                icon = icon_match.group(1)
                if icon.startswith('//'):
                    icon = 'https:' + icon
                elif icon.startswith('/'):
                    # 相对路径，保持原样或根据实际情况处理
                    pass
                elif not icon.startswith('http'):
                    icon = 'https://' + icon
            
            website = {
                'title': title,
                'url': url,
                'description': description,
                'icon': icon,
                'category': category_name
            }
            
            websites.append(website)
            print(f"  ✓ {title}: {url}")
    
    print(f"\n✅ 解析完成，找到 {len(websites)} 个网站")
    
    # 按分类分组统计
    categories = {}
    for site in websites:
        cat = site.get('category', '未分类')
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\n📊 分类统计:")
    for cat, count in sorted(categories.items()):
        print(f"  - {cat}: {count} 个网站")
    
    return websites


def login():
    """登录获取 token"""
    global AUTH_TOKEN
    
    print("\n🔐 正在登录...")
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json={
                "username": LOGIN_USERNAME,
                "password": LOGIN_PASSWORD
            }
        )
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            AUTH_TOKEN = data.get('access_token') or data.get('token')
            if AUTH_TOKEN:
                print(f"✅ 登录成功！Token: {AUTH_TOKEN[:20]}...")
                return True
            else:
                print(f"❌ 登录响应中未找到token: {data}")
                return False
        else:
            print(f"❌ 登录失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ 登录异常: {e}")
        return False


def get_headers():
    """获取带认证的请求头"""
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {AUTH_TOKEN}"
    }


def create_category(category_name):
    """创建分类，如果已存在则返回现有分类"""
    # 先检查是否已存在
    try:
        response = requests.get(f"{API_BASE_URL}/categories")
        if response.status_code == 200:
            categories = response.json()
            for cat in categories:
                if cat.get('name') == category_name:
                    print(f"  ℹ️  分类已存在: {category_name} (ID: {cat['id']})")
                    return cat
    except Exception as e:
        print(f"  ⚠️  检查分类时出错: {e}")
    
    # 创建新分类
    print(f"  ➕ 创建分类: {category_name}")
    try:
        response = requests.post(
            f"{API_BASE_URL}/categories",
            json={"name": category_name},
            headers=get_headers()
        )
        
        if response.status_code in [200, 201]:
            cat = response.json()
            print(f"  ✅ 分类创建成功: {category_name} (ID: {cat['id']})")
            return cat
        else:
            print(f"  ❌ 创建分类失败: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"  ❌ 创建分类异常: {e}")
    
    return None


def add_website(website_data, category_id):
    """添加网站"""
    try:
        data = {
            "title": website_data["title"],
            "url": website_data["url"],
            "description": website_data.get("description", ""),
            "categoryId": category_id,
            "icon": website_data.get("icon", "")
        }
        
        response = requests.post(
            f"{API_BASE_URL}/websites",
            json=data,
            headers=get_headers()
        )
        
        if response.status_code in [200, 201]:
            return True
        else:
            print(f"    ❌ {website_data['title']}: {response.status_code} - {response.text[:100]}")
            return False
    except Exception as e:
        print(f"    ❌ {website_data.get('title', '未知')} - {e}")
        return False


def main():
    import sys
    
    print("\n" + "=" * 70)
    print("🚀 从HTML批量导入网站到导航系统")
    print("=" * 70)
    
    # 检查命令行参数
    if len(sys.argv) < 2:
        print("\n❌ 请提供HTML文件路径")
        print("用法: python parse_html_and_import.py <html_file_path>")
        print("示例: python parse_html_and_import.py index.html")
        return
    
    html_file_path = sys.argv[1]
    
    # 解析HTML
    websites_data = parse_html_file(html_file_path)
    
    if not websites_data:
        print("\n❌ 未能从HTML中提取到网站信息")
        return
    
    # 登录
    if not login():
        print("\n❌ 登录失败，请检查用户名和密码")
        print(f"当前配置: 用户名={LOGIN_USERNAME}, 密码={LOGIN_PASSWORD}")
        print("\n💡 提示：请在脚本开头修改 LOGIN_USERNAME 和 LOGIN_PASSWORD")
        return
    
    # 统计
    total = len(websites_data)
    success = 0
    failed = 0
    
    # 按分类分组
    categories_dict = {}
    for website in websites_data:
        category = website.get("category", "未分类")
        if category not in categories_dict:
            categories_dict[category] = []
        categories_dict[category].append(website)
    
    print(f"\n📊 准备导入 {total} 个网站，分为 {len(categories_dict)} 个分类\n")
    
    # 逐个分类处理
    for idx, (category_name, websites) in enumerate(categories_dict.items(), 1):
        print(f"[{idx}/{len(categories_dict)}] 📁 {category_name} ({len(websites)} 个网站)")
        print("-" * 70)
        
        # 创建分类
        category = create_category(category_name)
        if not category:
            print(f"  ❌ 无法创建分类，跳过该分类下的所有网站\n")
            failed += len(websites)
            continue
        
        category_id = category['id']
        
        # 添加该分类下的所有网站
        for website in websites:
            if add_website(website, category_id):
                success += 1
                print(f"    ✅ {website['title']}")
            else:
                failed += 1
            time.sleep(0.05)  # 避免请求过快
        
        print()
    
    # 输出统计
    print("=" * 70)
    print("📊 导入完成！")
    print("=" * 70)
    print(f"总计: {total} 个网站")
    print(f"✅ 成功: {success} 个")
    print(f"❌ 失败: {failed} 个")
    if total > 0:
        print(f"成功率: {success/total*100:.1f}%")
    print("=" * 70)
    print("\n🎉 导入完成！请刷新浏览器查看效果\n")


if __name__ == "__main__":
    main()
