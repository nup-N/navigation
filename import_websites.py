import requests
import json
import time

# 后端 API 地址
API_BASE_URL = "http://localhost:3001"

# 登录凭证（根据你的实际情况修改）
LOGIN_USERNAME = "admin"  # 修改为你的用户名
LOGIN_PASSWORD = "123456"  # 修改为你的密码

# 全局 token
AUTH_TOKEN = None

# 完整网站数据
websites_data = [
    # 常用推荐
    {"name": "V2EX", "url": "https://v2ex.com", "description": "著名程序员论坛", "category": "常用推荐", "icon": "🪜"},
    {"name": "NnupのAI", "url": "https://gpt.nnup.top", "description": "站长提供的免费聊天机器人，支持gpt3.5和gemini模型", "category": "常用推荐", "icon": "🤖"},
    {"name": "buzzing", "url": "https://buzzing.cc", "description": "用中文浏览外国社交媒体的热门讨论", "category": "常用推荐", "icon": "🌐"},
    {"name": "萌社区", "url": "https://moe.one", "description": "小众社区论坛", "category": "常用推荐", "icon": "🎀"},
    {"name": "Poe", "url": "https://poe.com", "description": "Quora推出的AI应用，支持多个大型语言模型", "category": "常用推荐", "icon": "🪜"},
    {"name": "抠图网站", "url": "https://www.remove.bg", "description": "抠图网站，完全自动化，免费", "category": "常用推荐", "icon": "✂️"},
    
    # 工具
    {"name": "秒搜", "url": "https://miaosou.fun", "description": "网盘资源搜索引擎", "category": "工具", "icon": "🔍"},
    {"name": "Maildrop", "url": "https://maildrop.cc", "description": "一次性邮箱接收网站，支持自定义前缀", "category": "工具", "icon": "📧"},
    {"name": "SMS-activate", "url": "https://sms-activate.org", "description": "知名付费接码平台，国外手机号接码", "category": "工具", "icon": "📱"},
    {"name": "Fliki", "url": "https://fliki.ai", "description": "AI配音网站，文案转音频", "category": "工具", "icon": "🎙️"},
    {"name": "SharePlay", "url": "https://shareplay-player.web.app", "description": "在线远程同步观看本地影片", "category": "工具", "icon": "🎬"},
    {"name": "Mermaid Live Editor", "url": "https://mermaid.live", "description": "图语言Mermaid在线编辑器", "category": "工具", "icon": "📊"},
    {"name": "ShareDrop", "url": "https://www.sharedrop.io", "description": "局域网跨设备传输文件", "category": "工具", "icon": "📤"},
    {"name": "Idify", "url": "https://idify.netlify.app", "description": "证件照在线生成", "category": "工具", "icon": "📷"},
    {"name": "地址生成器", "url": "https://www.meiguodizhi.com", "description": "随机生成各国虚假个人信息", "category": "工具", "icon": "🌍"},
    {"name": "阅后即焚", "url": "https://sesme.co", "description": "一次性消息网站", "category": "工具", "icon": "🔥"},
    {"name": "RSSeverything", "url": "https://rsseverything.com", "description": "把任意网站做成rss进行邮箱订阅", "category": "工具", "icon": "📰"},
    {"name": "国家数据", "url": "https://data.stats.gov.cn", "description": "国家统计局官方数据查询", "category": "工具", "icon": "📈"},
    {"name": "Office Tools Plus", "url": "https://otp.landian.vip/zh-cn", "description": "一键部署激活office", "category": "工具", "icon": "📝"},
    {"name": "吉林一号网", "url": "https://www.jl1mall.com", "description": "国内的卫星地图，平替谷歌地球", "category": "工具", "icon": "🛰️"},
    {"name": "论文查重", "url": "https://www.paperpass.com/upload", "description": "论文每天免费查重一次", "category": "工具", "icon": "📄"},
    
    # AI
    {"name": "ChatGPT", "url": "https://chat.openai.com", "description": "OpenAI官网ChatGPT", "category": "AI", "icon": "🪜"},
    {"name": "Claude", "url": "https://claude.ai", "description": "Anthropic发布的人工智能模型", "category": "AI", "icon": "🪜"},
    {"name": "Gemini", "url": "https://gemini.google.com", "description": "Google提供的大模型", "category": "AI", "icon": "🪜"},
    {"name": "樱桃茶GPT", "url": "https://chat.cherrychat.org", "description": "按对话次数计费的gpt", "category": "AI", "icon": "🍒"},
    {"name": "百度文心一言", "url": "https://yiyan.baidu.com", "description": "百度提供的大语言模型", "category": "AI", "icon": "🤖"},
    {"name": "阿里通义", "url": "https://tongyi.aliyun.com", "description": "阿里云提供的ai模型", "category": "AI", "icon": "🤖"},
    {"name": "讯飞星火", "url": "https://xinghuo.xfyun.cn", "description": "科大讯飞提供的大语言模型", "category": "AI", "icon": "✨"},
    {"name": "智谱清言", "url": "https://chatglm.cn", "description": "智谱AI提供的对话模型", "category": "AI", "icon": "💬"},
    {"name": "Kimi", "url": "https://kimi.moonshot.cn", "description": "月之暗面推出的智能助手", "category": "AI", "icon": "🌙"},
    
    # 文件工具
    {"name": "PDF24 Tools", "url": "https://tools.pdf24.org/zh/all-tools", "description": "几乎所有的pdf操作", "category": "文件工具", "icon": "📑"},
    {"name": "无损放大图片", "url": "https://www.waifu2x.net", "description": "在线无损放大图片", "category": "文件工具", "icon": "🖼️"},
    {"name": "格式转换", "url": "https://mp4.to", "description": "多种文件格式转换", "category": "文件工具", "icon": "🔄"},
    {"name": "白描网", "url": "https://web.baimiaoapp.com", "description": "图片识别表格，识别数学公式", "category": "文件工具", "icon": "📸"},
    {"name": "图小小", "url": "https://txx.cssrefs.com", "description": "图片压缩", "category": "文件工具", "icon": "🗜️"},
    {"name": "视频压缩", "url": "https://compress-video.file-converter-online.com", "description": "视频压缩、文件格式转换", "category": "文件工具", "icon": "🎥"},
    {"name": "会员音乐解密", "url": "https://tool.liumingye.cn/unlock-music", "description": "支持网易云、QQ音乐等文件解密", "category": "文件工具", "icon": "🎵"},
    
    # 资源网站
    {"name": "NO视频", "url": "https://novipnoad.net", "description": "免费高质量视频网站", "category": "资源网站", "icon": "🎬"},
    {"name": "不太灵影视", "url": "https://www.2bt0.com", "description": "提供热门电影种子及磁力链接", "category": "资源网站", "icon": "🎞️"},
    {"name": "相声随身听", "url": "https://www.xsmp3.com", "description": "免费持续更新名家相声", "category": "资源网站", "icon": "🎭"},
    {"name": "VIP视频解析", "url": "https://tool.liumingye.cn/video", "description": "支持大多数平台的vip视频解析", "category": "资源网站", "icon": "🎥"},
    {"name": "免费图片素材", "url": "https://pexels.com/zh-cn", "description": "免费分享精彩的素材图片和视频", "category": "资源网站", "icon": "📷"},
    {"name": "壁纸湖", "url": "https://bizihu.com", "description": "手机壁纸网站，无广告免登录", "category": "资源网站", "icon": "🖼️"},
    {"name": "MyFreeMP3", "url": "https://tools.liumingye.cn/music", "description": "在线免费听歌及高清音乐下载", "category": "资源网站", "icon": "🎵"},
    {"name": "洛雪音乐助手", "url": "https://docs.lxmusic.top", "description": "知名音乐客户端", "category": "资源网站", "icon": "🎶"},
    {"name": "中国哲学书电子化计划", "url": "https://ctext.org/zhs", "description": "中国历代传世文献", "category": "资源网站", "icon": "📚"},
    {"name": "z-library", "url": "https://zh.z-library.sx", "description": "z-library网站", "category": "资源网站", "icon": "🪜"},
    {"name": "Sci-Hub", "url": "https://sci-hub.se", "description": "文献平台", "category": "资源网站", "icon": "🪜"},
    {"name": "Crx搜搜", "url": "https://www.crxsoso.com", "description": "免翻浏览器扩展商店", "category": "资源网站", "icon": "🔌"},
    {"name": "XiaomiROM", "url": "https://xiaomirom.com", "description": "小米固件下载", "category": "资源网站", "icon": "📱"},
    {"name": "APKpure", "url": "https://apkpure.com/cn", "description": "国内apk下载站", "category": "资源网站", "icon": "📦"},
    {"name": "光明中医教材", "url": "https://www.gmzyjc.com", "description": "中医经典教材", "category": "资源网站", "icon": "💊"},
    {"name": "Emoji Homepage", "url": "https://emojihomepage.com", "description": "小黄脸表情大全", "category": "资源网站", "icon": "😀"},
    
    # Education
    {"name": "ski学院", "url": "https://www.sikiedu.com", "description": "编程网校", "category": "Education", "icon": "💻"},
    {"name": "趣词词典", "url": "https://www.quword.com", "description": "英语词根词缀词源词典", "category": "Education", "icon": "📖"},
    {"name": "Coursera", "url": "https://www.coursera.org", "description": "世界上最大的在线学习平台之一", "category": "Education", "icon": "🎓"},
    {"name": "MOOC", "url": "https://www.icourse163.org", "description": "国内知名在线教育平台", "category": "Education", "icon": "🏫"},
    {"name": "光明中医网校", "url": "https://www.gmzyjx.com", "description": "中医在线学习", "category": "Education", "icon": "🏥"},
    {"name": "四都教育", "url": "https://www.sudoedu.com", "description": "大学数学课程学习", "category": "Education", "icon": "📐"},
    {"name": "华为云开发者学堂", "url": "https://edu.huaweicloud.com", "description": "免费精品计算机课程", "category": "Education", "icon": "☁️"},
    {"name": "C3程序员", "url": "https://www.52c3.com", "description": "C语言等入门课程", "category": "Education", "icon": "⌨️"},
    {"name": "W3school", "url": "https://www.w3school.com.cn", "description": "网站建设教程", "category": "Education", "icon": "🌐"},
    {"name": "码上生花", "url": "https://job.yimuc.com", "description": "计算机八股面试刷题", "category": "Education", "icon": "💼"},
    {"name": "力扣题库", "url": "https://leetcode.cn", "description": "计算机学习网站", "category": "Education", "icon": "🧩"},
    
    # 教程
    {"name": "博客搭建教程", "url": "https://github.com/qiubaiying/qiubaiying.github.io/wiki", "description": "github上套用模板搭建博客", "category": "教程", "icon": "📝"},
    {"name": "Echart入门文档", "url": "https://echarts.apache.org/handbook/zh/get-started", "description": "快速生成图表的工具", "category": "教程", "icon": "📊"},
    {"name": "Mermaid入门文档", "url": "https://mermaid.nodejs.cn/intro", "description": "基于JavaScript的图表绘制工具", "category": "教程", "icon": "🎨"},
    {"name": "Markdown官方教程", "url": "https://markdown.com.cn", "description": "Markdown轻量级标记语言", "category": "教程", "icon": "📄"},
    
    # 文件夹
    {"name": "此人不存在", "url": "https://thispersondoesnotexist.com", "description": "自动生成随机不存在的真人头像", "category": "文件夹", "icon": "👤"},
    {"name": "狗屁不通文章生成器", "url": "https://suulnnka.github.io/BullshitGenerator/index.html", "description": "营销号语言风格", "category": "文件夹", "icon": "📰"},
    {"name": "The Useless Web", "url": "https://theuselessweb.com", "description": "随机跳转没用的网站", "category": "文件夹", "icon": "🎲"},
    {"name": "空难信息", "url": "https://www.planecrashinfo.com", "description": "空难信息记录", "category": "文件夹", "icon": "✈️"},
    {"name": "AIDN", "url": "https://aidn.jp", "description": "魔性二次元", "category": "文件夹", "icon": "🎵"},
    {"name": "恶作剧网站", "url": "https://pranx.com", "description": "各种恶作剧效果", "category": "文件夹", "icon": "😈"},
    {"name": "FutureMe", "url": "https://www.futureme.org", "description": "给未来的自己写封信", "category": "文件夹", "icon": "✉️"},
    {"name": "红色警戒2网页版", "url": "https://ra2web.com", "description": "非盈利的粉丝项目", "category": "文件夹", "icon": "🎮"},
    {"name": "摸鱼网站", "url": "https://goldfishies.com", "description": "真的在线养鱼摸鱼", "category": "文件夹", "icon": "🐟"},
    {"name": "让我帮你谷歌一下", "url": "https://lmstfy.net", "description": "教伸手党如何使用搜索引擎", "category": "文件夹", "icon": "🔍"},
    {"name": "MBTI性格测试", "url": "https://16type.com", "description": "免费原版高精度人格测试", "category": "文件夹", "icon": "🧠"},
    {"name": "丑丑头像生成器", "url": "https://txstc55.github.io/ugly-avatar", "description": "随机生成丑丑头像", "category": "文件夹", "icon": "🎭"},
]

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
            print(f"✅ 登录成功！Token: {AUTH_TOKEN[:20]}...")
            return True
        else:
            print(f"❌ 登录失败: {response.text}")
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
    """创建分类"""
    # 先检查是否已存在
    try:
        response = requests.get(f"{API_BASE_URL}/categories")
        if response.status_code == 200:
            categories = response.json()
            for cat in categories:
                if cat.get('name') == category_name:
                    return cat
    except:
        pass
    
    # 创建新分类
    try:
        response = requests.post(
            f"{API_BASE_URL}/categories",
            json={"name": category_name},
            headers=get_headers()
        )
        
        if response.status_code in [200, 201]:
            return response.json()
    except Exception as e:
        print(f"  ❌ 创建分类失败: {e}")
    
    return None

def add_website(website_data, category_id):
    """添加网站"""
    try:
        data = {
            "name": website_data["name"],
            "url": website_data["url"],
            "description": website_data["description"],
            "categoryId": category_id,
            "icon": website_data.get("icon", "🌐")
        }
        
        response = requests.post(
            f"{API_BASE_URL}/websites",
            json=data,
            headers=get_headers()
        )
        
        if response.status_code in [200, 201]:
            print(f"  ✅ {website_data['name']}")
            return True
        else:
            print(f"  ❌ {website_data['name']}")
            return False
    except Exception as e:
        print(f"  ❌ {website_data['name']} - {e}")
        return False

def main():
    print("\n" + "=" * 70)
    print("🚀 批量导入网站到导航系统")
    print("=" * 70)
    
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
        category = website["category"]
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
            print(f"  ❌ 无法创建分类\n")
            failed += len(websites)
            continue
        
        category_id = category['id']
        print(f"  ✅ 分类ID: {category_id}")
        
        # 添加该分类下的所有网站
        for website in websites:
            if add_website(website, category_id):
                success += 1
            else:
                failed += 1
            time.sleep(0.05)
        
        print()
    
    # 输出统计
    print("=" * 70)
    print("📊 导入完成！")
    print("=" * 70)
    print(f"总计: {total} 个网站")
    print(f"✅ 成功: {success} 个")
    print(f"❌ 失败: {failed} 个")
    print(f"成功率: {success/total*100:.1f}%")
    print("=" * 70)
    print("\n🎉 刷新浏览器查看效果: http://192.168.10.107:5174\n")

if __name__ == "__main__":
    main()
