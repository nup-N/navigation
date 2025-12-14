import React, { useState, useEffect } from 'react';
import { categoryApi, websiteApi } from './services/api';
import type { Category, Website } from './types';
import Login from './components/Login';
import { authService } from './services/auth';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 检查登录状态
  useEffect(() => {
    const token = authService.getToken();
    setIsAuthenticated(!!token);
  }, []);

  // 加载分类数据
  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  // 加载网站数据
  useEffect(() => {
    if (isAuthenticated) {
      loadWebsites();
    }
  }, [selectedCategory, isAuthenticated]);

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const response = await websiteApi.getAll(selectedCategory || undefined);
      setWebsites(response.data);
    } catch (error) {
      console.error('加载网站失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWebsiteClick = async (website: Website) => {
    try {
      await websiteApi.click(website.id);
      window.open(website.url, '_blank');
    } catch (error) {
      console.error('记录点击失败:', error);
      window.open(website.url, '_blank');
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCategories([]);
    setWebsites([]);
  };

  // 过滤网站
  const filteredWebsites = websites.filter(website =>
    website.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 如果未登录，显示登录页面
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 已登录，显示主页面
  return (
    <div className="app">
      {/* 头部 */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🌐 我的导航</h1>
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索网站..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="main-content">
        {/* 分类导航 */}
        <nav className="category-nav">
          <button
            className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            全部
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </nav>

        {/* 网站列表 */}
        <div className="website-container">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : filteredWebsites.length === 0 ? (
            <div className="empty">暂无网站</div>
          ) : (
            <div className="website-grid">
              {filteredWebsites.map(website => (
                <div
                  key={website.id}
                  className="website-card"
                  onClick={() => handleWebsiteClick(website)}
                >
                  <div className="website-icon">
                    {website.icon ? (
                      <img src={website.icon} alt={website.title} />
                    ) : (
                      <span>🔗</span>
                    )}
                  </div>
                  <div className="website-info">
                    <h3 className="website-title">{website.title}</h3>
                    <p className="website-description">{website.description}</p>
                    <div className="website-meta">
                      <span className="website-clicks">👁️ {website.clicks}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
