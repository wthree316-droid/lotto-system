// --- 1. วาง Firebase Config ของคุณตรงนี้ ---
const firebaseConfig = {
    apiKey: "AIzaSyAz6O5mupe1-qgokiLuYPCBUB_nJidfpN0",
    authDomain: "lotto-system-1de03.firebaseapp.com",
    projectId: "lotto-system-1de03",
    storageBucket: "lotto-system-1de03.firebasestorage.app",
    messagingSenderId: "356014473470",
    appId: "1:356014473470:web:e4693890639dd62cf465af",
    measurementId: "G-CZNKYPXDR0"
  };

// --- 2. เริ่มต้นการทำงาน Firebase ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ฟังก์ชันสำหรับดึงชื่อคนล็อกอินปัจจุบัน (ใช้ได้ทุกหน้า)
function getCurrentUser() {
    return localStorage.getItem('agentName');
}

// ฟังก์ชันเช็คว่าล็อกอินหรือยัง ถ้ายังให้ดีดกลับหน้า Login
function requireAuth() {
    if (!getCurrentUser()) {
        window.location.href = 'login.html';
    }
}