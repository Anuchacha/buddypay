import CryptoJS from 'crypto-js';

// กำหนดคีย์ลับสำหรับการเข้ารหัส/ถอดรหัส
const SECRET_KEY = 'buddypay-secure-key-2023';

// เข้ารหัสข้อมูล
export function encrypt(data: string): string {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

// ถอดรหัสข้อมูล
export function decrypt(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// เข้ารหัสสำหรับผู้ใช้งาน
export function encryptForUser(data: string, userId: string): string {
  const userKey = SECRET_KEY + userId;
  return CryptoJS.AES.encrypt(data, userKey).toString();
}

// ถอดรหัสสำหรับผู้ใช้งาน
export function decryptForUser(encryptedData: string, userId: string): string {
  const userKey = SECRET_KEY + userId;
  const bytes = CryptoJS.AES.decrypt(encryptedData, userKey);
  return bytes.toString(CryptoJS.enc.Utf8);
} 