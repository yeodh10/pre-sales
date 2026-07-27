import ismspControls from "@/data/compliance/ismsp-controls.json";

export interface IsmspControl {
  id: string;
  name: string;
  category: string;
  summary: string;
  relevant_solutions: string[];
}

const BY_ID = new Map<string, IsmspControl>(
  (ismspControls.controls as IsmspControl[]).map((c) => [c.id, c]),
);

export const ISMSP_META = ismspControls._meta as {
  framework: string;
  domain: string;
  source: string;
  official_url: string;
  last_verified: string;
  scope_note: string;
  disclaimer: string;
};

export function lookupControl(id?: string): IsmspControl | undefined {
  if (!id) return undefined;
  return BY_ID.get(id);
}
