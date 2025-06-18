import https from 'https';
import fs from 'fs';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// อ่านไฟล์ใบรับรอง
const options = {
  key: fs.readFileSync('certificates/localhost-key.pem'), // เปลี่ยน path ให้ถูกต้อง
  cert: fs.readFileSync('certificates/localhost.pem'),   // เปลี่ยน path ให้ถูกต้อง
};

// สร้างเซิร์ฟเวอร์ HTTPS
app.prepare().then(() => {
  const server = https.createServer(options, (req, res) => {
    handle(req, res);
  });

  // เริ่มเซิร์ฟเวอร์
  server.listen(3000, () => {
    // Server logging ใน development เท่านั้น
if (process.env.NODE_ENV === 'development') {
  console.log('Server is running at https://localhost:3000');
}
  });
});
