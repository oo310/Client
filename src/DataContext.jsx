// 創建一個新的 Context 文件 (DataContext.js)
import React, { createContext, useState , useEffect} from 'react';
import { db, collection, getDocs, orderBy, query, onSnapshot } from './firebase/firebase';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [quizs, setQuizs] = useState([]); // 存放 quizs 資料
  const [lessons, setLessons] = useState([]); // 存放 lessons 資料

  // 監聽 quizs 資料庫
  useEffect(() => {
    const unsubscribeQuizs = onSnapshot(
      collection(db, "quiz"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuizs(data); // 更新 quizs 狀態
      },
      (error) => {
        console.error("Error fetching quizs: ", error);
      }
    );

    return () => unsubscribeQuizs(); // 清理 quizs 的監聽器
  }, []);

  // 監聽 lessons 資料庫
  useEffect(() => {
    const lessonsQuery = query(
      collection(db, "lessons"),
      orderBy("createdAt", "asc") // 根據 createdAt 欄位做遞減排序
    );
  
    const unsubscribeLessons = onSnapshot(
      lessonsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setLessons(data); // 更新 lessons 狀態
      },
      (error) => {
        console.error("Error fetching lessons: ", error);
      }
    );
  
    return () => unsubscribeLessons(); // 清理 lessons 的監聽器
  }, []);


  return (
    <DataContext.Provider value={{ quizs, lessons }}>
      {children}
    </DataContext.Provider>
  );
};