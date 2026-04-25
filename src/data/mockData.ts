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
    id: "ng-edugist",
    name: "Edugist Foundation",
    type: "NGO",
    country: "Nigeria",
    region: "Africa",
    flag: "🇳🇬",
    sector: "Education",
    sdgs: [4, 5, 10],
    mission: "Building safer, tech-enabled learning environments for Nigerian children — leaving no learner behind.",
    description: "Nigeria-based education NGO running Safe Schools advocacy, the National Student Volunteer Programme, and solar-powered tech learning hubs in rural and underserved communities.",
    needs: ["Funding", "Technology", "Implementation Partner"],
    strengths: ["Solar-powered learning hubs", "Safe2Report platform", "Youth entrepreneurship programmes"],
    projects: [
      { name: "Safe2Report", impact: "School-safety reporting platform" },
      { name: "No Learner Left Behind", impact: "Solar-powered rural learning hubs" },
    ],
    fundingNeed: "Tech & infrastructure for rural learning hubs",
    established: 2018,
    reach: "Rural & underserved Nigerian communities",
    verified: true,
    website: "https://edugistfoundation.org",
  },
  {
    id: "in-pratham",
    name: "Pratham Education Foundation",
    type: "NGO",
    country: "India",
    region: "Asia",
    flag: "🇮🇳",
    sector: "EdTech",
    sdgs: [4, 9, 10],
    mission: "Every Child in School and Learning Well — high-quality, low-cost, replicable education at scale.",
    description: "One of India's largest education NGOs. Runs PraDigi open learning (offline-first tablet-based content) and publishes the ASER national learning assessment. Models replicated across the Global South.",
    needs: ["Local Partner", "Implementation Partner", "Research"],
    strengths: ["PraDigi offline learning platform", "ASER assessment framework", "Proven, replicable Teaching at the Right Level model"],
    projects: [
      { name: "PraDigi Open Learning", impact: "Offline edtech in 11+ Indian languages" },
      { name: "ASER", impact: "Annual learning survey across rural India" },
    ],
    established: 1995,
    reach: "Millions of children across India & Global South",
    verified: true,
    website: "https://www.pratham.org",
  },
  {
    id: "pk-tcf",
    name: "The Citizens Foundation (TCF)",
    type: "NGO",
    country: "Pakistan",
    region: "Asia",
    flag: "🇵🇰",
    sector: "Education",
    sdgs: [4, 5],
    mission: "Removing barriers of class and privilege through low-cost formal schools — with a focus on girls.",
    description: "One of Pakistan's largest privately-owned school networks: 2,000+ school units educating 300,000+ students, with an all-female teaching faculty to encourage girls' enrolment in conservative communities.",
    needs: ["Funding", "Technology", "Research"],
    strengths: ["2,000+ school network", "All-female teacher model", "Proven low-cost school operations"],
    projects: [
      { name: "TCF Schools Network", impact: "300,000+ students, 21,000 staff" },
      { name: "Girls Education Programme", impact: "Majority-female student body" },
    ],
    fundingNeed: "Curriculum digitisation & teacher tools",
    established: 1995,
    reach: "300,000+ students",
    verified: true,
    website: "https://www.tcf.org.pk",
  },
  {
    id: "de-bosch-stiftung",
    name: "Robert Bosch Stiftung",
    type: "Funder",
    country: "Germany",
    region: "Europe",
    flag: "🇩🇪",
    sector: "Education & Climate",
    sdgs: [4, 7, 13],
    mission: "One of Europe's largest charitable foundations — funding health, education and global issues.",
    description: "Germany-based foundation funding social innovation worldwide, including education, climate, migration and health programmes in the Global South. Supports cross-border NGO partnerships.",
    needs: [],
    strengths: ["One of Europe's largest foundations", "Multi-year strategic grants", "Cross-border NGO partnerships"],
    projects: [
      { name: "Education & Society", impact: "Global education grants programme" },
      { name: "Climate Change", impact: "Cross-border climate funding" },
    ],
    established: 1964,
    reach: "Grantees across 60+ countries",
    verified: true,
    website: "https://www.bosch-stiftung.de/en",
  },
  {
    id: "uk-comic-relief",
    name: "Comic Relief — Tech for Good",
    type: "Corporate CSR",
    country: "United Kingdom",
    region: "Europe",
    flag: "🇬🇧",
    sector: "Tech for Good",
    sdgs: [4, 8, 9],
    mission: "Helping charities use technology to better serve the people they support.",
    description: "UK fundraising charity running the Tech for Good programme (with Paul Hamlyn Foundation and partners like Microsoft) — combining grants with digital design and engineering support for NGOs.",
    needs: [],
    strengths: ["Tech for Good fund", "Digital design partnership model", "Microsoft & corporate partners"],
    projects: [
      { name: "Tech for Good — Build Fund", impact: "£1.3M to 20 charities" },
      { name: "Microsoft Partnership", impact: "Digital tools for frontline charities" },
    ],
    established: 1985,
    reach: "Hundreds of UK & global charities",
    verified: true,
    website: "https://www.comicrelief.com",
  },
  {
    id: "ke-one-acre",
    name: "One Acre Fund",
    type: "NGO",
    country: "Kenya",
    region: "Africa",
    flag: "🇰🇪",
    sector: "Climate & Agriculture",
    sdgs: [13, 15, 2],
    mission: "Serving smallholder farmers across Sub-Saharan Africa with finance, training and climate-smart inputs.",
    description: "Operates across Kenya, Rwanda, Burundi, Tanzania, Uganda, Malawi, Zambia, Ethiopia and Nigeria. Trains farmers in regenerative practices and tree planting that improves soils and sequesters carbon.",
    needs: ["Funding", "Technology", "Research"],
    strengths: ["Multi-country East African footprint", "Tree-planting & carbon work", "Field-tested agronomy training"],
    projects: [
      { name: "Tree Programme", impact: "Tens of millions of trees planted with farmers" },
      { name: "Climate Resilience", impact: "Regenerative inputs for 1M+ farmers" },
    ],
    fundingNeed: "Scale climate-resilient agriculture across new districts",
    established: 2006,
    reach: "1M+ smallholder farmers",
    verified: true,
    website: "https://oneacrefund.org",
  },
  {
    id: "br-saude-alegria",
    name: "Projeto Saúde e Alegria",
    type: "NGO",
    country: "Brazil",
    region: "Latin America",
    flag: "🇧🇷",
    sector: "Health",
    sdgs: [3, 6, 15],
    mission: "Health, happiness and sustainable community development in the Brazilian Amazon since 1987.",
    description: "Operates with riverine and indigenous communities along the Tapajós and Amazon rivers, combining mobile health, education, communication networks (Rede Mocoronga) and sustainable livelihoods.",
    needs: ["Funding", "Volunteers", "Implementation Partner"],
    strengths: ["40+ years of Amazon community trust", "Boat-based mobile services", "Community communication network"],
    projects: [
      { name: "Rede Mocoronga", impact: "Community communication network in the Amazon" },
      { name: "Mobile Health Brigades", impact: "Riverine & indigenous communities served" },
    ],
    fundingNeed: "Telemedicine & boat clinic expansion",
    established: 1987,
    reach: "140+ Amazon communities",
    verified: true,
    website: "https://www.saudeealegria.org.br",
  },
  {
    id: "us-acumen",
    name: "Acumen",
    type: "Impact Investor",
    country: "United States",
    region: "North America",
    flag: "🇺🇸",
    sector: "Multi-sector",
    sdgs: [1, 5, 8, 10],
    mission: "Investing patient capital in businesses that solve the toughest problems of poverty.",
    description: "Global non-profit impact investor founded in 2001. Deploys patient capital into early-stage social enterprises across agriculture, energy, education, health and financial inclusion in emerging markets.",
    needs: [],
    strengths: ["Patient capital model", "Acumen Academy leadership programmes", "Global portfolio support"],
    projects: [
      { name: "Acumen Portfolio", impact: "150+ companies serving low-income customers" },
      { name: "Green RISE Africa Fellowship", impact: "Climate entrepreneur leadership programme" },
    ],
    established: 2001,
    reach: "150+ portfolio companies in emerging markets",
    verified: true,
    website: "https://acumen.org",
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
    title: "Education & Society Programme",
    funder: "Robert Bosch Stiftung",
    type: "Grant",
    amount: "€50k – €500k",
    amountValue: 500000,
    region: "Africa, Asia",
    sdgs: [4, 5, 10],
    deadline: "Rolling",
    description: "Multi-year grants for NGOs scaling proven education models across the Global South.",
  },
  {
    id: "f2",
    title: "Tech for Good — Build Fund",
    funder: "Comic Relief",
    type: "CSR Fund",
    amount: "£25k – £75k + digital partner",
    amountValue: 75000,
    region: "UK & Global",
    sdgs: [4, 8, 9],
    deadline: "Annual cohort",
    description: "Cash plus digital design and engineering support for charities building tech-enabled services.",
  },
  {
    id: "f3",
    title: "Acumen Patient Capital",
    funder: "Acumen",
    type: "Impact Investment",
    amount: "$250k – $2M",
    amountValue: 2000000,
    region: "Africa, Asia, Latin America",
    sdgs: [1, 7, 13, 8],
    deadline: "Rolling",
    description: "Patient capital for early-stage social enterprises in agriculture, energy, education, health and financial inclusion.",
  },
  {
    id: "f4",
    title: "Pan-American Indigenous Health Grant",
    funder: "Pan American Health Organization (PAHO)",
    type: "Grant",
    amount: "$100k – $400k",
    amountValue: 400000,
    region: "Latin America",
    sdgs: [3, 10],
    deadline: "2026-08-20",
    description: "Funding for community-led healthcare innovations serving indigenous populations across the Americas.",
  },
  {
    id: "f5",
    title: "Global Partnership for Education",
    funder: "Global Partnership for Education (GPE)",
    type: "Grant",
    amount: "$75k – $5M",
    amountValue: 5000000,
    region: "Asia, Africa",
    sdgs: [4, 5],
    deadline: "Rolling country windows",
    description: "Multilateral fund supporting education systems in lower-income countries, with a focus on girls' education.",
  },
  {
    id: "f6",
    title: "AGRA Smallholder Farmer Programme",
    funder: "AGRA (Alliance for a Green Revolution in Africa)",
    type: "Impact Investment",
    amount: "$500k – $3M",
    amountValue: 3000000,
    region: "Africa",
    sdgs: [2, 13, 15],
    deadline: "2026-10-15",
    description: "Catalytic capital and grants for ventures and NGOs serving smallholder farmers at scale across Africa.",
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
