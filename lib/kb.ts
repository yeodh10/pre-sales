/**
 * 안랩 제품 KB 로더.
 *
 * data/products/<id>.json 개별 파일을 정적으로 import한 뒤,
 * 모듈 로드 시점에 스키마를 검증한다. 필수 필드 누락·id 중복·
 * source_url 없음 같은 위반이 있으면 즉시 throw하므로 `next build`가
 * 실패한다 (Phase 1 DoD).
 *
 * 소비자는 기존 `data/ahnlab-products.json`과 동일한 shape의 기본
 * export(`productsKb`)를 그대로 받아 쓸 수 있다.
 */

import metaData from "@/data/products/_meta.json";
import aips from "@/data/products/aips.json";
import cloudmate from "@/data/products/cloudmate.json";
import edr from "@/data/products/edr.json";
import epp from "@/data/products/epp.json";
import eps from "@/data/products/eps.json";
import mds from "@/data/products/mds.json";
import mss from "@/data/products/mss.json";
import tms from "@/data/products/tms.json";
import trusguard from "@/data/products/trusguard.json";
import trusguardDpx from "@/data/products/trusguard_dpx.json";
import v3 from "@/data/products/v3.json";
import xcanner from "@/data/products/xcanner.json";
import xtd from "@/data/products/xtd.json";

export interface Product {
  id: string;
  name: string;
  name_ko: string;
  category: string;
  category_label: string;
  tagline: string;
  key_features: string[];
  solves: string[];
  fits_industry: string[];
  compliance_support: string[];
  source_url: string;
}

export interface KbMeta {
  description: string;
  last_verified: string;
  platform_groups: Record<string, string[]>;
  disclaimer: string;
}

const REQUIRED_STRING_FIELDS: (keyof Product)[] = [
  "id",
  "name",
  "name_ko",
  "category",
  "category_label",
  "tagline",
  "source_url",
];
const REQUIRED_ARRAY_FIELDS: (keyof Product)[] = [
  "key_features",
  "solves",
  "fits_industry",
  "compliance_support",
];

function validateProduct(p: unknown, sourceHint: string): Product {
  if (!p || typeof p !== "object") {
    throw new Error(`[KB] ${sourceHint}: 제품 객체가 아닙니다`);
  }
  const obj = p as Record<string, unknown>;
  for (const f of REQUIRED_STRING_FIELDS) {
    const v = obj[f];
    if (typeof v !== "string" || v.trim() === "") {
      throw new Error(`[KB] ${sourceHint}: 필수 문자열 필드 누락/공백 — "${f}"`);
    }
  }
  for (const f of REQUIRED_ARRAY_FIELDS) {
    const v = obj[f];
    if (!Array.isArray(v) || v.length === 0) {
      throw new Error(`[KB] ${sourceHint}: 필수 배열 필드가 비어있음 — "${f}"`);
    }
    if (!v.every((x) => typeof x === "string" && x.trim() !== "")) {
      throw new Error(
        `[KB] ${sourceHint}: "${f}" 배열은 비어있지 않은 문자열만 허용됩니다`,
      );
    }
  }
  if (!/^https?:\/\//.test(obj.source_url as string)) {
    throw new Error(
      `[KB] ${sourceHint}: source_url이 http(s) URL이 아닙니다`,
    );
  }
  return obj as unknown as Product;
}

const RAW_PRODUCTS: unknown[] = [
  v3,
  epp,
  edr,
  mds,
  trusguard,
  aips,
  trusguardDpx,
  tms,
  eps,
  xtd,
  xcanner,
  cloudmate,
  mss,
];

const products: Product[] = RAW_PRODUCTS.map((p, i) => {
  const id =
    (p as { id?: string })?.id ?? `<index ${i}>`;
  return validateProduct(p, `products/${id}.json`);
});

// id 중복 방지
const seen = new Set<string>();
for (const p of products) {
  if (seen.has(p.id)) {
    throw new Error(`[KB] 중복된 제품 id: "${p.id}"`);
  }
  seen.add(p.id);
}

// _meta 최소 검증
if (
  !metaData ||
  typeof (metaData as KbMeta).description !== "string" ||
  typeof (metaData as KbMeta).last_verified !== "string" ||
  typeof (metaData as KbMeta).platform_groups !== "object"
) {
  throw new Error("[KB] _meta.json 구조가 올바르지 않습니다");
}

// platform_groups가 참조하는 id는 실제로 존재해야 함
for (const [group, ids] of Object.entries(
  (metaData as KbMeta).platform_groups,
)) {
  for (const id of ids) {
    if (!seen.has(id)) {
      throw new Error(
        `[KB] platform_groups.${group}가 존재하지 않는 id를 참조: "${id}"`,
      );
    }
  }
}

const productsKb: { _meta: KbMeta; products: Product[] } = {
  _meta: metaData as KbMeta,
  products,
};

export default productsKb;
