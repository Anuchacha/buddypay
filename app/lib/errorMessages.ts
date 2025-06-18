/**
 * ไฟล์เก็บข้อความ error ที่ใช้ซ้ำในแอปพลิเคชัน
 * อัปเดตให้มีความครอบคลุมและเป็นมิตรกับผู้ใช้มากขึ้น
 */

// ข้อความ error จาก Firebase Authentication
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'auth/wrong-password': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
  'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิกใหม่',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง กรุณาระบุอีเมลที่ถูกต้อง',
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ',
  'auth/weak-password': 'รหัสผ่านไม่ปลอดภัย กรุณาใช้รหัสผ่านที่มีความยาวอย่างน้อย 6 ตัวอักษร',
  'auth/invalid-password': 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
  
  // Google Sign-in errors
  'auth/popup-closed-by-user': 'การเข้าสู่ระบบถูกยกเลิก กรุณาลองเข้าสู่ระบบอีกครั้ง',
  'auth/popup-blocked': 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัปและลองใหม่',
  'auth/cancelled-popup-request': 'การเข้าสู่ระบบถูกยกเลิก กรุณาลองอีกครั้ง',
  'auth/unauthorized-domain': 'โดเมนนี้ไม่ได้รับอนุญาตให้ใช้งาน Firebase Authentication',
  'auth/operation-not-supported-in-this-environment': 'การดำเนินการนี้ไม่รองรับในสภาพแวดล้อมปัจจุบัน',
  
  // Rate limiting and security
  'auth/too-many-requests': 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
  'auth/user-disabled': 'บัญชีผู้ใช้นี้ถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
  'auth/account-exists-with-different-credential': 'บัญชีนี้มีอยู่แล้วแต่ใช้วิธีการเข้าสู่ระบบอื่น',
  'auth/credential-already-in-use': 'ข้อมูลการเข้าสู่ระบบนี้ถูกใช้งานแล้ว',
  
  // Network and technical errors
  'auth/network-request-failed': 'เกิดปัญหาการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่',
  'auth/timeout': 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
  'auth/operation-not-allowed': 'การดำเนินการนี้ไม่ได้รับอนุญาต กรุณาติดต่อผู้ดูแลระบบ',
  'auth/requires-recent-login': 'กรุณาเข้าสู่ระบบใหม่เพื่อดำเนินการนี้เพื่อความปลอดภัย',
  
  // Invalid credentials
  'auth/invalid-credential': 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
  'auth/user-token-expired': 'เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่',
  'auth/invalid-user-token': 'เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่',
  'auth/custom-token-mismatch': 'ข้อมูลการตรวจสอบไม่ตรงกัน กรุณาเข้าสู่ระบบใหม่',
  
  // Additional common errors
  'auth/missing-password': 'กรุณาระบุรหัสผ่าน',
  'auth/missing-email': 'กรุณาระบุอีเมล',
  'auth/internal-error': 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
};

// ข้อความ error จาก Firestore
export const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้',
  'not-found': 'ไม่พบข้อมูลที่ต้องการ',
  'already-exists': 'ข้อมูลนี้มีอยู่แล้วในระบบ',
  'resource-exhausted': 'เกินขีดจำกัดการใช้งาน กรุณาลองใหม่อีกครั้งในภายหลัง',
  'failed-precondition': 'ไม่สามารถดำเนินการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
  'unavailable': 'บริการไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่อีกครั้ง',
  'cancelled': 'การดำเนินการถูกยกเลิก',
  'data-loss': 'เกิดข้อผิดพลาดในการจัดเก็บข้อมูล กรุณาติดต่อผู้ดูแลระบบ',
  'deadline-exceeded': 'การดำเนินการใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
  'invalid-argument': 'ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
  'out-of-range': 'ข้อมูลเกินช่วงที่อนุญาต',
  'unauthenticated': 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
  'unimplemented': 'ฟีเจอร์นี้ยังไม่พร้อมใช้งาน',
  'aborted': 'การดำเนินการถูกยกเลิก กรุณาลองใหม่อีกครั้ง',
};

// ข้อความ error ทั่วไป
export const GENERAL_ERROR_MESSAGES: Record<string, string> = {
  'network-error': 'เกิดปัญหาการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่',
  'server-error': 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง',
  'validation-error': 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
  'timeout-error': 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
  'quota-exceeded': 'เกินขีดจำกัดการใช้งาน กรุณาลองใหม่อีกครั้งในภายหลัง',
  'service-unavailable': 'บริการไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้ง',
  'unknown': 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ',
  'parse-error': 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล',
  'connection-failed': 'ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
};

// ข้อความ error สำหรับการจัดการ Bill
export const BILL_ERROR_MESSAGES: Record<string, string> = {
  'bill-not-found': 'ไม่พบบิลที่ต้องการ',
  'invalid-bill-data': 'ข้อมูลบิลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
  'bill-already-exists': 'บิลนี้มีอยู่แล้วในระบบ',
  'insufficient-participants': 'ต้องมีผู้เข้าร่วมอย่างน้อย 2 คน',
  'invalid-amount': 'จำนวนเงินไม่ถูกต้อง กรุณาระบุตัวเลขที่ถูกต้อง',
  'calculation-error': 'เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง',
  'save-failed': 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
  'delete-failed': 'ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
  'unauthorized-access': 'คุณไม่มีสิทธิ์เข้าถึงบิลนี้',
};

/**
 * ฟังก์ชันสำหรับแปลง error code เป็นข้อความที่อ่านง่าย
 * อัปเดตให้จัดการ error ได้หลากหลายขึ้น
 */
export function getErrorMessage(error: any): string {
  // Log เฉพาะใน development
  if (process.env.NODE_ENV === 'development') {
    console.log('Processing error:', error);
  }
  
  // จัดการ Firebase error object
  if (error?.code) {
    // ลำดับการค้นหา: Auth -> Firestore -> Bill -> General
    if (AUTH_ERROR_MESSAGES[error.code]) {
      return AUTH_ERROR_MESSAGES[error.code];
    }
    
    if (FIRESTORE_ERROR_MESSAGES[error.code]) {
      return FIRESTORE_ERROR_MESSAGES[error.code];
    }
    
    if (BILL_ERROR_MESSAGES[error.code]) {
      return BILL_ERROR_MESSAGES[error.code];
    }
  }
  
  // จัดการ error ที่มีแค่ message
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    // ตรวจสอบ patterns ใน message
    if (message.includes('network') || message.includes('fetch')) {
      return GENERAL_ERROR_MESSAGES['network-error'];
    }
    
    if (message.includes('timeout')) {
      return GENERAL_ERROR_MESSAGES['timeout-error'];
    }
    
    if (message.includes('quota') || message.includes('limit')) {
      return GENERAL_ERROR_MESSAGES['quota-exceeded'];
    }
    
    if (message.includes('unauthorized') || message.includes('permission')) {
      return 'คุณไม่มีสิทธิ์ในการดำเนินการนี้';
    }
    
    // หากเป็นข้อความภาษาไทยอยู่แล้ว ให้ใช้เลย
    if (/[\u0E00-\u0E7F]/.test(error.message)) {
      return error.message;
    }
  }
  
  // จัดการ error ที่มี name
  if (error?.name && GENERAL_ERROR_MESSAGES[error.name.toLowerCase()]) {
    return GENERAL_ERROR_MESSAGES[error.name.toLowerCase()];
  }
  
  // กรณีเป็น string error
  if (typeof error === 'string') {
    if (/[\u0E00-\u0E7F]/.test(error)) {
      return error; // ถ้าเป็นภาษาไทยแล้ว
    }
    return GENERAL_ERROR_MESSAGES['unknown'];
  }
  
  // กรณีไม่ทราบสาเหตุ
  return GENERAL_ERROR_MESSAGES['unknown'];
}

/**
 * ฟังก์ชันสำหรับบันทึก error เพื่อการวิเคราะห์
 * อัปเดตให้มีข้อมูลมากขึ้น
 */
export function logErrorToAnalytics(errorCode: string, errorMessage: string, context?: any): void {
  // ในอนาคตสามารถเชื่อมต่อกับระบบวิเคราะห์ error เช่น Firebase Analytics, Sentry ฯลฯ
  const errorLog = {
    code: errorCode,
    message: errorMessage,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    context: context || {},
  };
  
  // Log เฉพาะใน development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Analytics]', errorLog);
  }
  
  // ในอนาคตสามารถส่งไปยัง error tracking service
  // เช่น Sentry.captureException(error, { extra: errorLog });
}

/**
 * ฟังก์ชันสำหรับแสดง error แบบ user-friendly
 */
export function displayUserFriendlyError(error: any, context?: string): string {
  const friendlyMessage = getErrorMessage(error);
  const contextMessage = context ? ` (${context})` : '';
  
  return `${friendlyMessage}${contextMessage}`;
}

/**
 * ฟังก์ชันตรวจสอบว่า error เป็น network error หรือไม่
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const errorCode = error.code || '';
  const errorMessage = (error.message || '').toLowerCase();
  
  return (
    errorCode.includes('network') ||
    errorCode.includes('timeout') ||
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection')
  );
}

/**
 * ฟังก์ชันตรวจสอบว่า error เป็น authentication error หรือไม่
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;
  
  const errorCode = error.code || '';
  return errorCode.startsWith('auth/');
} 