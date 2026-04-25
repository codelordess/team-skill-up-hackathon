import { OPPORTUNITIES, Opportunity, TalentProfile, SKILL_CATEGORIES, SkillCategory, ExperienceLevel } from "@/data/mockData";

export type OpportunityMatch = {
  opportunity: Opportunity;
  score: number; // 0-100
  reasons: string[];
};

const LEVEL_RANK: Record<ExperienceLevel, number> = {
  "Beginner": 1,
  "Beginner–Intermediate": 2,
  "Intermediate": 3,
  "Intermediate–Advanced": 4,
  "Advanced": 5,
};

const TYPE_BY_LEVEL: Record<ExperienceLevel, string[]> = {
  "Beginner": ["Training", "Mentorship", "Apprenticeship"],
  "Beginner–Intermediate": ["Training", "Mentorship", "Job", "Gig"],
  "Intermediate": ["Job", "Gig", "Mentorship"],
  "Intermediate–Advanced": ["Job", "Gig"],
  "Advanced": ["Job", "Gig", "Apprenticeship"],
};

export function matchOpportunities(profile: TalentProfile): OpportunityMatch[] {
  const profileSkillsLower = profile.detectedSkills.map(s => s.toLowerCase());
  const recommendedTypes = TYPE_BY_LEVEL[profile.experienceLevel];

  return OPPORTUNITIES
    .map(op => {
      let score = 0;
      const reasons: string[] = [];

      // Primary skill category match
      if (op.matchSkillCategory === profile.primarySkill) {
        score += 50;
        reasons.push(`Direct fit for your primary skill — ${profile.primarySkill}`);
      }

      // Required skills overlap
      const overlap = op.requiredSkills.filter(rs =>
        profileSkillsLower.some(ps => ps.includes(rs.toLowerCase()) || rs.toLowerCase().includes(ps))
      );
      if (overlap.length > 0) {
        score += overlap.length * 12;
        reasons.push(`You already have ${overlap.length}/${op.requiredSkills.length} required skill${overlap.length > 1 ? "s" : ""}: ${overlap.slice(0, 3).join(", ")}`);
      }

      // Type appropriate for level
      if (recommendedTypes.includes(op.type)) {
        score += 10;
      }

      // Credibility floor for paid jobs
      if (op.type === "Job" && profile.credibilityScore >= 75) {
        score += 8;
        reasons.push(`Your credibility score (${profile.credibilityScore}) clears the bar for paid roles`);
      }

      // Remote bonus for African talent reaching global market
      if (op.remote) {
        score += 4;
      }

      // Cap
      score = Math.min(99, score);

      return { opportunity: op, score, reasons: Array.from(new Set(reasons)) };
    })
    .filter(m => m.score >= 30)
    .sort((a, b) => b.score - a.score);
}

// Mock AI skill extraction — deterministic keyword-based for demo
export type ExtractionResult = {
  primarySkill: SkillCategory;
  detectedSkills: string[];
  experienceLevel: ExperienceLevel;
  suggestedRoles: string[];
  credibilityScore: number;
  reasoning: string;
};

const KEYWORD_MAP: { skill: SkillCategory; keywords: string[]; suggestedRoles: string[] }[] = [
  { skill: "Frontend Development", keywords: ["react", "vue", "angular", "frontend", "front-end", "html", "css", "tailwind", "javascript", "website", "web app", "next.js"], suggestedRoles: ["Junior Frontend Developer", "Website Builder (freelance)", "React Intern"] },
  { skill: "Backend Development", keywords: ["node", "django", "flask", "api", "backend", "back-end", "postgres", "mongodb", "server", "python", "express"], suggestedRoles: ["Backend Developer", "API Developer", "Junior Software Engineer"] },
  { skill: "Mobile Development", keywords: ["flutter", "android", "ios", "react native", "kotlin", "swift", "mobile app"], suggestedRoles: ["Mobile Developer", "Flutter Developer", "Android Developer"] },
  { skill: "UI/UX Design", keywords: ["figma", "ui", "ux", "wireframe", "prototype", "design system", "user research"], suggestedRoles: ["Junior UI Designer", "Product Designer", "Design Intern"] },
  { skill: "Graphic Design", keywords: ["photoshop", "illustrator", "logo", "branding", "poster", "graphic"], suggestedRoles: ["Graphic Designer", "Brand Designer", "Visual Designer"] },
  { skill: "Video Editing", keywords: ["premiere", "final cut", "davinci", "capcut", "video edit", "wedding video", "youtube edit", "color grad"], suggestedRoles: ["Video Editor", "YouTube Editor", "Cinematographer"] },
  { skill: "Digital Marketing", keywords: ["instagram", "tiktok", "facebook ads", "marketing", "social media", "seo", "ads", "influencer", "campaign"], suggestedRoles: ["Social Media Manager", "Digital Marketer", "Growth Associate"] },
  { skill: "Content Creation", keywords: ["writing", "blog", "article", "newsletter", "copywriting", "content", "wordpress"], suggestedRoles: ["Content Writer", "Copywriter", "Communications Associate"] },
  { skill: "Data & Analytics", keywords: ["sql", "excel", "power bi", "tableau", "data", "analytics", "pandas"], suggestedRoles: ["Data Analyst", "BI Analyst", "Junior Data Scientist"] },
  { skill: "Phone Repair", keywords: ["phone repair", "screen replace", "soldering", "iphone", "android repair", "smartphone"], suggestedRoles: ["Repair Technician", "Workshop Owner", "Apprentice Trainer"] },
  { skill: "Tailoring", keywords: ["sew", "tailor", "stitch", "fashion", "embroider", "pattern"], suggestedRoles: ["Tailor", "Fashion Entrepreneur", "Pattern Designer"] },
  { skill: "Photography", keywords: ["photo", "photography", "camera", "lightroom"], suggestedRoles: ["Photographer", "Studio Assistant", "Event Photographer"] },
];

export function extractSkills(input: {
  description: string;
  proofLink?: string;
  age: number;
}): ExtractionResult {
  const text = input.description.toLowerCase();

  // Score every skill
  const scored = KEYWORD_MAP.map(entry => {
    const hits = entry.keywords.filter(k => text.includes(k));
    return { ...entry, hits, score: hits.length };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const primarySkill: SkillCategory = top.score > 0 ? top.skill : "Content Creation";

  // Detected skills: collect all hit keywords (capitalised) plus generic adjacent ones
  const detected = new Set<string>();
  scored.filter(s => s.score > 0).forEach(s => s.hits.forEach(h => detected.add(titleCase(h))));

  // Add adjacent skills if primary frontend
  if (primarySkill === "Frontend Development") {
    ["HTML", "CSS", "JavaScript", "Git"].forEach(s => detected.add(s));
  }
  if (primarySkill === "Backend Development") {
    ["REST APIs", "Git"].forEach(s => detected.add(s));
  }

  // Experience level heuristic: numeric clues
  const numbers = (text.match(/\d+/g) || []).map(Number);
  const maxNumber = numbers.length ? Math.max(...numbers) : 0;
  let level: ExperienceLevel = "Beginner";
  if (maxNumber >= 50 || /years?/.test(text) && numbers.some(n => n >= 4)) level = "Advanced";
  else if (maxNumber >= 10 || numbers.some(n => n >= 2)) level = "Intermediate";
  else if (maxNumber >= 3) level = "Beginner–Intermediate";

  // Bump if user mentions "production", "paid", "client"
  if (/(paid|client|freelance|production|launched|shipped)/.test(text) && LEVEL_RANK[level] < 4) {
    const next: ExperienceLevel[] = ["Beginner", "Beginner–Intermediate", "Intermediate", "Intermediate–Advanced", "Advanced"];
    level = next[Math.min(4, LEVEL_RANK[level])];
  }

  // Credibility
  let credibility = 40;
  credibility += Math.min(30, top.score * 6);
  credibility += LEVEL_RANK[level] * 4;
  if (input.proofLink && input.proofLink.length > 4) credibility += 10;
  credibility = Math.max(35, Math.min(95, credibility));

  return {
    primarySkill,
    detectedSkills: Array.from(detected).slice(0, 8),
    experienceLevel: level,
    suggestedRoles: top.suggestedRoles,
    credibilityScore: credibility,
    reasoning: top.score > 0
      ? `Detected ${top.score} signal${top.score > 1 ? "s" : ""} for ${primarySkill} (${top.hits.slice(0, 3).join(", ")}). Numeric experience clues + proof link adjusted level and credibility.`
      : `Limited technical signals — defaulted to ${primarySkill}. Add specific tools or proof of work to improve extraction.`,
  };
}

function titleCase(s: string) {
  return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function getSkillColor(skill: SkillCategory): string {
  return SKILL_CATEGORIES.find(c => c.name === skill)?.color || "#6366F1";
}

export function getSkillIcon(skill: SkillCategory): string {
  return SKILL_CATEGORIES.find(c => c.name === skill)?.icon || "✨";
}
