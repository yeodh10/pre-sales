import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="mt-3 text-lg font-semibold text-slate-900">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <div className="mt-5 flex gap-2">
        <Link
          href="/"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          추천으로 이동
        </Link>
        <Link
          href="/products"
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          제품 카탈로그
        </Link>
      </div>
    </div>
  );
}
