/**
 * Wrapper สำหรับ html-to-image ที่โหลดเฉพาะเมื่อต้องการใช้งาน
 * ลดขนาด bundle หลักให้เล็กลง
 */

export async function toPng(node: HTMLElement, options?: object): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot use toPng on the server side');
  }
  
  try {
    const htmlToImage = await import('html-to-image');
    return await htmlToImage.toPng(node, options);
  } catch (error) {
    console.error('Error loading html-to-image module:', error);
    throw error;
  }
}

export async function toJpeg(node: HTMLElement, options?: object): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot use toJpeg on the server side');
  }
  
  try {
    const htmlToImage = await import('html-to-image');
    return await htmlToImage.toJpeg(node, options);
  } catch (error) {
    console.error('Error loading html-to-image module:', error);
    throw error;
  }
}

export async function toBlob(node: HTMLElement, options?: object): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot use toBlob on the server side');
  }
  
  try {
    const htmlToImage = await import('html-to-image');
    return await htmlToImage.toBlob(node, options);
  } catch (error) {
    console.error('Error loading html-to-image module:', error);
    throw error;
  }
}

// Default export ที่มี method ทั้งหมด
export default {
  toPng,
  toJpeg,
  toBlob
}; 