import React, { useState, useEffect, useRef } from 'react';
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
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());
  
  const categoryRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const token = authService.getToken();
    setIsAuthenticated(!!token);
    if (token) {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWebsites();
    }
  }, [isAuthenticated]);

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
      const response = await websiteApi.getAll();
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
    setUser(null);
  };

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId === null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = categoryRefs.current[categoryId];
      if (element) {
        const headerOffset = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  const toggleCategoryCollapse = (categoryId: number) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredWebsites = websites.filter(website =>
    website.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const websitesByCategory = categories.map(category => ({
    category,
    websites: filteredWebsites.filter(w => w.categoryId === category.id)
  }));

  const categoryColors = [
    '#1a73e8', '#ea4335', '#34a853', '#fbbc04', 
    '#ff6d00', '#9c27b0', '#00acc1', '#7cb342',
    '#e91e63', '#3f51b5', '#009688', '#ff5722'
  ];

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-logo">
            <div className="logo-icon">
              <span>🧭</span>
            </div>
            <span className="logo-text">我的导航</span>
          </div>

          <div className="header-search">
            <input
              type="text"
              placeholder="可输入系统名称或关键字进行检索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>

          <div className="header-user">
            <span className="user-name">{user?.username || 'admin'}</span>
            <button className="logout-btn" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="main-wrapper">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">
              <span className="title-icon">📂</span>
              <span>分类导航</span>
            </h2>
          </div>
          <nav className="category-nav">
            <button
              className={`category-tag ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => handleCategoryClick(null)}
            >
              <span className="tag-icon">📌</span>
              <span className="tag-name">全部</span>
            </button>
            {categories.map((category, index) => {
              const isActive = selectedCategory === category.id;
              const color = categoryColors[index % categoryColors.length];
              return (
                <button
                  key={category.id}
                  className={`category-tag ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    borderLeftColor: color
                  }}
                >
                  <span className="tag-icon">{category.icon || '📁'}</span>
                  <span className="tag-name">{category.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="main-content">
          <div className="website-container">
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>加载中...</p>
              </div>
            ) : filteredWebsites.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📭</div>
                <p>暂无网站数据</p>
              </div>
            ) : (
              <>
                {websitesByCategory.map((group, index) => {
                  const color = categoryColors[index % categoryColors.length];
                  const isCollapsed = collapsedCategories.has(group.category.id);
                  
                  if (group.websites.length === 0) {
                    return null;
                  }
                  
                  return (
                    <div 
                      key={group.category.id} 
                      className="category-section"
                      ref={(el) => categoryRefs.current[group.category.id] = el}
                    >
                      <div 
                        className="section-header"
                        onClick={() => toggleCategoryCollapse(group.category.id)}
                        style={{ borderLeftColor: color }}
                      >
                        <div className="section-title-wrapper">
                          <h3 className="section-title">
                            <span className="section-icon">{group.category.icon || '📁'}</span>
                            <span>{group.category.name}</span>
                            <span className="section-count">({group.websites.length})</span>
                          </h3>
                        </div>
                        <button className="collapse-btn">
                          {isCollapsed ? '▼' : '▲'}
                        </button>
                      </div>
                      {!isCollapsed && (
                        <div className="website-grid">
                          {group.websites.map(website => (
                            <div
                              key={website.id}
                              className="website-card"
                              onClick={() => handleWebsiteClick(website)}
                              style={{
                                borderTopColor: color
                              }}
                            >
                              <div className="website-icon">
                                {website.icon ? (
                                  <img src={website.icon} alt={website.title} />
                                ) : (
                                  <span className="default-icon">🔗</span>
                                )}
                              </div>
                              <div className="website-info">
                                <h3 className="website-title">{website.title}</h3>
                                <p className="website-description">
                                  {website.description || '暂无描述'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </main>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">© 2024 我的导航系统 - 让工作更高效</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
