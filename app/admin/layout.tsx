import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แผงควบคุมผู้ดูแลระบบ",
  description: "จัดการผู้ใช้ บิล และการตั้งค่าระบบ"
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 