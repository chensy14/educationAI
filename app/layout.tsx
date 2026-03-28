import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EducationAI Demo",
  description: "학년·과목·단원 입력 후 md와 ppt를 생성하는 데모",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
