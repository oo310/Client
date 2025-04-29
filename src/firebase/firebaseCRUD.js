// src/services/firebaseService.js
import { db } from "./firebase"; // ✅ 引入 Firestore
import { collection, addDoc, serverTimestamp, deleteDoc, doc} from "firebase/firestore";

// ✅ 上傳教材到 Firestore
export const uploadLesson = async (title, content) => {
  if (!title || !content) throw new Error("請填寫所有欄位！");

  try {
    const docRef = await addDoc(collection(db, "lessons"), {
      title:title,
      content: content,
      createdAt: serverTimestamp(), // ✅ Firestore 內建時間戳記
      lastUpdated: serverTimestamp(),
    });

    console.log("✅ 教材已成功上傳，文件 ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("🔥 上傳教材失敗:", error);
    return error;
  }
};



// ✅ 上傳題目到 Firestore
export const uploadExercise = async (title, tag, question, code, codeLabels) => {
  if (!title || !tag || !question || !code) throw new Error("請填寫所有欄位！");

  try {
    const docRef = await addDoc(collection(db, "quiz"), {
      title,
      tag,
      question, // 🔥 存入題目內容
      code, // 🔥 存入正確答案
      codeLabels,// 🔥 存入程式碼標籤
      createdAt: serverTimestamp(), // ✅ Firestore 內建時間戳記
      lastUpdated: serverTimestamp(),
    });

    console.log("✅ 題目已成功上傳，文件 ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("🔥 上傳題目失敗:", error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  if (!collectionName || !docId) throw new Error("請提供集合名稱和文件 ID！");

  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log("✅ 文件已成功刪除，文件 ID:", docId);
  } catch (error) {
    console.error("🔥 刪除文件失敗:", error);
    throw error;
  }
};