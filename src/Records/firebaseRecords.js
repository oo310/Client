import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// 取得某個使用者所有作答紀錄（依 userId）
export async function getUserAllRecords(userId) {
  const q = query(collection(db, 'grades'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 取得某個題目所有作答紀錄（依 quizId）
export async function getQuizAllRecords(quizId) {
  const q = query(collection(db, 'grades'), where('quizId', '==', quizId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 取得所有人的作答紀錄
export async function getAllRecords() {
  const q = query(collection(db, 'grades'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 你可以依需求擴充更多查詢
