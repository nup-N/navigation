import axios from 'axios';
import type { Category, Website } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'; // 导航系统的后端地址

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加 Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 添加 Token 到请求:', config.method?.toUpperCase(), config.url);
    } else {
      console.warn('⚠️ 未找到 Token，请求可能失败:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理认证错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除所有本地存储的认证信息
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // 提示用户重新登录
      console.warn('认证失败，请重新登录');
      // 注意：不要自动跳转，让用户手动登录
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 分类 API
export const categoryApi = {
  getAll: () => apiClient.get<Category[]>('/categories'),
  getById: (id: number) => apiClient.get<Category>(`/categories/${id}`),
  create: (data: Partial<Category>) => apiClient.post<Category>('/categories', data),
  update: (id: number, data: Partial<Category>) => apiClient.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => apiClient.delete(`/categories/${id}`),
};

// 网站 API
export const websiteApi = {
  getAll: (categoryId?: number) => {
    const params = categoryId ? { categoryId } : {};
    return apiClient.get<Website[]>('/websites', { params });
  },
  getById: (id: number) => apiClient.get<Website>(`/websites/${id}`),
  create: (data: Partial<Website>) => apiClient.post<Website>('/websites', data),
  update: (id: number, data: Partial<Website>) => apiClient.put<Website>(`/websites/${id}`, data),
  delete: (id: number) => apiClient.delete(`/websites/${id}`),
  incrementClicks: (id: number) => apiClient.post(`/websites/${id}/click`),
  // click 方法作为 incrementClicks 的别名，更简洁
  click: (id: number) => apiClient.post(`/websites/${id}/click`),
  // 收藏功能
  addFavorite: (id: number) => apiClient.post<{ message: string }>(`/websites/${id}/favorite`),
  removeFavorite: (id: number) => apiClient.delete<{ message: string }>(`/websites/${id}/favorite`),
  checkFavorite: (id: number) => apiClient.get<{ isFavorite: boolean }>(`/websites/${id}/favorite`),
};