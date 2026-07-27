export default function ReportSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-brand-dark">
        <span className="h-2 w-2 animate-ping rounded-full bg-brand" />
        추천을 생성하는 중…
      </div>

      {/* 헤더 카드 스켈레톤 */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="h-3 w-16 rounded bg-slate-200" />
        <div className="mt-3 h-5 w-2/3 rounded bg-slate-200" />
        <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-5/6 rounded bg-slate-100" />
        </div>
      </div>

      {/* 로드맵 스켈레톤 */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="h-3 w-20 rounded bg-slate-200" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 rounded bg-slate-100" />
              <div className="h-6 w-full rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>

      {/* 제품 카드 스켈레톤 */}
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-40 rounded bg-slate-100" />
            <div className="mt-3 h-12 w-full rounded bg-slate-100" />
            <div className="mt-3 space-y-1.5">
              <div className="h-2.5 w-5/6 rounded bg-slate-100" />
              <div className="h-2.5 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
