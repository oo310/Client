import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// 依 userId 取得 user 文件的 name 欄位
export async function getUserNameById(userId) {
  if (!userId) return '';
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().name || '';
  }
  return '';
}
