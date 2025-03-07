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
