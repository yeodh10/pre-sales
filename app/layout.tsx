import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "안랩 Solution Fit Co-pilot",
  description:
    "고객 환경을 입력하면 안랩 제품 조합과 컴플라이언스 매핑을 자동 제안하는 프리세일즈 코파일럿 (비공식 포트폴리오 데모).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-brand text-white grid place-items-center font-bold">
                A
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  안랩 Solution Fit Co-pilot
                </div>
                <div className="text-xs text-slate-500">
                  Pre-sales recommendation demo
                </div>
              </div>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
              비공식 개인 포트폴리오 데모 · 안랩과 무관
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-slate-500">
          공개 자료 기반의 비공식 학습용 데모입니다. 실제 도입 검토는 안랩 공식 SE의
          확인을 거쳐 주십시오. 경쟁사 비교는 공개 정보에 한하며 과장·비방은 포함하지
          않습니다.
        </footer>
      </body>
    </html>
  );
}
