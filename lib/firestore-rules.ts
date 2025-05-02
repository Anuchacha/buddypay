/*
 * ไฟล์นี้เป็นเพียงตัวอย่างของ Firebase Security Rules
 * คุณต้องนำโค้ดนี้ไปอัปโหลดในคอนโซล Firebase
 * หรือใช้ Firebase CLI เพื่ออัปโหลด Rules
 */

export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ฟังก์ชันสำหรับตรวจสอบการล็อกอิน
    function isAuthenticated() {
      return request.auth != null;
    }

    // ฟังก์ชันสำหรับตรวจสอบว่าเป็นเจ้าของข้อมูล
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // ฟังก์ชันสำหรับตรวจสอบสิทธิ์ admin
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Rules สำหรับ users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow write: if isOwner(userId) || isAdmin();
    }

    // Rules สำหรับ bills collection
    match /bills/{billId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || 
        resource.data.sharedWith[request.auth.uid] == true ||
        isAdmin()
      );
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        isAdmin()
      );
    }

    // Rules สำหรับ shares collection
    match /shares/{shareId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.sharedWith == request.auth.uid ||
        isAdmin()
      );
      allow write: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        isAdmin()
      );
    }
  }
}
`;

// ตัวอย่างวิธีการใช้งาน
// 1. ติดตั้ง Firebase CLI: npm install -g firebase-tools
// 2. ล็อกอิน: firebase login
// 3. สร้างไฟล์ firestore.rules ด้วยเนื้อหาจาก firestoreRules
// 4. อัปโหลด Rules: firebase deploy --only firestore:rules 