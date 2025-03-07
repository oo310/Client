import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../DataContext';
import "./ExList.css"
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { deleteDocument } from '../firebase/firebaseCRUD';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../AuthContext';
const ExList = () => {
  const navigate = useNavigate();
  const { quizs } = useContext(DataContext);
  const { userInfo } = useAuth();
  const [expandedTags, setExpandedTags] = useState(new Set());
  // console.log(quizs);
  const handleClick = (item, groupedQuizs) => {
    navigate(`/exercise`, { state: { item, groupedQuizs } }); // 導航到詳細頁面，並將 `id` 傳遞到路由中
  };
  const handleDelete = async (exerciseId) => {
    console.log('Delete exercise', exerciseId);
    try {
      await deleteDocument('quiz', exerciseId);
      console.log('Exercise deleted successfully');
      // 你可能需要在這裡更新本地狀態以反映刪除操作
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };
  const handleEdit = (exerciseId) => {
    console.log('Edit exercise', exerciseId);
    // 編輯邏輯
  };
  const groupedQuizs = useMemo(() => {
    // 先將整個陣列依照 createdAt 排序
    const sortedQuizs = [...quizs].sort((a, b) => {
      // 將日期字串轉換為時間戳記進行比較
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      // 使用升序排列（舊到新）
      return dateA - dateB;
      // 如果要降序排列（新到舊），可以改為：
      // return dateB - dateA;
    });

    // 進行分組
    return sortedQuizs.reduce((groups, quiz) => {
      if (!groups[quiz.tag]) {
        groups[quiz.tag] = [];
      }
      groups[quiz.tag].push(quiz);
      return groups;
    }, {});
  }, [quizs]);
  // Toggle tag expansion
  const toggleTag = (tag) => {
    setExpandedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };
  return (
    <>
      <h1>題目列表</h1>
      <div>
        <ul id="data-list" className="list-group">
          {Object.entries(groupedQuizs).map(([tag, items]) => (
            <div key={tag} className="bg-gray-50 rounded-lg shadow-sm">
              <div
                className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg"
                onClick={() => toggleTag(tag)}
                style={{ cursor: 'pointer' }}
              >
                <span className="font-medium">{tag}</span>
                <span className={`transform transition-transform ${expandedTags.has(tag) ? 'rotate-180' : ''
                  }`}>
                  ▼
                </span>
              </div>

              {expandedTags.has(tag) && (
                <ul className="list-none p-0 m-0 border-t border-gray-200">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div
                          className="flex-grow-1"
                          onClick={() => handleClick(item, groupedQuizs[tag])}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.title}
                        </div>
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
              )}
            </div>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ExList;