"use client";

import { useState } from "react";
import type { CustomerProfile, Infrastructure } from "@/lib/types";
import {
  COMPLIANCE_OPTIONS,
  INDUSTRY_OPTIONS,
  PAIN_OPTIONS,
  SIZE_OPTIONS,
} from "@/lib/options";
import { PRESETS } from "@/lib/presets";

const EMPTY_PROFILE: CustomerProfile = {
  companyName: "",
  industry: "manufacturing",
  size: "mid",
  employeeCount: undefined,
  endpointCount: undefined,
  infrastructure: {
    hasAv: false,
    hasFirewall: false,
    hasEdr: false,
    hasSoc: false,
    networkSeparation: false,
    cloudUsage: "none",
    otEnvironment: false,
  },
  painPoints: [],
  compliance: [],
  notes: "",
};

interface Props {
  onSubmit: (profile: CustomerProfile) => void;
  submitting?: boolean;
}

export default function CustomerProfileForm({ onSubmit, submitting }: Props) {
  const [profile, setProfile] = useState<CustomerProfile>(EMPTY_PROFILE);

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) setProfile(preset.profile);
  };

  const togglePain = (value: CustomerProfile["painPoints"][number]) => {
    setProfile((p) => ({
      ...p,
      painPoints: p.painPoints.includes(value)
        ? p.painPoints.filter((v) => v !== value)
        : [...p.painPoints, value],
    }));
  };

  const toggleCompliance = (
    value: CustomerProfile["compliance"][number],
  ) => {
    setProfile((p) => ({
      ...p,
      compliance: p.compliance.includes(value)
        ? p.compliance.filter((v) => v !== value)
        : [...p.compliance, value],
    }));
  };

  const setInfra = <K extends keyof Infrastructure>(
    key: K,
    value: Infrastructure[K],
  ) => {
    setProfile((p) => ({
      ...p,
      infrastructure: { ...p.infrastructure, [key]: value },
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Phase 1 DoD: 폼 입력값이 구조화 객체로 콘솔에 찍힘
        // eslint-disable-next-line no-console
        console.log("[CustomerProfile]", profile);
        onSubmit(profile);
      }}
      className="space-y-6"
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">샘플 케이스</h2>
          <span className="text-xs text-slate-500">데모용 프리셋</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="rounded-md border border-brand/20 bg-brand-light px-3 py-1.5 text-xs font-medium text-brand-dark hover:bg-brand/10"
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setProfile(EMPTY_PROFILE)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            초기화
          </button>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-2">
        <Field label="고객사명 (선택)">
          <input
            type="text"
            value={profile.companyName ?? ""}
            onChange={(e) =>
              setProfile((p) => ({ ...p, companyName: e.target.value }))
            }
            placeholder="예: 한국정밀제조"
            className={inputCls}
          />
        </Field>
        <Field label="산업">
          <select
            value={profile.industry}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                industry: e.target.value as CustomerProfile["industry"],
              }))
            }
            className={inputCls}
          >
            {INDUSTRY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="규모">
          <select
            value={profile.size}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                size: e.target.value as CustomerProfile["size"],
              }))
            }
            className={inputCls}
          >
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="임직원 수 (선택)">
          <input
            type="number"
            min={0}
            value={profile.employeeCount ?? ""}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                employeeCount: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              }))
            }
            placeholder="예: 1200"
            className={inputCls}
          />
        </Field>
        <Field label="엔드포인트 수 (선택)">
          <input
            type="number"
            min={0}
            value={profile.endpointCount ?? ""}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                endpointCount: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              }))
            }
            placeholder="예: 1500"
            className={inputCls}
          />
        </Field>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          현재 인프라
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            label="백신(AV) 보유"
            checked={profile.infrastructure.hasAv}
            onChange={(v) => setInfra("hasAv", v)}
          />
          <Toggle
            label="방화벽 보유"
            checked={profile.infrastructure.hasFirewall}
            onChange={(v) => setInfra("hasFirewall", v)}
          />
          <Toggle
            label="EDR 도입됨"
            checked={profile.infrastructure.hasEdr}
            onChange={(v) => setInfra("hasEdr", v)}
          />
          <Toggle
            label="자체 보안관제(SOC) 운영"
            checked={profile.infrastructure.hasSoc}
            onChange={(v) => setInfra("hasSoc", v)}
          />
          <Toggle
            label="망분리 운영"
            checked={profile.infrastructure.networkSeparation}
            onChange={(v) => setInfra("networkSeparation", v)}
          />
          <Toggle
            label="OT/산업제어 환경 보유"
            checked={profile.infrastructure.otEnvironment}
            onChange={(v) => setInfra("otEnvironment", v)}
          />
          <Field label="클라우드 사용">
            <select
              value={profile.infrastructure.cloudUsage}
              onChange={(e) =>
                setInfra(
                  "cloudUsage",
                  e.target.value as Infrastructure["cloudUsage"],
                )
              }
              className={inputCls}
            >
              <option value="none">사용 안 함</option>
              <option value="single">단일 클라우드</option>
              <option value="multi">멀티 클라우드</option>
              <option value="hybrid">하이브리드</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          주요 페인포인트 (복수 선택)
        </h2>
        <div className="flex flex-wrap gap-2">
          {PAIN_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              active={profile.painPoints.includes(o.value)}
              onClick={() => togglePain(o.value)}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          컴플라이언스 요구 (복수 선택)
        </h2>
        <div className="flex flex-wrap gap-2">
          {COMPLIANCE_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              active={profile.compliance.includes(o.value)}
              onClick={() => toggleCompliance(o.value)}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <Field label="자유 메모 (선택) — 영업·기술 미팅에서 청취한 내용">
          <textarea
            value={profile.notes ?? ""}
            onChange={(e) =>
              setProfile((p) => ({ ...p, notes: e.target.value }))
            }
            rows={3}
            placeholder="예: 최근 동종업계 랜섬웨어 피해. 경영진 우려 큼. ISMS-P 사후 심사 6개월 내."
            className={inputCls}
          />
        </Field>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "분석 중..." : "솔루션 추천 받기"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
      />
      {label}
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-xs font-medium transition " +
        (active
          ? "border-brand bg-brand text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-brand/40 hover:bg-brand-light")
      }
    >
      {children}
    </button>
  );
}
