"use client";

import { useState } from "react";
import CustomerProfileForm from "@/components/CustomerProfileForm";
import RecommendationReport from "@/components/RecommendationReport";
import ReportSkeleton from "@/components/ReportSkeleton";
import type { CustomerProfile } from "@/lib/types";
import type { RecommendationResult } from "@/lib/recommendation";

export default function Home() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (p: CustomerProfile) => {
    setProfile(p);
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? `요청 실패 (${res.status})`);
      }
      setResult(data as RecommendationResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            고객 프로파일 입력
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            산업·규모·인프라·페인포인트·컴플라이언스를 입력하면 안랩 제품 조합과
            도입 우선순위를 자동으로 제안합니다.
          </p>
        </div>

        <CustomerProfileForm onSubmit={handleSubmit} submitting={loading} />

        {loading && <ReportSkeleton />}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <div className="font-semibold">추천 생성 실패</div>
            <div className="mt-1 break-words">{error}</div>
            <div className="mt-2 text-xs text-red-700">
              .env.local에 ANTHROPIC_API_KEY가 설정되어 있는지 확인하세요.
            </div>
          </div>
        )}

        {result && profile && (
          <RecommendationReport result={result} profile={profile} />
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            데모 흐름
          </h3>
          <ol className="list-decimal space-y-1 pl-4 text-sm text-slate-600">
            <li>샘플 케이스 선택 또는 직접 입력</li>
            <li>솔루션 추천 받기</li>
            <li>제품 조합·근거·컴플라이언스 매핑 확인</li>
            <li>제안 요약 내보내기 (Phase 3)</li>
          </ol>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            입력 미리보기
          </h3>
          {profile ? (
            <pre className="max-h-80 overflow-auto rounded-md bg-slate-900 p-3 text-[11px] leading-snug text-slate-100">
              {JSON.stringify(profile, null, 2)}
            </pre>
          ) : (
            <p className="text-xs text-slate-500">
              아직 제출된 입력이 없습니다.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <p className="font-semibold">디스클레이머</p>
          <p className="mt-1">
            본 데모는 공개 자료 기반의 비공식 개인 포트폴리오이며 안랩과 무관합니다.
            실제 솔루션 도입 검토는 안랩 공식 SE의 확인을 받으셔야 합니다.
          </p>
        </div>
      </aside>
    </div>
  );
}
