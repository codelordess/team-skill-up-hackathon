// Match score calculator: shared between dashboards
export type SkillMatchInput = {
  talentSkills: string[];
  jobSkills: string[];
  talentLocation?: string | null;
  jobLocation?: string | null;
  experienceLevel?: string | null;
};

export type SkillMatchResult = {
  score: number;
  overlap: string[];
  missing: string[];
  reasons: string[];
};

const norm = (s: string) => s.toLowerCase().trim();

export function calculateMatch(input: SkillMatchInput): SkillMatchResult {
  const t = (input.talentSkills || []).map(norm);
  const j = (input.jobSkills || []).map(norm);
  const reasons: string[] = [];

  if (j.length === 0) {
    return { score: 0, overlap: [], missing: [], reasons: ["No skill requirements specified"] };
  }

  const overlap = j.filter(req => t.some(ts => ts.includes(req) || req.includes(ts)));
  const missing = j.filter(req => !overlap.includes(req));

  let score = Math.round((overlap.length / j.length) * 100);

  // Location bonus
  if (input.talentLocation && input.jobLocation) {
    const tl = input.talentLocation.toLowerCase();
    const jl = input.jobLocation.toLowerCase();
    if (jl.includes("remote") || tl.split(/[, ]+/).some(p => p.length > 2 && jl.includes(p))) {
      score = Math.min(99, score + 5);
      reasons.push(jl.includes("remote") ? "Role is remote-friendly" : "Same region as employer");
    }
  }

  if (overlap.length > 0) {
    reasons.push(`Matches ${overlap.length}/${j.length} required skills`);
  }
  if (input.experienceLevel) {
    reasons.push(`Experience level: ${input.experienceLevel}`);
  }

  return {
    score: Math.min(99, score),
    overlap: overlap.map(titleCase),
    missing: missing.map(titleCase),
    reasons,
  };
}

function titleCase(s: string) {
  return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
