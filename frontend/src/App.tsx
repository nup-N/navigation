import React, { useState, useEffect, useRef } from 'react';
import { categoryApi, websiteApi } from './services/api';
import type { Category, Website } from './types';
import Login from './components/Login';
import AddWebsite from './components/AddWebsite';
import { authService } from './services/auth';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [myWebsites, setMyWebsites] = useState<Website[]>([]); // "我的"分类的网站
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<{ id: number; username: string; role?: string } | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());
  const [showLogin, setShowLogin] = useState(false);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  
  const categoryRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    // 检查URL参数中是否有统一认证的token
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('token');
    
    if (ssoToken) {
      // 如果有统一认证的token，自动登录
      handleSSOLogin(ssoToken);
      // 清除URL中的token参数（保持URL干净）
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else {
      // 检查本地token
      const token = authService.getToken();
      setIsAuthenticated(!!token);
      if (token) {
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          setUser(JSON.parse(userInfo));
        }
      }
    }
    
    // 无论是否登录，都加载数据（允许匿名访问）
    loadCategories();
    loadWebsites();
  }, []);
  
  // 处理SSO登录（统一认证系统传递的token）
  const handleSSOLogin = async (token: string) => {
    try {
      console.log('🔐 [SSO] 检测到统一认证token，开始自动登录...');
      
      // 保存token到localStorage（navigation系统使用'token'作为key）
      localStorage.setItem('token', token);
      
      // 调用website认证服务验证token并获取用户信息
      const authApiUrl = import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:3000';
      
      try {
        // 使用validate端点验证token并获取用户信息
        const validateResponse = await fetch(`${authApiUrl}/api/auth/validate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (validateResponse.ok) {
          const validateData = await validateResponse.json();
          if (validateData.valid && validateData.user) {
            // 保存用户信息
            localStorage.setItem('user', JSON.stringify(validateData.user));
            setUser(validateData.user);
            setIsAuthenticated(true);
            console.log('✅ [SSO] 自动登录成功:', validateData.user);
            
            // 登录成功后，重新加载需要认证的数据
            await loadWebsites();
            await loadCategories();
            
            // 加载"我的"分类的网站
            try {
              const response = await websiteApi.getAll(-1);
              setMyWebsites(response.data);
            } catch (error) {
              console.error('加载"我的"分类失败:', error);
            }
            return;
          }
        }
        
        // 如果validate失败，尝试使用me端点
        console.log('⚠️ [SSO] validate端点失败，尝试使用me端点...');
        const meResponse = await fetch(`${authApiUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (meResponse.ok) {
          const userData = await meResponse.json();
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ [SSO] 自动登录成功（通过me端点）:', userData);
          
          // 登录成功后，重新加载需要认证的数据
          await loadWebsites();
          await loadCategories();
          
          // 加载"我的"分类的网站
          try {
            const response = await websiteApi.getAll(-1);
            setMyWebsites(response.data);
          } catch (error) {
            console.error('加载"我的"分类失败:', error);
          }
          return;
        }
        
        throw new Error('无法获取用户信息');
      } catch (error) {
        console.error('❌ [SSO] 获取用户信息失败:', error);
        // 即使获取用户信息失败，也保存token（可能后端会验证）
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('❌ [SSO] 自动登录失败:', error);
      // 清除无效的token
      localStorage.removeItem('token');
    }
  };

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
      console.log('加载网站成功:', response.data);
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

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      
      // 登录成功后，重新加载网站列表和"我的"分类
      await loadWebsites();
      await loadCategories();
      
      // 加载"我的"分类的网站
      try {
        const response = await websiteApi.getAll(-1);
        setMyWebsites(response.data);
      } catch (error) {
        console.error('加载"我的"分类失败:', error);
      }
    }
  };

  const handleLogout = async () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setMyWebsites([]); // 清空"我的"分类
    
    // 退出登录后，重新加载网站列表和分类（不包含"我的"分类）
    await loadCategories();
    await loadWebsites();
  };

  const handleAddWebsiteSuccess = async () => {
    // 重新加载网站列表和"我的"分类
    await loadWebsites();
    if (isAuthenticated && user) {
      const response = await websiteApi.getAll(-1);
      setMyWebsites(response.data);
    }
  };

  const handleDeleteWebsite = async (id: number) => {
    if (!window.confirm('确定要删除这个网站吗？')) {
      return;
    }

    try {
      await websiteApi.delete(id);
      // 重新加载网站列表和"我的"分类
      await loadWebsites();
      if (isAuthenticated && user) {
        const response = await websiteApi.getAll(-1);
        setMyWebsites(response.data);
      } else {
        // 如果未登录，清空"我的"分类
        setMyWebsites([]);
      }
    } catch (error: any) {
      console.error('删除网站失败:', error);
      if (error.response?.status === 401) {
        alert('登录已过期，请重新登录');
        // 清除认证信息
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        setMyWebsites([]);
        setShowLogin(true);
        // 重新加载网站列表（不包含"我的"分类）
        loadWebsites();
      } else {
        alert('删除网站失败: ' + (error.response?.data?.message || error.message || '请重试'));
      }
    }
  };

  const handleToggleFavorite = async (websiteId: number) => {
    if (!user) return;

    try {
      // 先检查是否已收藏
      const isFavorite = await websiteApi.checkFavorite(websiteId);
      
      if (isFavorite.data.isFavorite) {
        // 已收藏，取消收藏
        await websiteApi.removeFavorite(websiteId);
        alert('已取消收藏');
      } else {
        // 未收藏，添加收藏
        await websiteApi.addFavorite(websiteId);
        alert('收藏成功！已添加到"我的"分类');
      }
      
      // 重新加载"我的"分类的数据
      const response = await websiteApi.getAll(-1);
      setMyWebsites(response.data);
    } catch (error: any) {
      console.error('收藏操作失败:', error);
      if (error.response?.status === 401) {
        alert('登录已过期，请重新登录');
      } else {
        alert('操作失败: ' + (error.response?.data?.message || error.message || '请重试'));
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    // 权限检查：只有admin可以删除分类
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      alert('只有管理员可以删除分类');
      return;
    }

    // 检查该分类下是否有网站
    const websitesInCategory = websites.filter(w => w.categoryId === id);
    const category = categories.find(c => c.id === id);
    
    // "我的"分类是虚拟分类，不能删除
    if (category?.id === -1 || category?.name === '我的') {
      alert('"我的"分类是系统预设分类，不能删除');
      return;
    }
    
    if (category?.name === '其他') {
      alert('"其他"分类是系统预设分类，不能删除');
      return;
    }

    if (websitesInCategory.length > 0) {
      if (!window.confirm(`该分类下有 ${websitesInCategory.length} 个网站，删除分类后这些网站将自动移动到"其他"分类。确定要删除吗？`)) {
        return;
      }
    } else {
      if (!window.confirm('确定要删除这个分类吗？')) {
        return;
      }
    }

    try {
      await categoryApi.delete(id);
      // 重新加载分类列表和网站列表
      loadCategories();
      loadWebsites();
      // 如果删除的是当前选中的分类，重置选择
      if (selectedCategory === id) {
        setSelectedCategory(null);
      }
    } catch (error: any) {
      console.error('删除分类失败:', error);
      if (error.response?.status === 401) {
        alert('登录已过期，请重新登录');
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        setShowLogin(true);
      } else if (error.response?.status === 403) {
        alert('权限不足，只有管理员可以删除分类');
      } else {
        const errorMessage = error.response?.data?.message || error.message || '请重试';
        alert('删除分类失败: ' + errorMessage);
      }
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
    
    // 点击分类时，只滚动到对应位置，不加载数据
    // 所有分类的网站已经默认全部加载并显示
    const element = categoryRefs.current[categoryId];
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
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

  // 加载"我的"分类的网站（用户创建的和收藏的）
  useEffect(() => {
    if (isAuthenticated && user) {
      websiteApi.getAll(-1)
        .then(response => {
          setMyWebsites(response.data);
        })
        .catch(error => {
          console.error('加载"我的"分类失败:', error);
        });
    } else {
      // 未登录时，清空"我的"分类
      setMyWebsites([]);
    }
  }, [isAuthenticated, user]);

  // 组织网站数据：默认显示所有分类的网站（包括"我的"）
  const websitesByCategory = categories.map(category => {
    if (category.id === -1) {
      // "我的"分类：显示用户创建的和收藏的网站
      const myFilteredWebsites = myWebsites.filter(website =>
        website.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return {
        category,
        websites: myFilteredWebsites
      };
    } else {
      // 其他分类：显示该分类的网站
      return {
        category,
        websites: filteredWebsites.filter(w => w.categoryId === category.id)
      };
    }
  });

  const categoryColors = [
    '#1a73e8', '#ea4335', '#34a853', '#fbbc04', 
    '#ff6d00', '#9c27b0', '#00acc1', '#7cb342',
    '#e91e63', '#3f51b5', '#009688', '#ff5722'
  ];

  // 允许匿名访问，不强制登录
  // if (!isAuthenticated) {
  //   return <Login onLoginSuccess={handleLoginSuccess} />;
  // }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-logo">
            <div className="logo-icon">
              <span>🧭</span>
            </div>
            <span className="logo-text">Nnup の Navigation</span>
          </div>

          <div className="header-search">
            <input
              type="text"
              placeholder="可输入系统名称或关键字进行检索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  const bingSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(searchTerm.trim())}`;
                  window.open(bingSearchUrl, '_blank');
                }
              }}
              className="search-input"
            />
            <button 
              className="search-btn" 
              onClick={() => {
                if (searchTerm.trim()) {
                  const bingSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(searchTerm.trim())}`;
                  window.open(bingSearchUrl, '_blank');
                }
              }}
              title="Bing搜索"
            >🔍</button>
          </div>

          <div className="header-user">
            {isAuthenticated ? (
              <>
                <button 
                  className="add-website-header-btn" 
                  onClick={() => setShowAddWebsite(true)}
                  title="添加网站"
                >
                  ➕ 添加网站
                </button>
                <span className="user-name">{user?.username || 'admin'}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  退出登录
                </button>
              </>
            ) : (
              <button className="login-btn" onClick={() => setShowLogin(true)}>
                登录
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="main-wrapper">
        <aside className="sidebar">
          <nav className="category-nav">
            {categories.map((category, index) => {
              const isActive = selectedCategory === category.id;
              const color = categoryColors[index % categoryColors.length];
              return (
                <div
                  key={category.id}
                  className="category-tag-wrapper"
                  style={{
                    borderLeftColor: isActive ? color : 'transparent'
                  }}
                >
                  <button
                    className={`category-tag ${isActive ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <span className="tag-icon">{category.icon || '📁'}</span>
                    <span className="tag-name">{category.name}</span>
                  </button>
                  {/* 只有admin可以删除分类 */}
                  {isAuthenticated && user && (user.role === 'admin' || user.role === 'super_admin') && category.id !== -1 && (
                    <button
                      className="category-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      title="删除分类"
                    >
                      🗑️
                    </button>
                  )}
                </div>
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
                              style={{
                                borderTopColor: color
                              }}
                            >
                              <div 
                                className="website-card-content"
                                onClick={() => handleWebsiteClick(website)}
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
                              {/* 收藏按钮 - user及以上角色可以收藏公开网站（需要登录） */}
                              {isAuthenticated && user && (user.role === 'user' || user.role === 'premium' || user.role === 'admin' || user.role === 'super_admin') && website.isPublic && (
                                <button
                                  className="website-favorite-btn"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleToggleFavorite(website.id);
                                  }}
                                  title="收藏网站"
                                >
                                  ⭐
                                </button>
                              )}
                              {/* 删除按钮 - user只能删除自己的，admin可以删除所有（需要登录） */}
                              {isAuthenticated && user && (
                                (user.role === 'admin' || user.role === 'super_admin' || (user.role === 'user' && website.userId === user.id)) && (
                                  <button
                                    className="website-delete-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteWebsite(website.id);
                                    }}
                                    title="删除网站"
                                  >
                                    🗑️
                                  </button>
                                )
                              )}
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
          <p className="footer-text">
            <a 
              href={import.meta.env.VITE_WEBSITE_URL || 'http://192.168.10.107:5173'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              Nnup
            </a>
            {' © '}
            <a 
              href="https://beian.miit.gov.cn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              鄂ICP备2025166963号
            </a>
          </p>
        </div>
      </footer>

      {showLogin && <Login onLoginSuccess={handleLoginSuccess} onClose={() => setShowLogin(false)} />}
      {showAddWebsite && isAuthenticated && (
        <AddWebsite 
          categories={categories} 
          onSuccess={handleAddWebsiteSuccess}
          onClose={() => setShowAddWebsite(false)}
          onCategoryCreated={(newCategory) => {
            // 更新分类列表
            setCategories(prev => [...prev, newCategory]);
          }}
        />
      )}
    </div>
  );
}

export default App;
