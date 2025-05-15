import { getFirestore, collection, query, where, getDocs, setDoc, serverTimestamp, doc, getDoc  } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
const auth = getAuth();
const db = getFirestore();
/**
 * 查詢用戶登入
 * @param {string} email - 使用者的電子郵件
 * @param {string} password - 使用者的密碼
 * @returns {Promise<object|null>} - 成功返回用戶資訊，失敗返回 null
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in:", user.uid);
    // 查詢 Firestore 中的 `users` 集合
    const usersRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(usersRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("User data from Firestore:", userData);

      // 返回用戶資訊
      return {
        uid: user.uid,
        email: user.email,
        ...userData
      };
    } else {
      console.log("No user data found in Firestore!");
      return null;
    }
  } catch (error) {
    console.error("Error logging in:", error.message);
    return null;
  }
};

/**
 * 註冊新用戶
 * @param {string} username - 使用者名稱
 * @param {string} email - 電子郵件
 * @param {string} password - 密碼
 * @param {Array} quizs - 題目資料
 * @returns {Promise<object>} - 返回註冊結果
 */
export const registerUser = async (username, email, password, quizs) => {
  try {
    // 檢查 email 是否已存在
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 將題目按 tag 分類
    const materialsByTag = {};
    let totalQuestions = quizs.length;

    // 創建新用戶資料
    const userData = {
      name: username,
      email: email,
      role: "user",
      createdAt: serverTimestamp(),
    };
    const scoreData = {
      
      materials: {},
      lastAccessedMaterial: null,
      completedQuestions: 0,
      totalQuestions: totalQuestions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 添加到 Firestore
    const docRef = await setDoc(doc(db, "users", user.uid), userData);
    const docRef1 = await setDoc(doc(db, "grades", user.uid), scoreData);
    const docRef2 = await setDoc(doc(db, "test", user.uid),{});
    
    return {
      success: true,
      userId: user.uid,
      userData: { id: user.uid, ...userData }
    };

  } catch (error) {
    console.error("註冊失敗：", error);
    return {
      success: false,
      // error: error.message || "註冊過程中發生錯誤"
      error: error.code === "auth/email-already-in-use" ? "這個電子郵件已經被註冊過了，請使用其他電子郵件！" : "註冊時發生錯誤，請再試一次"
    };
  }
};