import requests

print("测试创建分类接口（无认证）...")
try:
    response = requests.post(
        "http://localhost:3001/categories",
        json={"name": "测试分类"},
        timeout=5
    )
    print(f"状态码: {response.status_code}")
    print(f"返回: {response.text}")
except Exception as e:
    print(f"错误: {e}")
