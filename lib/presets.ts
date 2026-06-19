import type { CustomerProfile } from "./types";

export const PRESETS: { id: string; label: string; profile: CustomerProfile }[] =
  [
    {
      id: "manufacturing_ot",
      label: "제조/OT 중견기업",
      profile: {
        companyName: "(예시) 한국정밀제조",
        industry: "manufacturing_ot",
        size: "mid",
        employeeCount: 1200,
        endpointCount: 1500,
        infrastructure: {
          hasAv: true,
          hasFirewall: true,
          hasEdr: false,
          hasSoc: false,
          networkSeparation: true,
          cloudUsage: "single",
          otEnvironment: true,
        },
        painPoints: ["ot_legacy", "ransomware", "soc_shortage"],
        compliance: ["ismsp", "network_separation", "critical_infra"],
        notes:
          "생산망은 폐쇄망 운영. 레거시 Windows 7 기반 설비 다수. 최근 동종업계 랜섬웨어 피해 사례로 경영진 우려 큼.",
      },
    },
    {
      id: "finance_mid",
      label: "금융 중소형사",
      profile: {
        companyName: "(예시) ABC저축은행",
        industry: "finance",
        size: "mid",
        employeeCount: 600,
        endpointCount: 800,
        infrastructure: {
          hasAv: true,
          hasFirewall: true,
          hasEdr: false,
          hasSoc: false,
          networkSeparation: true,
          cloudUsage: "none",
          otEnvironment: false,
        },
        painPoints: ["insider_leak", "apt", "compliance_audit"],
        compliance: ["ismsp", "finance_supervisory", "network_separation"],
        notes:
          "전자금융감독규정 대응 필요. 내부망 단말 가시성 부족. 침해 사고 시 24/7 대응 체계 미흡.",
      },
    },
    {
      id: "public_smb",
      label: "중소 공공기관",
      profile: {
        companyName: "(예시) 한국OO연구원",
        industry: "public",
        size: "smb",
        employeeCount: 280,
        endpointCount: 350,
        infrastructure: {
          hasAv: true,
          hasFirewall: true,
          hasEdr: false,
          hasSoc: false,
          networkSeparation: true,
          cloudUsage: "none",
          otEnvironment: false,
        },
        painPoints: ["apt", "compliance_audit", "soc_shortage"],
        compliance: ["ismsp", "network_separation"],
        notes:
          "망분리 환경. ISMS-P 사후 심사 예정. 자체 관제 역량 부족으로 외부 관제 검토 중.",
      },
    },
  ];
