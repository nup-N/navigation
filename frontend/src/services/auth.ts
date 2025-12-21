import axios from 'axios';

const AUTH_API_URL = `${import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:3001'}/api/auth`;
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

class AuthService {
  // 登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${AUTH_API_URL}/login`,
      credentials
    );

    // 保存 Token 和用户信息
    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }

    return response.data;
  }

  // 注册
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${AUTH_API_URL}/register`,
      data
    );

    // 保存 Token 和用户信息（注册成功后自动登录）
    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }

    return response.data;
  }

  // 登出
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // 获取 Token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // 获取用户信息
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // 获取当前用户信息（从服务器）
  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('未登录');
    }

    const response = await axios.get<User>(`${AUTH_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  }

  // 验证 Token
  async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const response = await axios.post(`${AUTH_API_URL}/verify`, { token });
      return response.data.valid;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();