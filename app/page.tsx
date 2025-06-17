export const revalidate = 3600;

import HomeClient from './HomeClient';

export default async function Home() {
  // สามารถ fetch ข้อมูลฝั่ง server ได้ที่นี่ในอนาคต
  return <HomeClient />;
}
