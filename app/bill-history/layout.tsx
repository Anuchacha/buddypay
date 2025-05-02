import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ประวัติบิล",
  description: "ดูประวัติบิลทั้งหมดของคุณ"
};

export default function BillHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 