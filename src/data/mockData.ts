export type SDG = {
  id: number;
  label: string;
  color: string;
};

export const SDGS: SDG[] = [
  { id: 1, label: "No Poverty", color: "#E5243B" },
  { id: 2, label: "Zero Hunger", color: "#DDA63A" },
  { id: 3, label: "Good Health", color: "#4C9F38" },
  { id: 4, label: "Quality Education", color: "#C5192D" },
  { id: 5, label: "Gender Equality", color: "#FF3A21" },
  { id: 6, label: "Clean Water", color: "#26BDE2" },
  { id: 7, label: "Clean Energy", color: "#FCC30B" },
  { id: 8, label: "Decent Work", color: "#A21942" },
  { id: 9, label: "Innovation", color: "#FD6925" },
  { id: 10, label: "Reduced Inequalities", color: "#DD1367" },
  { id: 11, label: "Sustainable Cities", color: "#FD9D24" },
  { id: 12, label: "Responsible Consumption", color: "#BF8B2E" },
  { id: 13, label: "Climate Action", color: "#3F7E44" },
  { id: 14, label: "Life Below Water", color: "#0A97D9" },
  { id: 15, label: "Life on Land", color: "#56C02B" },
  { id: 16, label: "Peace & Justice", color: "#00689D" },
  { id: 17, label: "Partnerships", color: "#19486A" },
];

export type OrgType = "NGO" | "Funder" | "Corporate CSR" | "Impact Investor" | "Social Enterprise";
export type NeedType = "Funding" | "Technology" | "Local Partner" | "Implementation Partner" | "Research" | "Volunteers";

export type Organization = {
  id: string;
  name: string;
  type: OrgType;
  country: string;
  region: string;
  flag: string;
  sector: string;
  sdgs: number[];
  mission: string;
  description: string;
  needs: NeedType[];
  strengths: string[];
  projects: { name: string; impact: string }[];
  fundingNeed?: string;
  established: number;
  reach: string;
  verified: boolean;
  website?: string;
};

export const ORGANIZATIONS: Organization[] = [
  {
    id: "ng-naija-learn",
    name: "NaijaLearn Foundation",
    type: "NGO",
    country: "Nigeria",
    region: "Africa",
    flag: "🇳🇬",
    sector: "Education",
    sdgs: [4, 5, 10],
    mission: "Bringing quality digital education to rural Nigerian children.",
    description: "Operates 42 community learning hubs across northern Nigeria, serving 18,000 children with literacy and STEM programs.",
    needs: ["Funding", "Technology", "Implementation Partner"],
    strengths: ["Deep rural reach", "Government partnerships", "Bilingual curriculum"],
    projects: [
      { name: "Hubs of Hope", impact: "18,000 children reached" },
      { name: "Girls Code Naija", impact: "1,200 girls trained" },
    ],
    fundingNeed: "$250,000 for 12-month tech expansion",
    established: 2014,
    reach: "18,000+ learners",
    verified: true,
  },
  {
    id: "in-edutech-bharat",
    name: "EduTech Bharat",
    type: "NGO",
    country: "India",
    region: "Asia",
    flag: "🇮🇳",
    sector: "EdTech",
    sdgs: [4, 9, 10],
    mission: "Open-source learning platform for low-bandwidth classrooms.",
    description: "Built an offline-first learning OS deployed in 3,400 schools across India. Curriculum auto-translates into 11 languages.",
    needs: ["Local Partner", "Implementation Partner", "Research"],
    strengths: ["Proven offline EdTech platform", "11-language localization", "Open-source code"],
    projects: [
      { name: "Sahaayak OS", impact: "3,400 schools, 1.2M students" },
      { name: "Teacher AI Coach", impact: "9,000 teachers upskilled" },
    ],
    established: 2017,
    reach: "1.2M students",
    verified: true,
  },
  {
    id: "pk-roshni",
    name: "Roshni Education Trust",
    type: "NGO",
    country: "Pakistan",
    region: "Asia",
    flag: "🇵🇰",
    sector: "Education",
    sdgs: [4, 5],
    mission: "Community-led schools for girls in rural Sindh and Punjab.",
    description: "Pioneered a low-cost community school model now replicated by 60+ partner NGOs across South Asia.",
    needs: ["Funding", "Technology", "Research"],
    strengths: ["Replicable rural school model", "Strong M&E framework", "Community trust"],
    projects: [
      { name: "Roshni Schools Network", impact: "240 schools, 32,000 girls" },
    ],
    fundingNeed: "$180,000 for curriculum digitization",
    established: 2009,
    reach: "32,000 girls",
    verified: true,
  },
  {
    id: "de-impact-fund",
    name: "Impact Europe Stiftung",
    type: "Funder",
    country: "Germany",
    region: "Europe",
    flag: "🇩🇪",
    sector: "Education & Climate",
    sdgs: [4, 7, 13],
    mission: "Funding scalable education and climate solutions in the Global South.",
    description: "€42M annual grantmaking foundation focused on cross-border NGO partnerships and replicable EdTech models.",
    needs: [],
    strengths: ["€42M annual grants", "Multi-year funding", "Technical assistance"],
    projects: [
      { name: "Global Classrooms Fund", impact: "120 NGOs funded" },
      { name: "Climate Schools Initiative", impact: "€8M deployed in 2024" },
    ],
    established: 1998,
    reach: "120 grantees worldwide",
    verified: true,
  },
  {
    id: "uk-bridge-csr",
    name: "Bridge & Co. CSR",
    type: "Corporate CSR",
    country: "United Kingdom",
    region: "Europe",
    flag: "🇬🇧",
    sector: "Tech for Good",
    sdgs: [4, 8, 9],
    mission: "Deploying employee skills and software for global education NGOs.",
    description: "FTSE-100 tech firm offering pro-bono engineering, cloud credits, and a £3M annual CSR fund.",
    needs: [],
    strengths: ["£3M CSR fund", "200 pro-bono engineers", "Cloud credits"],
    projects: [
      { name: "Code for Good", impact: "60 NGOs supported" },
    ],
    established: 2012,
    reach: "60 NGO partners",
    verified: true,
  },
  {
    id: "ke-mazingira",
    name: "Mazingira Green",
    type: "NGO",
    country: "Kenya",
    region: "Africa",
    flag: "🇰🇪",
    sector: "Climate & Agriculture",
    sdgs: [13, 15, 2],
    mission: "Smallholder-farmer climate resilience across East Africa.",
    description: "Trains farmers in regenerative agriculture and runs a carbon credit cooperative paying farmers directly.",
    needs: ["Funding", "Technology", "Research"],
    strengths: ["12,000 trained farmers", "Carbon credit verified", "Regional network"],
    projects: [
      { name: "Shamba Carbon", impact: "12,000 farmers, 80k tons CO₂" },
    ],
    fundingNeed: "$400,000 to scale to Tanzania",
    established: 2016,
    reach: "12,000 farmers",
    verified: true,
  },
  {
    id: "br-saude-amazonia",
    name: "Saúde Amazônia",
    type: "NGO",
    country: "Brazil",
    region: "Latin America",
    flag: "🇧🇷",
    sector: "Health",
    sdgs: [3, 6, 15],
    mission: "Mobile healthcare for indigenous Amazon communities.",
    description: "Operates 14 boat-based clinics serving 80 indigenous communities along the Rio Negro.",
    needs: ["Funding", "Volunteers", "Implementation Partner"],
    strengths: ["Boat-clinic logistics", "Indigenous council trust", "Telemedicine pilot"],
    projects: [
      { name: "Clínicas Flutuantes", impact: "80 communities served" },
    ],
    fundingNeed: "$320,000 for telemedicine expansion",
    established: 2011,
    reach: "80 communities",
    verified: true,
  },
  {
    id: "us-rise-investors",
    name: "Rise Impact Capital",
    type: "Impact Investor",
    country: "United States",
    region: "North America",
    flag: "🇺🇸",
    sector: "Multi-sector",
    sdgs: [1, 5, 8, 10],
    mission: "Catalytic capital for early-stage social enterprises in emerging markets.",
    description: "$120M fund deploying $250k–$2M tickets into education, fintech, and climate enterprises.",
    needs: [],
    strengths: ["$120M AUM", "Patient capital", "Portfolio support"],
    projects: [
      { name: "Rise Fund II", impact: "32 portfolio companies" },
    ],
    established: 2019,
    reach: "32 investments",
    verified: true,
  },
];

export type Funding = {
  id: string;
  title: string;
  funder: string;
  type: "Grant" | "CSR Fund" | "Impact Investment";
  amount: string;
  amountValue: number;
  region: string;
  sdgs: number[];
  deadline: string;
  description: string;
};

export const FUNDINGS: Funding[] = [
  {
    id: "f1",
    title: "Global Classrooms Fund 2025",
    funder: "Impact Europe Stiftung",
    type: "Grant",
    amount: "€50k – €500k",
    amountValue: 500000,
    region: "Africa, Asia",
    sdgs: [4, 5, 10],
    deadline: "2025-06-30",
    description: "Multi-year grants for NGOs scaling proven education models in Sub-Saharan Africa and South Asia.",
  },
  {
    id: "f2",
    title: "Code for Good Partnership",
    funder: "Bridge & Co. CSR",
    type: "CSR Fund",
    amount: "£25k + pro-bono engineering",
    amountValue: 25000,
    region: "Global",
    sdgs: [4, 8, 9],
    deadline: "2025-05-15",
    description: "Cash + engineering teams for NGOs needing technology platforms or data infrastructure.",
  },
  {
    id: "f3",
    title: "Climate Resilience Catalyst",
    funder: "Rise Impact Capital",
    type: "Impact Investment",
    amount: "$250k – $2M",
    amountValue: 2000000,
    region: "Africa, Latin America",
    sdgs: [13, 15, 2],
    deadline: "2025-07-31",
    description: "Patient capital for revenue-generating climate adaptation ventures.",
  },
  {
    id: "f4",
    title: "Indigenous Health Innovation Grant",
    funder: "Pan-American Health Trust",
    type: "Grant",
    amount: "$100k – $400k",
    amountValue: 400000,
    region: "Latin America",
    sdgs: [3, 10],
    deadline: "2025-08-20",
    description: "Funding for community-led healthcare innovations serving indigenous populations.",
  },
  {
    id: "f5",
    title: "Women & Girls Education Fund",
    funder: "Nordic Foundation Alliance",
    type: "Grant",
    amount: "€75k – €300k",
    amountValue: 300000,
    region: "Asia, Africa",
    sdgs: [4, 5],
    deadline: "2025-09-01",
    description: "Targeted grants for NGOs advancing girls' education in low-income regions.",
  },
  {
    id: "f6",
    title: "AgriTech for Smallholders",
    funder: "AgriBank Impact Arm",
    type: "Impact Investment",
    amount: "$500k – $3M",
    amountValue: 3000000,
    region: "Africa",
    sdgs: [2, 13, 15],
    deadline: "2025-10-15",
    description: "Equity and convertible notes for ventures serving smallholder farmers at scale.",
  },
];

export const COUNTRIES = Array.from(new Set(ORGANIZATIONS.map(o => o.country))).sort();
export const SECTORS = Array.from(new Set(ORGANIZATIONS.map(o => o.sector))).sort();

// Map coordinates (approximate, percentage on world map)
export const MAP_LOCATIONS: Record<string, { x: number; y: number }> = {
  "Nigeria": { x: 49, y: 56 },
  "India": { x: 70, y: 50 },
  "Pakistan": { x: 67, y: 46 },
  "Germany": { x: 51, y: 32 },
  "United Kingdom": { x: 47, y: 30 },
  "Kenya": { x: 56, y: 60 },
  "Brazil": { x: 33, y: 68 },
  "United States": { x: 22, y: 40 },
};
