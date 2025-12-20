import React, { useState } from 'react';
import { authService } from '../services/auth';
import type { LoginCredentials, RegisterData } from '../services/auth';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 自定义验证
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    if (!isLogin) {
      if (!email.trim()) {
        setError('请输入邮箱');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('请输入有效的邮箱地址');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次密码输入不一致');
        return;
      }
      if (password.length < 6) {
        setError('密码长度至少为6位');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const credentials: LoginCredentials = { username, password };
        await authService.login(credentials);
        onLoginSuccess();
      } else {
        const registerData: RegisterData = { username, password, email };
        await authService.register(registerData);
        setError('');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        alert('注册成功！请登录');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (isLogin ? '登录失败，请检查用户名和密码' : '注册失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={handleClose}>
          ✕
        </button>

        <div className="login-modal-header">
          <h2 className="login-modal-title">{isLogin ? '登录以继续使用' : '创建账户'}</h2>
          <p className="login-modal-subtitle">
            {isLogin ? '请输入您的账号信息' : '注册新账户以使用导航系统'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-modal-form">
          {error && (
            <div className="login-error-message">
              <span className="login-error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="login-form-group">
            <label className="login-form-label">
              <span className="login-label-icon">👤</span>
              <span>用户名</span>
            </label>
            <input
              type="text"
              className="login-form-input"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="login-form-group">
              <label className="login-form-label">
                <span className="login-label-icon">📧</span>
                <span>邮箱</span>
              </label>
              <input
                type="email"
                className="login-form-input"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="login-form-group">
            <label className="login-form-label">
              <span className="login-label-icon">🔒</span>
              <span>密码</span>
            </label>
            <input
              type="password"
              className="login-form-input"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="login-form-group">
              <label className="login-form-label">
                <span className="login-label-icon">🔐</span>
                <span>确认密码</span>
              </label>
              <input
                type="password"
                className="login-form-input"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-btn-spinner"></span>
                <span>{isLogin ? '登录中...' : '注册中...'}</span>
              </>
            ) : (
              <span>{isLogin ? '登录' : '注册'}</span>
            )}
          </button>

          <div className="login-form-footer">
            <span className="login-footer-text">
              {isLogin ? '还没有账号？' : '已有账号？'}
            </span>
            <button
              type="button"
              className="login-switch-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
                setConfirmPassword('');
                setEmail('');
              }}
              disabled={loading}
            >
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
