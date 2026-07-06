# 페이즈 간 공유 계약

서브에이전트가 넘길 데이터의 진실의 원천(source of truth). 계약을 바꿀 때는
반드시 이 문서를 먼저 갱신하고, 소비자 코드/테스트를 뒤따라 수정한다.

## 제품 KB 스키마 (`data/products/<id>.json`)

```jsonc
{
  "id": "string",                    // 파일명과 동일, KB 내 유일
  "name": "AhnLab X",                // 공식 영문 제품명
  "name_ko": "안랩 X",               // 공식 한글 제품명
  "category": "endpoint_epp",        // 내부 카테고리 슬러그
  "category_label": "엔드포인트 안티멀웨어 (EPP)",
  "tagline": "한 줄 요약",
  "key_features": ["...", "..."],    // 비어있지 않음
  "solves": ["..."],                 // 비어있지 않음
  "fits_industry": ["..."],          // 비어있지 않음
  "compliance_support": ["..."],     // 비어있지 않음
  "source_url": "https://..."        // http(s) URL 필수
}
```

메타데이터는 `data/products/_meta.json`.

`lib/kb.ts`가 모듈 로드 시점에 이 계약을 검증한다. 위반 시 즉시 throw →
`next build`가 실패한다.

## 추천 API 응답 (`POST /api/recommend`)

`lib/recommendation.ts`의 `RecommendationResult` + `RECOMMENDATION_TOOL_SCHEMA`가
계약을 정의한다. Anthropic tool_use로 강제되며, `lib/validation.ts`가 KB 외
`product_id`·`control_id`를 자동 제거한다.

핵심 필드:
- `summary`: string
- `recommendations[]`: `{ product_id, priority ∈ {1,2,3}, rationale, key_outcomes[] }`
- `compliance_mapping[]`: `{ requirement, control_id?, covered_by[] }`
- `risks_and_notes[]`: string
- (자동 부착) `model_used`, `generated_at`

## ISMS-P 통제 카탈로그 (`data/compliance/ismsp-controls.json`)

`compliance_mapping.control_id`가 참조하는 통제 ID의 집합. `lib/ismsp.ts`가
lookup을 담당하며, 카탈로그 외 ID는 `lib/validation.ts`에서 제거된다.
