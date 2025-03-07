// AuthContext.js
import React, { createContext, useState, useEffect, useMemo,useContext } from 'react';

const AuthContext = createContext(null);
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30分鐘，可以依需求調整

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  // 監控使用者活動
  useEffect(() => {
    if (!userInfo) return; // 如果未登入，不需要監控

    const updateActivity = () => {
      setLastActivity(Date.now());
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // 監聽使用者操作
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    // 定時檢查是否超時
    const checkTimeout = setInterval(() => {
      const currentTime = Date.now();
      const lastActivityTime = parseInt(localStorage.getItem('lastActivity') || Date.now());
      
      if (currentTime - lastActivityTime > TIMEOUT_DURATION) {
        logout(); // 超時登出
        alert('因閒置過久，已自動登出');
      }
    }, 1000); // 每秒檢查一次

    // 清理事件監聽
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(checkTimeout);
    };
  }, [userInfo]);

  const login = (data) => {
    setUserInfo(data);
    setIsLoggedOut(false);
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  const logout = () => {
    setUserInfo(null);
    setIsLoggedOut(true); // 更新登出狀態
    localStorage.removeItem('userInfo');
    localStorage.removeItem('lastActivity');
    // window.location.reload()
  };

  const authValue = useMemo(() => ({
    userInfo,
    isLoggedOut,
    login,
    logout
  }), [userInfo]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};