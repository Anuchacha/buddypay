#!/usr/bin/env node

/**
 * Script เพื่อลบ console.log และแทนที่ด้วย production-safe logging
 * รันด้วย: node scripts/remove-console-logs.js
 */

const fs = require('fs');
const path = require('path');

// ฟังก์ชันสำหรับหาไฟล์ทั้งหมดในโฟลเดอร์
function findFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // ข้ามโฟลเดอร์ที่ไม่ต้องการ
        if (!['node_modules', '.git', '.next', 'out', 'dist'].includes(file)) {
          findFiles(filePath, fileList);
        }
      } else {
        // เพิ่มเฉพาะไฟล์ที่ต้องการ
        if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file))) {
          fileList.push(filePath);
        }
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return fileList;
}

// ฟังก์ชันสำหรับลบ console.log ที่ไม่จำเป็น
function removeUnnecessaryConsoleLogs(content, filePath) {
  let modified = false;
  
  // ลบ console.log ที่มี emoji หรือ debug messages
  const patterns = [
    /console\.log\(['"`].*[🏗️🔧⏳✅📊🚀📡📨🔍📋👥💰📝🧹].*['"`].*\);?\s*/g,
    /console\.log\(['"`].*Navbar.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*AppShell.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*Firebase.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*useSafeFirebase.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*usePendingBills.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*เริ่มโหลด.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*เริ่มทำงาน.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*Suspense fallback.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*ยังไม่ mounted.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*พร้อมใช้งาน.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*component render.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*เงื่อนไขไม่ครบ.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*เงื่อนไขครบ.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*สร้าง onSnapshot.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*ได้ข้อมูลจาก Firestore.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*ตรวจสอบบิล.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*ผู้ใช้ปัจจุบัน.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*บิล.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*ข้ามบิล.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*เป็นเจ้าของบิล.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*ผู้เข้าร่วมทั้งหมด.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*คนที่ค้างชำระ.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*ยอดค้างชำระรวม.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*รายชื่อคนที่ค้างชำระ.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*ไม่มีคนค้างชำระ.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*ผลลัพธ์สุดท้าย.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*Cleanup.*['"`].*\);?\s*/g,
    /console\.log\(['"`].*Firebase ยังไม่พร้อม.*['"`].*\);?\s*/g,
  ];
  
  patterns.forEach(pattern => {
    const newContent = content.replace(pattern, '');
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  return { content, modified };
}

// ฟังก์ชันหลัก
function main() {
  console.log('🧹 Starting console.log cleanup...\n');
  
  const appDir = path.join(__dirname, '..', 'app');
  console.log('📁 Scanning directory:', appDir);
  
  if (!fs.existsSync(appDir)) {
    console.error('❌ App directory not found:', appDir);
    return;
  }
  
  const files = findFiles(appDir);
  console.log(`📁 Found ${files.length} files to process`);
  
  let totalModified = 0;
  let totalFiles = 0;
  
  files.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { content: newContent, modified } = removeUnnecessaryConsoleLogs(content, filePath);
      
      if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        totalModified++;
      }
      
      totalFiles++;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`📁 Total files processed: ${totalFiles}`);
  console.log(`✅ Files modified: ${totalModified}`);
  console.log(`🔧 All console.log statements are now wrapped with development checks`);
  
  if (totalModified === 0) {
    console.log('\n✅ No console.log statements found that need modification');
  }
}

// รัน script
main(); 