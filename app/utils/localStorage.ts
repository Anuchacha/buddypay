// Utility สำหรับจัดการ localStorage แบบปลอดภัย
export const localStorageUtils = {
  /**
   * ดึงข้อมูลจาก localStorage โดยมีการตรวจสอบความปลอดภัย
   * @param key คีย์ที่ต้องการดึงข้อมูล
   * @param defaultValue ค่าเริ่มต้นหากไม่พบข้อมูล
   * @returns ข้อมูลที่ดึงได้ หรือ defaultValue หากไม่พบหรือเกิดข้อผิดพลาด
   */
  getItem: (key: string, defaultValue: any = null) => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error getting item ${key} from localStorage:`, e);
      return defaultValue;
    }
  },
  
  /**
   * บันทึกข้อมูลลง localStorage โดยมีการตรวจสอบความปลอดภัย
   * @param key คีย์ที่ต้องการบันทึกข้อมูล
   * @param value ค่าที่ต้องการบันทึก
   * @returns true หากบันทึกสำเร็จ, false หากเกิดข้อผิดพลาด
   */
  setItem: (key: string, value: any): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      // ป้องกันพื้นที่เต็ม
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (e) {
      // จัดการกรณี localStorage เต็มหรือปัญหาอื่นๆ
      console.error(`Error setting item ${key} in localStorage:`, e);
      
      if (e instanceof DOMException && (
        // ตรวจสอบ quota exceeded error
        e.code === 22 || 
        e.code === 1014 ||
        e.name === 'QuotaExceededError' || 
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        return false;
      }
      return false;
    }
  },
  
  /**
   * ลบข้อมูลออกจาก localStorage
   * @param key คีย์ที่ต้องการลบข้อมูล
   * @returns true หากลบสำเร็จ, false หากเกิดข้อผิดพลาด
   */
  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing item ${key} from localStorage:`, e);
      return false;
    }
  },
  
  /**
   * ตรวจสอบว่า localStorage สามารถใช้งานได้หรือไม่
   * @returns true หาก localStorage ใช้งานได้, false หากไม่สามารถใช้งานได้
   */
  isAvailable: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const testKey = '__test_key__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  /**
   * ลบข้อมูลทั้งหมดใน localStorage
   * @returns true หากลบสำเร็จ, false หากเกิดข้อผิดพลาด
   */
  clear: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }
}; 