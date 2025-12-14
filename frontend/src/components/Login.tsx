import React, { useState } from 'react';
import { authService } from '../services/auth';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ username, password });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>登录</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        {/* 注册提示区域 */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span style={{ color: '#666' }}>还没有账号？</span>
          <a 
            href="http://localhost:5173/register" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#667eea', 
              marginLeft: '8px', 
              textDecoration: 'none' 
            }}
          >
            立即注册
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;