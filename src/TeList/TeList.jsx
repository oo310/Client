import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../DataContext';
import "./TeList.css"
import { useNavigate, useLocation } from 'react-router-dom';
import { deleteDocument, getTestListByCode } from '../firebase/firebaseCRUD';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../AuthContext';
import { getUserGrades } from '../firebase/firebaseUserGrades'; // 加在 import 區

const TeList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizs } = useContext(DataContext);
  const { userInfo } = useAuth();
  const [testIds, setTestIds] = useState([]);
  const [code, setCode] = useState(location.state?.code || '');
  const [inputMode, setInputMode] = useState(true);
  const [error, setError] = useState('');
  const [passedIds, setPassedIds] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // 取得 test_list 文件（根據代號）
  const fetchTestList = async (inputCode) => {
    setError('');
    const queryCode = (inputCode ?? code).trim();
    const data = await getTestListByCode(queryCode);
    if (data && data.list) {
      setTestIds(data.list);
      setInputMode(false);
    } else {
      setError('找不到對應的題目列表，請確認代號是否正確');
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (location.state?.code) {
      setCode(location.state.code);
      fetchTestList(location.state.code); // 直接查詢
      setInputMode(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (userInfo?.uid) {
      getUserGrades(userInfo.uid, "test").then((grades) => {
        const ids = [];
        if (grades) {
          Object.keys(grades).forEach(id => {
            ids.push(id);
          });
        }
        setPassedIds(ids);
      });
    }
  }, [userInfo]);

  // 只顯示 id 有在 test_list 裡的 quizs，並依 testIds 順序排列
  const sortedQuizs = testIds
    .map(id => quizs.find(q => q.id === id))
    .filter(Boolean); // 避免找不到的 id

  const handleClick = (item) => {
    navigate(`/test/${item.id}`, { state: { code, testIds } });
  };
  const handleDelete = async (exerciseId) => {
    try {
      await deleteDocument('quiz', exerciseId);
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };
  const handleEdit = (exerciseId) => {
    // 編輯邏輯
  };
  

  return (
    <>
      <h1>測驗題目列表</h1>
      {inputMode ? (
        <div style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
          <input
            type="text"
            placeholder="請輸入題組代號"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ padding: '8px', width: '70%' }}
          />
          <Button variant="primary" style={{ marginLeft: 8 }} onClick={() => fetchTestList()}>
            送出
          </Button>
          {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
        </div>
      ) : (
        <div>
          <ul id="data-list" className="list-group">
            {sortedQuizs.map((item) => (
              <li
                key={item.id}
                className="p-3 hover:bg-gray-100 cursor-pointer border-bottom"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div
                    className="flex-grow-1"
                    onClick={() => handleClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    {item.title}
                  </div>
                  {/* 通關勾勾 */}
                  {passedIds.includes(item.id) && (
                          isMobile ? (
                            <span
                              style={{
                                marginLeft: '16px',
                                color: '#4CAF50',
                                fontSize: '1.5em',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              aria-label="已通關"
                            >
                              <i className="fas fa-check"></i>
                            </span>
                          ) : (
                            <span style={{
                              marginLeft: '16px',
                              color: '#fff',
                              background: '#4CAF50',
                              borderRadius: '12px',
                              padding: '2px 12px',
                              fontSize: '0.95em',
                              fontWeight: 'bold'
                            }}>
                              已通關
                            </span>
                          )
                        )}
                  {userInfo?.role === "admin" && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item.id);
                        }}
                      >
                        編輯
                      </Button>
                      <Button
                        variant="danger"
                        className='ms-2 '
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        刪除
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Button variant="link" onClick={() => { setInputMode(true); setTestIds([]); }}>
            重新輸入代號
          </Button>
        </div>
      )}
    </>
  );
};

export default TeList;