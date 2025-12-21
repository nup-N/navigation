import React, { useState, useEffect } from 'react';
import { websiteApi, categoryApi } from '../services/api';
import type { Website, Category } from '../types';
import { COMMON_ICONS } from '../utils/icons';
import { authService } from '../services/auth';
import './AddWebsite.css';

interface AddWebsiteProps {
  categories: Category[];
  onSuccess: () => void;
  onClose: () => void;
  onCategoryCreated?: (newCategory: Category) => void;
}

const AddWebsite: React.FC<AddWebsiteProps> = ({ categories, onSuccess, onClose, onCategoryCreated }) => {
  const [user, setUser] = useState<{ id: number; username: string; role?: string } | null>(null);
  const [formData, setFormData] = useState<Partial<Website>>({
    title: '',
    url: '',
    description: '',
    icon: '',
    categoryId: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState<Partial<Category>>({
    name: '',
    icon: '',
  });
  const [creatingCategory, setCreatingCategory] = useState(false);

  // 获取用户信息
  useEffect(() => {
    const userInfo = authService.getUser();
    if (userInfo) {
      setUser(userInfo as { id: number; username: string; role?: string });
    }
  }, []);

  // 根据用户角色设置默认分类
  useEffect(() => {
    if (user) {
      // user用户只能选择"我的"分类（ID为-1）
      if (user.role === 'user' || user.role === 'premium') {
        const myCategory = categories.find(cat => cat.id === -1);
        if (myCategory) {
          setFormData(prev => ({ ...prev, categoryId: -1 }));
        }
      } else if ((user.role === 'admin' || user.role === 'super_admin') && categories.length > 0 && !formData.categoryId) {
        // admin用户可以选择任何分类（包括"我的"），默认选择第一个
        setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
      }
    }
  }, [user, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证必填字段
    if (!formData.title?.trim()) {
      setError('请输入网站名称');
      return;
    }
    if (!formData.url?.trim()) {
      setError('请输入网站 URL');
      return;
    }
    if (!formData.categoryId) {
      setError('请选择分类');
      return;
    }

    // URL 验证
    try {
      new URL(formData.url);
    } catch {
      setError('请输入有效的 URL（例如：https://example.com）');
      return;
    }

    setLoading(true);

    try {
      const response = await websiteApi.create(formData);
      console.log('添加网站成功:', response.data);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('添加网站失败:', err);
      console.error('错误详情:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage = err.response?.data?.message || err.message || '添加网站失败，请重试';
      setError(errorMessage);
      // 如果是认证错误，提示用户登录
      if (err.response?.status === 401) {
        setError('登录已过期，请重新登录后再添加网站');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Website, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name?.trim()) {
      setError('请输入分类名称');
      return;
    }

    setCreatingCategory(true);
    setError('');

    try {
      const response = await categoryApi.create(newCategoryData);
      console.log('创建分类成功:', response.data);
      
      // 通知父组件更新分类列表
      if (onCategoryCreated) {
        onCategoryCreated(response.data);
      }
      
      // 自动选择新创建的分类
      setFormData(prev => ({ ...prev, categoryId: response.data.id }));
      
      // 重置新建分类表单
      setNewCategoryData({ name: '', icon: '' });
      setShowNewCategory(false);
    } catch (err: any) {
      console.error('创建分类失败:', err);
      const errorMessage = err.response?.data?.message || err.message || '创建分类失败，请重试';
      setError(errorMessage);
      if (err.response?.status === 401) {
        setError('登录已过期，请重新登录');
      }
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <div className="add-website-overlay" onClick={onClose}>
      <div className="add-website-modal" onClick={(e) => e.stopPropagation()}>
        <button className="add-website-close" onClick={onClose}>✕</button>
        
        <div className="add-website-header">
          <h2 className="add-website-title">添加网站</h2>
          <p className="add-website-subtitle">添加一个新的网站到导航系统</p>
        </div>

        <form onSubmit={handleSubmit} className="add-website-form">
          {error && (
            <div className="add-website-error">
              <span className="add-website-error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="add-website-form-group">
            <label className="add-website-label">
              <span className="add-website-label-icon">📝</span>
              <span>网站名称 *</span>
            </label>
            <input
              type="text"
              className="add-website-input"
              placeholder="例如：Google"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="add-website-form-group">
            <label className="add-website-label">
              <span className="add-website-label-icon">🔗</span>
              <span>网站 URL *</span>
            </label>
            <input
              type="url"
              className="add-website-input"
              placeholder="https://example.com"
              value={formData.url || ''}
              onChange={(e) => handleChange('url', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="add-website-form-group">
            <label className="add-website-label">
              <span className="add-website-label-icon">📂</span>
              <span>分类 *</span>
            </label>
            <div className="add-website-category-wrapper">
              <select
                className="add-website-select"
                value={formData.categoryId || ''}
                onChange={(e) => handleChange('categoryId', e.target.value ? parseInt(e.target.value) : null)}
                disabled={loading || creatingCategory || (user && (user.role === 'user' || user.role === 'premium'))}
                required
              >
                <option value="">请选择分类</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {/* 只有admin可以创建分类 */}
              {(user && (user.role === 'admin' || user.role === 'super_admin')) && (
                <button
                  type="button"
                  className="add-website-new-category-btn"
                  onClick={() => {
                    setShowNewCategory(!showNewCategory);
                    setError('');
                  }}
                  disabled={loading || creatingCategory}
                >
                  {showNewCategory ? '取消新建' : '➕ 新建分类'}
                </button>
              )}
            </div>
            {/* user用户提示信息 */}
            {user && (user.role === 'user' || user.role === 'premium') && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                💡 普通用户只能将网站添加到"我的"分类
              </div>
            )}
            
            {showNewCategory && (
              <div className="add-website-new-category-form">
                <div className="add-website-new-category-inputs">
                  <input
                    type="text"
                    className="add-website-input"
                    placeholder="分类名称 *"
                    value={newCategoryData.name || ''}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={creatingCategory}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <div className="add-website-icon-selector">
                    <label className="add-website-label" style={{ marginBottom: '0.5rem' }}>
                      <span className="add-website-label-icon">🎨</span>
                      <span>选择图标（可选）</span>
                    </label>
                    <div className="add-website-icon-grid">
                      {COMMON_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className={`add-website-icon-item ${newCategoryData.icon === icon ? 'selected' : ''}`}
                          onClick={() => setNewCategoryData(prev => ({ ...prev, icon }))}
                          disabled={creatingCategory}
                          title={icon}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <div className="add-website-icon-custom">
                      <input
                        type="text"
                        className="add-website-input"
                        placeholder="或输入自定义图标（例如：📁）"
                        value={newCategoryData.icon && !COMMON_ICONS.includes(newCategoryData.icon) ? newCategoryData.icon : ''}
                        onChange={(e) => setNewCategoryData(prev => ({ ...prev, icon: e.target.value }))}
                        disabled={creatingCategory}
                        style={{ marginTop: '0.5rem', flex: 1 }}
                      />
                      {newCategoryData.icon && (
                        <button
                          type="button"
                          className="add-website-icon-clear"
                          onClick={() => setNewCategoryData(prev => ({ ...prev, icon: '' }))}
                          disabled={creatingCategory}
                        >
                          清除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="add-website-create-category-btn"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory || !newCategoryData.name?.trim()}
                >
                  {creatingCategory ? (
                    <>
                      <span className="add-website-btn-spinner"></span>
                      <span>创建中...</span>
                    </>
                  ) : (
                    '创建分类'
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="add-website-form-group">
            <label className="add-website-label">
              <span className="add-website-label-icon">📄</span>
              <span>描述</span>
            </label>
            <textarea
              className="add-website-textarea"
              placeholder="网站描述（可选）"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="add-website-form-group">
            <label className="add-website-label">
              <span className="add-website-label-icon">🖼️</span>
              <span>图标 URL</span>
            </label>
            <input
              type="url"
              className="add-website-input"
              placeholder="https://example.com/icon.png（可选）"
              value={formData.icon || ''}
              onChange={(e) => handleChange('icon', e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="add-website-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="add-website-btn-spinner"></span>
                <span>添加中...</span>
              </>
            ) : (
              <span>添加网站</span>
            )}
          </button>

          <button
            type="button"
            className="add-website-cancel"
            onClick={onClose}
            disabled={loading}
          >
            取消
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWebsite;

