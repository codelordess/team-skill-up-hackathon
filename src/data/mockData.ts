// SkillMap — mock data for talent profiles and opportunities

export type SkillCategory =
  | "Frontend Development"
  | "Backend Development"
  | "Mobile Development"
  | "UI/UX Design"
  | "Graphic Design"
  | "Video Editing"
  | "Digital Marketing"
  | "Content Creation"
  | "Data & Analytics"
  | "Phone Repair"
  | "Tailoring"
  | "Photography";

export const SKILL_CATEGORIES: { name: SkillCategory; color: string; icon: string }[] = [
  { name: "Frontend Development", color: "#3B82F6", icon: "💻" },
  { name: "Backend Development", color: "#8B5CF6", icon: "🛠️" },
  { name: "Mobile Development", color: "#06B6D4", icon: "📱" },
  { name: "UI/UX Design", color: "#EC4899", icon: "🎨" },
  { name: "Graphic Design", color: "#F43F5E", icon: "🖌️" },
  { name: "Video Editing", color: "#F59E0B", icon: "🎬" },
  { name: "Digital Marketing", color: "#10B981", icon: "📣" },
  { name: "Content Creation", color: "#EF4444", icon: "✍️" },
  { name: "Data & Analytics", color: "#6366F1", icon: "📊" },
  { name: "Phone Repair", color: "#64748B", icon: "🔧" },
  { name: "Tailoring", color: "#A855F7", icon: "🧵" },
  { name: "Photography", color: "#0EA5E9", icon: "📸" },
];

export type ExperienceLevel = "Beginner" | "Beginner–Intermediate" | "Intermediate" | "Intermediate–Advanced" | "Advanced";

export type TalentProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  country: "Nigeria" | "Ghana" | "Uganda" | "Kenya" | "South Africa";
  flag: string;
  avatarColor: string;
  initials: string;
  rawDescription: string;
  primarySkill: SkillCategory;
  detectedSkills: string[];
  experienceLevel: ExperienceLevel;
  suggestedRoles: string[];
  credibilityScore: number; // 0-100
  proofLinks: { label: string; url: string }[];
  careerGoals: string;
  yearsActive: number;
  available: boolean;
};

export const TALENTS: TalentProfile[] = [
  {
    id: "t-kwame",
    name: "Kwame Mensah",
    age: 22,
    city: "Accra",
    country: "Ghana",
    flag: "🇬🇭",
    avatarColor: "#3B82F6",
    initials: "KM",
    rawDescription:
      "I learned React from YouTube and built websites for 3 small businesses in my neighborhood. I also built a small inventory app for my uncle's shop using Firebase.",
    primarySkill: "Frontend Development",
    detectedSkills: ["React", "JavaScript", "HTML", "CSS", "Tailwind", "Firebase", "Git"],
    experienceLevel: "Beginner–Intermediate",
    suggestedRoles: ["Junior Frontend Developer", "Website Builder (freelance)", "React Intern"],
    credibilityScore: 78,
    proofLinks: [
      { label: "Portfolio site", url: "https://github.com" },
      { label: "GitHub", url: "https://github.com" },
    ],
    careerGoals: "Land a remote junior frontend role with an international startup.",
    yearsActive: 2,
    available: true,
  },
  {
    id: "t-amaka",
    name: "Amaka Okafor",
    age: 24,
    city: "Lagos",
    country: "Nigeria",
    flag: "🇳🇬",
    avatarColor: "#EC4899",
    initials: "AO",
    rawDescription:
      "I run an Instagram page with 18k followers for a local fashion brand. I shoot the photos, edit reels in CapCut, write captions and run their WhatsApp orders. Sales went up 4x in 8 months.",
    primarySkill: "Digital Marketing",
    detectedSkills: ["Social Media Strategy", "CapCut", "Copywriting", "Instagram Ads", "WhatsApp Business", "Photography"],
    experienceLevel: "Intermediate",
    suggestedRoles: ["Social Media Manager", "Content Strategist", "E-commerce Marketer"],
    credibilityScore: 84,
    proofLinks: [
      { label: "Instagram case study", url: "https://instagram.com" },
    ],
    careerGoals: "Become a freelance social media consultant for African D2C brands.",
    yearsActive: 3,
    available: true,
  },
  {
    id: "t-david",
    name: "David Ssempala",
    age: 19,
    city: "Kampala",
    country: "Uganda",
    flag: "🇺🇬",
    avatarColor: "#F59E0B",
    initials: "DS",
    rawDescription:
      "I edit wedding videos and YouTube content for creators. I use Premiere Pro and DaVinci Resolve. I have edited over 60 projects in the last year.",
    primarySkill: "Video Editing",
    detectedSkills: ["Adobe Premiere Pro", "DaVinci Resolve", "Color Grading", "Motion Graphics", "Audio Mixing"],
    experienceLevel: "Intermediate–Advanced",
    suggestedRoles: ["Freelance Video Editor", "YouTube Channel Editor", "Wedding Cinematographer"],
    credibilityScore: 88,
    proofLinks: [
      { label: "Showreel", url: "https://youtube.com" },
    ],
    careerGoals: "Edit full-time for a US/EU YouTube channel and grow my own studio in Kampala.",
    yearsActive: 3,
    available: true,
  },
  {
    id: "t-fatima",
    name: "Fatima Bello",
    age: 21,
    city: "Kano",
    country: "Nigeria",
    flag: "🇳🇬",
    avatarColor: "#A855F7",
    initials: "FB",
    rawDescription:
      "I sew traditional and modern wear. I've tailored over 200 outfits in 4 years. I've started using Canva to design lookbooks and run my own small TikTok shop.",
    primarySkill: "Tailoring",
    detectedSkills: ["Pattern Making", "Embroidery", "Canva", "TikTok Shop", "Customer Service"],
    experienceLevel: "Advanced",
    suggestedRoles: ["Senior Tailor", "Fashion Entrepreneur", "Pattern Designer"],
    credibilityScore: 81,
    proofLinks: [{ label: "TikTok shop", url: "https://tiktok.com" }],
    careerGoals: "Scale my TikTok fashion brand and access a small business loan.",
    yearsActive: 4,
    available: true,
  },
  {
    id: "t-joseph",
    name: "Joseph Owusu",
    age: 23,
    city: "Kumasi",
    country: "Ghana",
    flag: "🇬🇭",
    avatarColor: "#64748B",
    initials: "JO",
    rawDescription:
      "I repair smartphones — screen replacement, battery, motherboard soldering. I've fixed about 1,200 phones in 3 years. I run a small shop and train 2 apprentices.",
    primarySkill: "Phone Repair",
    detectedSkills: ["Screen Replacement", "Micro-soldering", "Diagnostics", "iOS & Android", "Customer Service", "Apprentice Training"],
    experienceLevel: "Advanced",
    suggestedRoles: ["Senior Repair Technician", "Workshop Owner", "Apprenticeship Trainer"],
    credibilityScore: 86,
    proofLinks: [],
    careerGoals: "Get certified and open a second branch with a youth apprenticeship programme.",
    yearsActive: 3,
    available: true,
  },
  {
    id: "t-grace",
    name: "Grace Nakimuli",
    age: 20,
    city: "Kampala",
    country: "Uganda",
    flag: "🇺🇬",
    avatarColor: "#06B6D4",
    initials: "GN",
    rawDescription:
      "I taught myself Figma and design landing pages for friends building small SaaS products. I've shipped 12 designs and 3 of them got coded into production.",
    primarySkill: "UI/UX Design",
    detectedSkills: ["Figma", "Wireframing", "Prototyping", "Design Systems", "User Research"],
    experienceLevel: "Beginner–Intermediate",
    suggestedRoles: ["Junior UI Designer", "Freelance Product Designer", "Design Intern"],
    credibilityScore: 74,
    proofLinks: [{ label: "Figma portfolio", url: "https://figma.com" }],
    careerGoals: "Get a remote design internship at an early-stage startup.",
    yearsActive: 1,
    available: true,
  },
  {
    id: "t-tunde",
    name: "Tunde Adebayo",
    age: 25,
    city: "Lagos",
    country: "Nigeria",
    flag: "🇳🇬",
    avatarColor: "#8B5CF6",
    initials: "TA",
    rawDescription:
      "I build backend APIs in Node.js and Python. I've worked on 4 paid freelance projects on Upwork — payment integrations with Paystack and Flutterwave, and a logistics dashboard.",
    primarySkill: "Backend Development",
    detectedSkills: ["Node.js", "Python", "PostgreSQL", "REST APIs", "Paystack", "Flutterwave", "Docker"],
    experienceLevel: "Intermediate",
    suggestedRoles: ["Backend Developer", "Fintech Engineer", "API Developer"],
    credibilityScore: 82,
    proofLinks: [
      { label: "GitHub", url: "https://github.com" },
      { label: "Upwork profile", url: "https://upwork.com" },
    ],
    careerGoals: "Land a full-time remote backend role with a fintech.",
    yearsActive: 3,
    available: true,
  },
  {
    id: "t-esther",
    name: "Esther Acheampong",
    age: 22,
    city: "Tamale",
    country: "Ghana",
    flag: "🇬🇭",
    avatarColor: "#10B981",
    initials: "EA",
    rawDescription:
      "I write blog content and email newsletters in English and Twi for two NGOs and a local farming cooperative. I've published 80+ articles.",
    primarySkill: "Content Creation",
    detectedSkills: ["Long-form Writing", "Email Newsletters", "SEO basics", "Twi/English bilingual", "WordPress"],
    experienceLevel: "Intermediate",
    suggestedRoles: ["Content Writer", "Newsletter Editor", "Communications Associate"],
    credibilityScore: 79,
    proofLinks: [{ label: "Writing samples", url: "https://medium.com" }],
    careerGoals: "Freelance for African development organisations and tech publications.",
    yearsActive: 2,
    available: true,
  },
];

export type OpportunityType = "Job" | "Gig" | "Apprenticeship" | "Training" | "Mentorship";

export type Opportunity = {
  id: string;
  title: string;
  provider: string;
  providerType: "Startup" | "SME" | "NGO" | "Remote Employer" | "Bootcamp" | "Mentor Network";
  type: OpportunityType;
  location: string;
  remote: boolean;
  requiredSkills: string[];
  matchSkillCategory: SkillCategory;
  compensation: string;
  description: string;
  deadline: string;
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "op-1",
    title: "Junior Frontend Developer Internship",
    provider: "Brimble (YC)",
    providerType: "Startup",
    type: "Job",
    location: "Remote · Africa",
    remote: true,
    requiredSkills: ["React", "JavaScript", "Tailwind", "Git"],
    matchSkillCategory: "Frontend Development",
    compensation: "$600–$900/mo · 6-month internship",
    description: "Work with a small product team shipping a developer hosting tool. Mentorship from senior engineers.",
    deadline: "Rolling",
  },
  {
    id: "op-2",
    title: "Remote Website Builder (10-page marketing site)",
    provider: "GreenLeaf D2C Brand",
    providerType: "SME",
    type: "Gig",
    location: "Remote",
    remote: true,
    requiredSkills: ["React", "Tailwind", "Responsive Design"],
    matchSkillCategory: "Frontend Development",
    compensation: "$1,200 fixed",
    description: "Build a fast, responsive marketing site for a sustainable haircare brand. 4-week timeline.",
    deadline: "2026-05-20",
  },
  {
    id: "op-3",
    title: "Frontend Bootcamp Scholarship",
    provider: "ALX Africa",
    providerType: "Bootcamp",
    type: "Training",
    location: "Online · Africa",
    remote: true,
    requiredSkills: ["JavaScript basics", "Motivation"],
    matchSkillCategory: "Frontend Development",
    compensation: "Fully funded",
    description: "12-month software engineering programme. Pay-after-you-earn model. Globally recognised.",
    deadline: "2026-06-10",
  },
  {
    id: "op-4",
    title: "Social Media Manager — African D2C Brand",
    provider: "Suya Box",
    providerType: "SME",
    type: "Job",
    location: "Lagos / Remote",
    remote: true,
    requiredSkills: ["Instagram", "CapCut", "Copywriting", "Paid Ads"],
    matchSkillCategory: "Digital Marketing",
    compensation: "$700/mo + commission",
    description: "Own social and paid acquisition for a fast-growing food brand. Quarterly bonus on sales growth.",
    deadline: "Rolling",
  },
  {
    id: "op-5",
    title: "YouTube Channel Editor — Tech Reviews",
    provider: "TechWithTim Network",
    providerType: "Remote Employer",
    type: "Job",
    location: "Remote · Global",
    remote: true,
    requiredSkills: ["Premiere Pro", "Color Grading", "Motion Graphics"],
    matchSkillCategory: "Video Editing",
    compensation: "$1,500–$2,500/mo",
    description: "Edit 3 long-form videos a week for a 800k subscriber tech channel. Async work, performance-based pay.",
    deadline: "2026-05-30",
  },
  {
    id: "op-6",
    title: "UI Designer Mentorship (12 weeks)",
    provider: "ADPList — Africa Cohort",
    providerType: "Mentor Network",
    type: "Mentorship",
    location: "Online",
    remote: true,
    requiredSkills: ["Figma", "Portfolio willingness"],
    matchSkillCategory: "UI/UX Design",
    compensation: "Free · 1:1 weekly mentor",
    description: "Get matched with a senior product designer. Portfolio reviews, interview prep, intro to hiring partners.",
    deadline: "2026-05-15",
  },
  {
    id: "op-7",
    title: "Backend Engineer — Fintech",
    provider: "Kuda-style Neobank",
    providerType: "Startup",
    type: "Job",
    location: "Remote · Africa",
    remote: true,
    requiredSkills: ["Node.js", "PostgreSQL", "Paystack", "Docker"],
    matchSkillCategory: "Backend Development",
    compensation: "$2,000–$3,500/mo",
    description: "Build the next iteration of payments and KYC services. Strong fintech security culture.",
    deadline: "Rolling",
  },
  {
    id: "op-8",
    title: "Mobile Repair Master Apprenticeship",
    provider: "Tecno Mobile West Africa",
    providerType: "SME",
    type: "Apprenticeship",
    location: "Accra / Lagos",
    remote: false,
    requiredSkills: ["Diagnostics", "Soldering", "Customer Service"],
    matchSkillCategory: "Phone Repair",
    compensation: "Stipend + certification",
    description: "12-month official Tecno-certified repair apprenticeship. Tools and certificate provided on completion.",
    deadline: "2026-07-01",
  },
  {
    id: "op-9",
    title: "Tailoring Microloan + Mentor Programme",
    provider: "Tony Elumelu Foundation",
    providerType: "NGO",
    type: "Training",
    location: "Pan-African",
    remote: false,
    requiredSkills: ["Existing tailoring business", "Business plan"],
    matchSkillCategory: "Tailoring",
    compensation: "$5,000 grant + 12-week training",
    description: "TEF Entrepreneurship Programme — seed capital and business mentoring for African micro-entrepreneurs.",
    deadline: "2026-06-30",
  },
  {
    id: "op-10",
    title: "Bilingual Content Writer (English/Twi)",
    provider: "Climate Action Africa",
    providerType: "NGO",
    type: "Gig",
    location: "Remote · Ghana",
    remote: true,
    requiredSkills: ["Long-form Writing", "Bilingual Twi/English", "SEO"],
    matchSkillCategory: "Content Creation",
    compensation: "$300/article · 6 articles",
    description: "Write 6 evidence-based articles on climate adaptation in West Africa for both English and Twi audiences.",
    deadline: "2026-05-25",
  },
];

// Cities for talent map (lat/lng-style percentage coords on stylised Africa map)
export const CITY_COORDS: Record<string, { x: number; y: number; country: string; flag: string }> = {
  Lagos: { x: 32, y: 62, country: "Nigeria", flag: "🇳🇬" },
  Kano: { x: 38, y: 48, country: "Nigeria", flag: "🇳🇬" },
  Accra: { x: 26, y: 64, country: "Ghana", flag: "🇬🇭" },
  Kumasi: { x: 24, y: 60, country: "Ghana", flag: "🇬🇭" },
  Tamale: { x: 25, y: 54, country: "Ghana", flag: "🇬🇭" },
  Kampala: { x: 64, y: 70, country: "Uganda", flag: "🇺🇬" },
};

export const COUNTRIES = ["Nigeria", "Ghana", "Uganda"] as const;

// Aggregated city skill clusters (mock — for talent map summary)
export const CITY_SKILL_CLUSTERS: Record<string, { skill: SkillCategory; count: number }[]> = {
  Lagos: [
    { skill: "Frontend Development", count: 200 },
    { skill: "UI/UX Design", count: 150 },
    { skill: "Digital Marketing", count: 100 },
    { skill: "Backend Development", count: 90 },
  ],
  Accra: [
    { skill: "Frontend Development", count: 120 },
    { skill: "Video Editing", count: 80 },
    { skill: "Graphic Design", count: 60 },
    { skill: "Phone Repair", count: 55 },
  ],
  Kampala: [
    { skill: "Video Editing", count: 95 },
    { skill: "UI/UX Design", count: 70 },
    { skill: "Content Creation", count: 50 },
  ],
  Kano: [
    { skill: "Tailoring", count: 140 },
    { skill: "Phone Repair", count: 70 },
    { skill: "Photography", count: 40 },
  ],
  Kumasi: [
    { skill: "Phone Repair", count: 110 },
    { skill: "Tailoring", count: 80 },
    { skill: "Graphic Design", count: 45 },
  ],
  Tamale: [
    { skill: "Content Creation", count: 60 },
    { skill: "Digital Marketing", count: 40 },
  ],
};
