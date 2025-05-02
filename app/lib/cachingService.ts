import localforage from 'localforage';

// กำหนดชนิดข้อมูลสำหรับ Cache Item
interface CacheItem<T> {
  value: T;
  expiry: number;
}

/**
 * บริการจัดการแคชด้วย localforage
 * ให้ประสิทธิภาพในการจัดเก็บและเรียกใช้ข้อมูล
 */
export const cachingService = {
  /**
   * บันทึกข้อมูลลงในแคช พร้อมกำหนดเวลาหมดอายุ
   * 
   * @param key คีย์สำหรับการจัดเก็บข้อมูล
   * @param value ข้อมูลที่ต้องการจัดเก็บ
   * @param expiresIn ระยะเวลาในการหมดอายุ (ms) ค่าเริ่มต้น 5 นาที
   */
  setItem: async <T>(key: string, value: T, expiresIn = 5 * 60 * 1000): Promise<void> => {
    const item: CacheItem<T> = {
      value,
      expiry: Date.now() + expiresIn,
    };
    
    try {
      await localforage.setItem(key, item);
    } catch (error) {
      console.error(`Error caching item with key "${key}":`, error);
    }
  },
  
  /**
   * ดึงข้อมูลจากแคช และตรวจสอบเวลาหมดอายุ
   * 
   * @param key คีย์ของข้อมูลที่ต้องการดึง
   * @returns ข้อมูลที่ดึงจากแคช หรือ null ถ้าไม่พบหรือหมดอายุแล้ว
   */
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const item = await localforage.getItem<CacheItem<T>>(key);
      
      // ถ้าไม่มีข้อมูลในแคช
      if (!item) return null;
      
      // ถ้าข้อมูลหมดอายุแล้ว ให้ลบทิ้ง
      if (Date.now() > item.expiry) {
        await localforage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error(`Error getting cached item with key "${key}":`, error);
      return null;
    }
  },
  
  /**
   * ลบข้อมูลจากแคชตามคีย์ที่ระบุ
   * 
   * @param key คีย์ของข้อมูลที่ต้องการลบ
   * @returns true ถ้าลบสำเร็จ, false ถ้าไม่สำเร็จ
   */
  removeItem: async (key: string): Promise<boolean> => {
    try {
      await localforage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing cached item with key "${key}":`, error);
      return false;
    }
  },
  
  /**
   * ล้างแคชตามแพทเทิร์นที่กำหนด
   * 
   * @param pattern รูปแบบของคีย์ที่ต้องการล้าง
   * @returns จำนวนคีย์ที่ถูกล้าง
   */
  clearCache: async (pattern: string): Promise<number> => {
    try {
      const keys = await localforage.keys();
      const matchingKeys = keys.filter(key => key.includes(pattern));
      
      await Promise.all(matchingKeys.map(key => localforage.removeItem(key)));
      
      return matchingKeys.length;
    } catch (error) {
      console.error(`Error clearing cache with pattern "${pattern}":`, error);
      return 0;
    }
  },
  
  /**
   * ล้างแคชทั้งหมด
   */
  clearAll: async (): Promise<void> => {
    try {
      await localforage.clear();
    } catch (error) {
      console.error("Error clearing all cache:", error);
    }
  },
  
  /**
   * กำหนดค่าคอนฟิกสำหรับ localforage
   * 
   * @param config คอนฟิกสำหรับ localforage
   */
  configure: (config: LocalForageOptions): void => {
    localforage.config(config);
  },
  
  /**
   * ดึงคีย์ทั้งหมดในแคช
   */
  getAllKeys: async (): Promise<string[]> => {
    try {
      return await localforage.keys();
    } catch (error) {
      console.error("Error getting all keys:", error);
      return [];
    }
  },
  
  /**
   * ตรวจสอบขนาดของแคชทั้งหมด
   * 
   * @returns ขนาดของแคชในหน่วย KB (โดยประมาณ)
   */
  getEstimatedSize: async (): Promise<number> => {
    try {
      let totalSize = 0;
      const keys = await localforage.keys();
      
      for (const key of keys) {
        const value = await localforage.getItem(key);
        totalSize += JSON.stringify(value).length;
      }
      
      // แปลงเป็น KB
      return Math.round(totalSize / 1024);
    } catch (error) {
      console.error("Error calculating cache size:", error);
      return 0;
    }
  }
}; 