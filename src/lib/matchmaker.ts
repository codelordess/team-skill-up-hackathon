import { ORGANIZATIONS, Organization, NeedType } from "@/data/mockData";

export type MatchInput = {
  orgType: string;
  country: string;
  sdgs: number[];
  challenge: string;
  needs: NeedType[];
};

export type Match = {
  org: Organization;
  score: number;
  reasons: string[];
};

const NEED_TO_STRENGTH: Record<NeedType, string[]> = {
  "Funding": ["grant", "fund", "capital", "csr", "annual grants"],
  "Technology": ["tech", "platform", "edtech", "code", "engineer", "open-source", "telemedicine"],
  "Local Partner": ["local", "community", "rural", "regional"],
  "Implementation Partner": ["replicable", "model", "implementation", "scaling", "schools"],
  "Research": ["research", "m&e", "verified", "framework"],
  "Volunteers": ["volunteer", "pro-bono", "engineers"],
};

export function findMatches(input: MatchInput): Match[] {
  const challengeLower = input.challenge.toLowerCase();

  const scored = ORGANIZATIONS
    .filter(org => org.country !== input.country) // suggest cross-border
    .map(org => {
      let score = 0;
      const reasons: string[] = [];

      // SDG overlap
      const sdgOverlap = org.sdgs.filter(s => input.sdgs.includes(s));
      if (sdgOverlap.length > 0) {
        score += sdgOverlap.length * 25;
        reasons.push(`Shared focus on ${sdgOverlap.length} UN SDG${sdgOverlap.length > 1 ? "s" : ""} including ${sdgOverlap.slice(0,2).map(id => `SDG ${id}`).join(", ")}`);
      }

      // Need ↔ Strength matching
      for (const need of input.needs) {
        const keywords = NEED_TO_STRENGTH[need] || [];
        const matchedStrength = org.strengths.find(s =>
          keywords.some(k => s.toLowerCase().includes(k))
        );
        const matchedDesc = keywords.some(k => org.description.toLowerCase().includes(k));

        if (need === "Funding" && (org.type === "Funder" || org.type === "Corporate CSR" || org.type === "Impact Investor")) {
          score += 40;
          reasons.push(`${org.type} actively deploying ${need.toLowerCase()} aligned with your sector`);
        } else if (matchedStrength) {
          score += 30;
          reasons.push(`Brings ${need.toLowerCase()} capability: "${matchedStrength}"`);
        } else if (matchedDesc) {
          score += 15;
        }
      }

      // Challenge keyword match
      const challengeWords = challengeLower.split(/\s+/).filter(w => w.length > 4);
      const descMatch = challengeWords.filter(w =>
        org.description.toLowerCase().includes(w) ||
        org.mission.toLowerCase().includes(w) ||
        org.sector.toLowerCase().includes(w)
      ).length;
      if (descMatch > 0) {
        score += descMatch * 8;
        reasons.push(`Mission directly addresses keywords from your challenge`);
      }

      // Cross-border bonus for proven model
      if (org.type === "NGO" && org.strengths.some(s => /replic|proven|model|open-source/i.test(s))) {
        score += 10;
        reasons.push("Has a proven, replicable model you can adopt");
      }

      return { org, score, reasons: Array.from(new Set(reasons)) };
    })
    .filter(m => m.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return scored;
}
