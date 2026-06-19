import type {
  Compliance,
  Industry,
  CompanySize,
  PainPoint,
} from "./types";

export const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: "manufacturing", label: "제조 (일반)" },
  { value: "manufacturing_ot", label: "제조 (OT/스마트팩토리)" },
  { value: "finance", label: "금융" },
  { value: "public", label: "공공/정부" },
  { value: "retail", label: "유통/리테일" },
  { value: "healthcare", label: "헬스케어" },
  { value: "education", label: "교육" },
  { value: "ecommerce", label: "이커머스" },
  { value: "etc", label: "기타" },
];

export const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: "smb", label: "중소 (~300명)" },
  { value: "mid", label: "중견 (300~3,000명)" },
  { value: "enterprise", label: "대기업 (3,000명 이상)" },
];

export const PAIN_OPTIONS: { value: PainPoint; label: string }[] = [
  { value: "ransomware", label: "랜섬웨어 피해 우려" },
  { value: "apt", label: "APT/지능형 표적 위협" },
  { value: "insider_leak", label: "내부 정보 유출" },
  { value: "ot_legacy", label: "OT/레거시 폐쇄망 보호" },
  { value: "soc_shortage", label: "관제 인력 부족" },
  { value: "cloud_misconfig", label: "클라우드 설정 오류" },
  { value: "ddos", label: "DDoS·가용성 위협" },
  { value: "compliance_audit", label: "컴플라이언스 심사 대응" },
];

export const COMPLIANCE_OPTIONS: { value: Compliance; label: string }[] = [
  { value: "ismsp", label: "ISMS-P" },
  { value: "isms", label: "ISMS" },
  { value: "pims", label: "PIMS / 개인정보보호법" },
  { value: "csap", label: "CSAP (클라우드 보안 인증)" },
  { value: "finance_supervisory", label: "전자금융감독규정" },
  { value: "critical_infra", label: "주요정보통신기반시설 보호지침" },
  { value: "network_separation", label: "망분리 의무" },
];
