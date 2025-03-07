// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Firebase 配置資訊
const firebaseConfig = {
    apiKey: "AIzaSyDTzogyvt9OxwHYGjuTAbBtilg8rBn_YoY",
    authDomain: "test-45e2a.firebaseapp.com",
    projectId: "test-45e2a",
    storageBucket: "test-45e2a.appspot.com", 
    messagingSenderId: "498846669559",
    appId: "1:498846669559:web:efe3d17bd226fd6d1d51f2",
    measurementId: "G-8ZQGTJ2SJV"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 取得 Firestore 實例
const db = getFirestore(app);

// 輸出 Firestore 實例
export { db, collection, getDocs , onSnapshot ,addDoc, serverTimestamp};
