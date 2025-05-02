/**
 * ไฟล์เก็บข้อความ error ที่ใช้ซ้ำในแอปพลิเคชัน
 */

// ข้อความ error จาก Firebase Authentication
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/wrong-password': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/user-not-found': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
  'auth/weak-password': 'รหัสผ่านไม่ปลอดภัย กรุณาใช้รหัสผ่านที่มีความยาวอย่างน้อย 6 ตัวอักษร',
  'auth/popup-closed-by-user': 'การเข้าสู่ระบบถูกยกเลิก',
  'auth/too-many-requests': 'มีการพยายามเข้าสู่ระบบมากเกินไป โปรดลองอีกครั้งในภายหลัง',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/network-request-failed': 'เกิดปัญหาด้านเครือข่าย กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
  'auth/operation-not-allowed': 'การดำเนินการนี้ไม่ได้รับอนุญาต',
  'auth/requires-recent-login': 'กรุณาเข้าสู่ระบบอีกครั้งเพื่อดำเนินการนี้',
};

// ข้อความ error จาก Firestore
export const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้',
  'not-found': 'ไม่พบข้อมูลที่ต้องการ',
  'already-exists': 'ข้อมูลนี้มีอยู่แล้วในระบบ',
  'resource-exhausted': 'เกินขีดจำกัดการใช้งาน Firebase',
  'failed-precondition': 'การดำเนินการไม่สามารถทำได้ในสถานะปัจจุบัน',
  'unavailable': 'บริการไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่อีกครั้ง',
};

// ข้อความ error ทั่วไป
export const GENERAL_ERROR_MESSAGES: Record<string, string> = {
  'network-error': 'เกิดปัญหาด้านเครือข่าย กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
  'server-error': 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง',
  'validation-error': 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
  'unknown': 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง',
};

/**
 * ฟังก์ชันสำหรับแปลง error code เป็นข้อความที่อ่านง่าย
 */
export function getErrorMessage(error: any): string {
  // สำหรับ Firebase Auth Error
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  
  // สำหรับ Firestore Error
  if (error.code && FIRESTORE_ERROR_MESSAGES[error.code]) {
    return FIRESTORE_ERROR_MESSAGES[error.code];
  }
  
  // สำหรับ error ที่มีชื่อ (name) แต่ไม่มี code
  if (error.name && GENERAL_ERROR_MESSAGES[error.name]) {
    return GENERAL_ERROR_MESSAGES[error.name];
  }
  
  // กรณีมีข้อความ error จาก server
  if (error.message) {
    return error.message;
  }
  
  // กรณีไม่ทราบสาเหตุ
  return GENERAL_ERROR_MESSAGES.unknown;
}

/**
 * ฟังก์ชันสำหรับบันทึก error เพื่อการวิเคราะห์
 */
export function logErrorToAnalytics(errorCode: string, errorMessage: string): void {
  // ในอนาคตสามารถเชื่อมต่อกับระบบวิเคราะห์ error เช่น Firebase Analytics, Sentry ฯลฯ
  console.error(`[Error Analytics] Code: ${errorCode}, Message: ${errorMessage}`);
} 