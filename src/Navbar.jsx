import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext'; // 假設 AuthContext 已經實作
import './Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css'
const Navbar = () => {
  const { userInfo, login, logout } = useAuth(); // 從 AuthContext 獲取登入資訊與方法
  const navbarRef = useRef(null);

  // 收回導覽列
  const handleNavCollapse = () => {
    if (navbarRef.current) {
      const bsCollapse = new window.bootstrap.Collapse(navbarRef.current, {
        toggle: false, // 確保不會在初始化時影響其他狀態
      });
      bsCollapse.hide(); // 手動觸發收回
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* 網站名稱 */}
        <Link className="navbar-brand" to="/" onClick={handleNavCollapse}>
          <i className="fas fa-home"></i> {userInfo ? "歡迎, " + userInfo.name : "首頁"}
        </Link>
        {/* 漢堡按鈕 */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="切換導航"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* 導覽列內容 */}
        <div className="collapse navbar-collapse" id="navbarNav" ref={navbarRef}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/te_list" onClick={handleNavCollapse}>測驗模式</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/list" onClick={handleNavCollapse}>教材列表</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/ex_list" onClick={handleNavCollapse}>題目列表</Link>
            </li>
            {userInfo ? (
              // 如果已登入，顯示使用者名稱和登出按鈕
              <>
                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={logout}>登出</button>
                </li>
              </>
            ) : (
              // 如果未登入，顯示登入按鈕
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={handleNavCollapse}>登入</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
