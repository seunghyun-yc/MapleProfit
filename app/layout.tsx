import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "메이플 사냥장부 | 소재비 수익 계산기",
  description: "소재비 횟수, 사냥 메소, 솔 에르다 조각을 기록하고 월별 수익을 확인하세요.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
