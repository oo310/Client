import React from 'react';
import "./Home.css"
import { useAuth } from '../AuthContext';
const Home = () => {
  const { userInfo, timeoutWarning } = useAuth();

  return (
    <div>
      {timeoutWarning && (
        <div className="warning-message">
          您即將因閒置而登出，請點擊任意處繼續使用
        </div>
      )}
      <h1>歡迎來到Python學習平台</h1>
      {userInfo && (
        <div>
          <h2>歡迎, {userInfo.name}!</h2>
        </div>
      )}
      <div className="announcement">
        <h2>平台公告</h2>
        <p>歡迎使用我們的Python學習平台！以下是一些使用指南：</p>
        <ul>
          <li>點擊教材列表瀏覽課程單元並選擇您感興趣的內容。</li>
          <li>選擇題目列表進行練習來加深您的知識。</li>
          <li>請點選連結<a href='https://forms.gle/muexCsdSkbUHkCLM9'>https://forms.gle/muexCsdSkbUHkCLM9</a>告訴我們您的使用體驗，謝謝</li>
          <li>如果您有任何問題，請聯繫我們。</li>
        </ul>
      </div>
    </div>
    
  );
};

export default Home;