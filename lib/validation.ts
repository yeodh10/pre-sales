import productsKb from "@/data/ahnlab-products.json";
import ismspControls from "@/data/compliance/ismsp-controls.json";
import type { RecommendationResult } from "./recommendation";

const VALID_PRODUCT_IDS = new Set<string>(
  (productsKb.products as { id: string }[]).map((p) => p.id),
);
const VALID_CONTROL_IDS = new Set<string>(
  (ismspControls.controls as { id: string }[]).map((c) => c.id),
);

export interface ValidationReport {
  droppedRecommendations: string[];
  droppedComplianceProductIds: string[];
  droppedControlIds: string[];
}

export function sanitizeRecommendation(
  raw: RecommendationResult,
): { result: RecommendationResult; report: ValidationReport } {
  const droppedRecommendations: string[] = [];
  const droppedComplianceProductIds: string[] = [];
  const droppedControlIds: string[] = [];

  const recommendations = raw.recommendations.filter((r) => {
    if (!VALID_PRODUCT_IDS.has(r.product_id)) {
      droppedRecommendations.push(r.product_id);
      return false;
    }
    return true;
  });

  const compliance_mapping = raw.compliance_mapping
    .map((row) => {
      const covered_by = row.covered_by.filter((id) => {
        if (!VALID_PRODUCT_IDS.has(id)) {
          droppedComplianceProductIds.push(id);
          return false;
        }
        return true;
      });
      let control_id = row.control_id;
      if (control_id && !VALID_CONTROL_IDS.has(control_id)) {
        droppedControlIds.push(control_id);
        control_id = undefined;
      }
      return { ...row, covered_by, control_id };
    })
    .filter((row) => row.covered_by.length > 0);

  return {
    result: { ...raw, recommendations, compliance_mapping },
    report: {
      droppedRecommendations,
      droppedComplianceProductIds,
      droppedControlIds,
    },
  };
}
