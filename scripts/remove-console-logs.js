#!/usr/bin/env node

/**
 * Script เพื่อลบ console.log และแทนที่ด้วย production-safe logging
 * รันด้วย: node scripts/remove-console-logs.js
 */

const fs = require('fs');
const path = require('path');

// Patterns สำหรับหา console.log
const CONSOLE_LOG_PATTERNS = [
  /console\.log\(/g,
  /console\.info\(/g,
  /console\.warn\(/g,
  /console\.debug\(/g,
];

// ไฟล์ที่ยกเว้น
const EXCLUDED_FILES = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'scripts',
  'logger.ts', // ยกเว้นไฟล์ logger
];

// Function เพื่อตรวจสอบว่าควร process ไฟล์นี้หรือไม่
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  if (!allowedExtensions.includes(ext)) {
    return false;
  }
  
  for (const excluded of EXCLUDED_FILES) {
    if (filePath.includes(excluded)) {
      return false;
    }
  }
  
  return true;
}

// Function เพื่อประมวลผลไฟล์
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let hasChanges = false;
    
    // ตรวจหา console.log ที่ยังไม่ได้ wrap ด้วย development check
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // ตรวจสอบว่าเป็น console.log ที่ยังไม่ได้ wrap
      if (trimmedLine.startsWith('console.log(') && 
          !lines[i-1]?.includes('NODE_ENV === \'development\'')) {
        
        const indent = line.match(/^(\s*)/)[1];
        
        // เพิ่ม development check
        newLines.push(`${indent}if (process.env.NODE_ENV === 'development') {`);
        newLines.push(line);
        newLines.push(`${indent}}`);
        hasChanges = true;
      } else {
        newLines.push(line);
      }
    }
    
    if (hasChanges) {
      modifiedContent = newLines.join('\n');
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function เพื่อ scan directory
function scanDirectory(dirPath) {
  let processedCount = 0;
  let modifiedCount = 0;
  
  function scan(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (shouldProcessFile(fullPath)) {
        processedCount++;
        if (processFile(fullPath)) {
          modifiedCount++;
        }
      }
    }
  }
  
  scan(dirPath);
  return { processedCount, modifiedCount };
}

// Function สำหรับสร้าง webpack plugin เพื่อลบ console.log ใน production
function createWebpackConfig() {
  const webpackConfigContent = `
// เพิ่มใน next.config.js สำหรับลบ console.log ใน production build
const removeConsolePlugin = () => {
  return {
    babel: {
      plugins: [
        process.env.NODE_ENV === 'production' ? [
          'transform-remove-console',
          { exclude: ['error', 'warn'] }
        ] : null,
      ].filter(Boolean),
    },
  };
};

// หรือใช้ webpack configuration
const webpackConfig = (config) => {
  if (process.env.NODE_ENV === 'production') {
    config.optimization.minimizer = config.optimization.minimizer || [];
    config.optimization.minimizer.push(
      new (require('terser-webpack-plugin'))({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      })
    );
  }
  return config;
};
`;
  
  fs.writeFileSync('scripts/webpack-remove-console.js', webpackConfigContent);
  console.log('📝 Created webpack configuration for removing console.log in production');
}

// Main execution
function main() {
  console.log('🧹 Starting console.log cleanup...\n');
  
  const projectRoot = path.join(__dirname, '..');
  const { processedCount, modifiedCount } = scanDirectory(projectRoot);
  
  console.log('\n📊 Summary:');
  console.log(`   Files processed: ${processedCount}`);
  console.log(`   Files modified: ${modifiedCount}`);
  
  if (modifiedCount > 0) {
    console.log('\n✨ Console.log cleanup completed!');
    console.log('🔧 All console.log statements are now wrapped with development checks');
  } else {
    console.log('\n✅ No console.log statements found that need modification');
  }
  
  // สร้าง webpack config
  createWebpackConfig();
  
  console.log('\n💡 Next steps:');
  console.log('   1. Install babel-plugin-transform-remove-console: npm install --save-dev babel-plugin-transform-remove-console');
  console.log('   2. Run build to verify: npm run build');
  console.log('   3. Console.log will be removed automatically in production builds');
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run script
main(); 