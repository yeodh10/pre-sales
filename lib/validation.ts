import productsKb from "@/data/ahnlab-products.json";
import type { RecommendationResult } from "./recommendation";

const VALID_IDS = new Set<string>(
  (productsKb.products as { id: string }[]).map((p) => p.id),
);

export interface ValidationReport {
  droppedRecommendations: string[];
  droppedComplianceIds: string[];
}

export function sanitizeRecommendation(
  raw: RecommendationResult,
): { result: RecommendationResult; report: ValidationReport } {
  const droppedRecommendations: string[] = [];
  const droppedComplianceIds: string[] = [];

  const recommendations = raw.recommendations.filter((r) => {
    if (!VALID_IDS.has(r.product_id)) {
      droppedRecommendations.push(r.product_id);
      return false;
    }
    return true;
  });

  const compliance_mapping = raw.compliance_mapping
    .map((row) => {
      const covered_by = row.covered_by.filter((id) => {
        if (!VALID_IDS.has(id)) {
          droppedComplianceIds.push(id);
          return false;
        }
        return true;
      });
      return { ...row, covered_by };
    })
    .filter((row) => row.covered_by.length > 0);

  return {
    result: { ...raw, recommendations, compliance_mapping },
    report: { droppedRecommendations, droppedComplianceIds },
  };
}
