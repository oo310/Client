// src/services/firebaseService.js
import { db } from "./firebase"; // ✅ 引入 Firestore
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";

// ✅ 更新使用者的作答結果
export const updateUserGrades = async (userId, item, timeElapsed, attempts) => {
  if (!userId) throw new Error("無效的使用者 ID");

  const timestamp = new Date();
  const userDocRef = doc(db, "grades", userId);

  try {
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      // 🔥 更新 Firestore，確保相同 `tag` (類別) 的題目存一起
      await updateDoc(userDocRef, {
        [`materials.${item.tag}.${item.id}`]: {
          title: item.title,
          isCorrect: true,
          timeElapsed,
          attempts,
          timestamp,
        },
        updatedAt: timestamp, // 🔥 記錄最新更新時間
        lastAccessedMaterial: item.title, // 🔥 記錄最後作答的題目名稱
      });
    } else {
      // 🔥 文件不存在，建立新的 `materials`
      await setDoc(userDocRef, {
        materials: {
          [item.tag]: {
            [item.id]: {
              title: item.title,
              isCorrect: true,
              timeElapsed,
              attempts,
              timestamp,
            },
          },
        },
        updatedAt: timestamp,
        lastAccessedMaterial: item.title,
      });
    }

    console.log("✅ 作答結果已更新到 Firebase `grades`");
  } catch (error) {
    console.error("🔥 更新 Firebase 失敗:", error);
    throw error;
  }
};

export const updateTestGrades = async (userId, item, timeElapsed, attempts) => {
  if (!userId) throw new Error("無效的使用者 ID");

  const timestamp = new Date();
  const docRef = doc(db, "test", userId);

  try {
    const docSnap = await getDoc(docRef);
    // 如果文件已存在且已有這題的 id，就不寫入
    if (docSnap.exists() && docSnap.data() && docSnap.data()[item.id]) {
      console.log("❗ 已有該題紀錄，不寫入");
      return;
    }

    // 合併寫入（保留其他題目）
    const data = {
      [item.id]: {
        tag: item.tag,
        title: item.title,
        isCorrect: true,
        timeElapsed,
        attempts,
        timestamp,
      }
    };

    await setDoc(docRef, data, { merge: true });
    console.log("✅ 作答結果已更新到 Firebase `test_grades`");
  } catch (error) {
    console.error("🔥 更新 Firebase 失敗:", error);
    throw error;
  }
};

export const getUserGrades = async (userId,table) => {
  const docRef = doc(db, table, userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};