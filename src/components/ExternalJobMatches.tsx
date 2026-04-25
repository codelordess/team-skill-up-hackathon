/**
 * ExternalJobMatches.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Drop-in component that fetches AI-matched external jobs and renders them
 * alongside the existing internal opportunity matches.
 *
 * Usage (in TalentDashboard or wherever you show matches):
 *
 *   import ExternalJobMatches from "@/components/ExternalJobMatches";
 *
 *   // After /process-talent succeeds and you have `profile`:
 *   <ExternalJobMatches profile={profile} />
 *
 *   // OR pass raw fields:
 *   <ExternalJobMatches
 *     primarySkill="React Developer"
 *     detectedSkills={["React", "TypeScript", "CSS"]}
 *     experienceLevel="Intermediate"
 *   />
 */

"use client";

import { useEffect, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────

interface SkillProfile {
  primary_skill: string;
  detected_skills: string[];
  experience_level: string;
  suggested_roles: string[];
  credibility_score: number;
}

interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  tags: string[];
  job_type?: string;
  salary?: string;
  source: "Remotive" | "Jobicy" | string;
}

interface ExternalJobMatch {
  job: ExternalJob;
  match_score: number;
  reason: string;
}

interface ExternalJobsResponse {
  matches: ExternalJobMatch[];
  total: number;
  sources: string[];
}

interface Props {
  /** Pass either a full profile OR the raw fields below */
  profile?: SkillProfile;
  primarySkill?: string;
  detectedSkills?: string[];
  experienceLevel?: string;
  /** Your FastAPI base URL — defaults to env var */
  apiBase?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

const API_BASE =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
    : "http://localhost:8000";

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 60) return "#f59e0b"; // amber
  return "#94a3b8";                  // slate
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong match";
  if (score >= 60) return "Good match";
  return "Partial match";
}

function jobTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    freelance: "Freelance",
    internship: "Internship",
  };
  return type ? (map[type] ?? type) : "Remote";
}

// ── Source badge colours ──────────────────────────────────────────────────

const SOURCE_STYLES: Record<string, { bg: string; text: string }> = {
  Remotive: { bg: "#dbeafe", text: "#1d4ed8" },
  Jobicy:   { bg: "#fce7f3", text: "#be185d" },
};

// ── Component ─────────────────────────────────────────────────────────────

export default function ExternalJobMatches({
  profile,
  primarySkill,
  detectedSkills,
  experienceLevel,
  apiBase,
}: Props) {
  const [matches, setMatches] = useState<ExternalJobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);

  const base = apiBase ?? API_BASE;

  useEffect(() => {
    // Guard: we need either a profile or at least primary_skill + detectedSkills
    if (!profile && !(primarySkill && detectedSkills?.length)) return;

    const controller = new AbortController();

    async function fetchMatches() {
      setLoading(true);
      setError(null);

      const body = profile
        ? { profile }
        : {
            primary_skill: primarySkill,
            detected_skills: detectedSkills,
            experience_level: experienceLevel,
          };

      try {
        const res = await fetch(`${base}/api/v1/talent/external-jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail ?? `Error ${res.status}`);
        }

        const data: ExternalJobsResponse = await res.json();
        setMatches(data.matches);
        setSources(data.sources);
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load external jobs."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    profile?.primary_skill,
    primarySkill,
    detectedSkills?.join(","),
  ]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <section style={styles.section}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.liveIndicator} />
          <h2 style={styles.title}>Live External Jobs</h2>
        </div>
        {sources.length > 0 && (
          <div style={styles.sourceList}>
            {sources.map((src) => {
              const s = SOURCE_STYLES[src] ?? { bg: "#e2e8f0", text: "#475569" };
              return (
                <span
                  key={src}
                  style={{ ...styles.sourceBadge, background: s.bg, color: s.text }}
                >
                  {src}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <p style={styles.subtitle}>
        AI-matched opportunities from global remote job boards, ranked for your
        profile.
      </p>

      {/* Loading */}
      {loading && (
        <div style={styles.loadingWrap}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ ...styles.skeleton, animationDelay: `${i * 0.15}s` }} />
          ))}
          <p style={styles.loadingText}>Searching live job boards…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && matches.length === 0 && (
        <div style={styles.emptyBox}>
          No external matches found right now. Check back soon — job boards update
          frequently.
        </div>
      )}

      {/* Job cards */}
      {!loading && !error && matches.length > 0 && (
        <div style={styles.grid}>
          {matches.map(({ job, match_score, reason }, idx) => (
            <article key={job.id} style={styles.card}>
              {/* Score pill */}
              <div style={styles.cardTop}>
                <div
                  style={{
                    ...styles.scorePill,
                    background: scoreColor(match_score) + "22",
                    color: scoreColor(match_score),
                    borderColor: scoreColor(match_score) + "55",
                  }}
                >
                  <span style={{ ...styles.scoreDot, background: scoreColor(match_score) }} />
                  {match_score}% · {scoreLabel(match_score)}
                </div>

                {/* Source badge */}
                {(() => {
                  const s = SOURCE_STYLES[job.source] ?? {
                    bg: "#e2e8f0",
                    text: "#475569",
                  };
                  return (
                    <span
                      style={{
                        ...styles.sourceBadge,
                        background: s.bg,
                        color: s.text,
                        fontSize: "0.7rem",
                      }}
                    >
                      {job.source}
                    </span>
                  );
                })()}
              </div>

              {/* Job info */}
              <h3 style={styles.jobTitle}>{job.title}</h3>
              <p style={styles.company}>{job.company}</p>

              <div style={styles.metaRow}>
                <span style={styles.metaChip}>📍 {job.location}</span>
                <span style={styles.metaChip}>💼 {jobTypeLabel(job.job_type)}</span>
                {job.salary && (
                  <span style={styles.metaChip}>💰 {job.salary}</span>
                )}
              </div>

              {/* Description snippet */}
              {job.description && (
                <p style={styles.description}>{job.description.slice(0, 180)}…</p>
              )}

              {/* AI reason */}
              <p style={styles.reason}>
                <span style={styles.reasonLabel}>AI match: </span>
                {reason}
              </p>

              {/* Tags */}
              {job.tags.length > 0 && (
                <div style={styles.tags}>
                  {job.tags.slice(0, 5).map((tag) => (
                    <span key={tag} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.applyBtn}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background = "#1d4ed8")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background = "#2563eb")
                }
              >
                Apply on {job.source} →
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Styles (inline, no external deps) ────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  section: {
    marginTop: "2rem",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "0.25rem",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  liveIndicator: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 0 3px #22c55e33",
    animation: "pulse 2s infinite",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: 700,
    margin: 0,
    color: "#0f172a",
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "#64748b",
    marginBottom: "1.25rem",
    marginTop: "0.25rem",
  },
  sourceList: {
    display: "flex",
    gap: "0.4rem",
  },
  sourceBadge: {
    padding: "0.2rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  skeleton: {
    height: "120px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  },
  loadingText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.85rem",
    marginTop: "0.5rem",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    color: "#dc2626",
    fontSize: "0.9rem",
  },
  errorIcon: {
    fontSize: "1.1rem",
  },
  emptyBox: {
    padding: "1.5rem",
    textAlign: "center",
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1rem",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "1.1rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    transition: "box-shadow 0.2s, transform 0.2s",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scorePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  scoreDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
  },
  jobTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
    lineHeight: 1.3,
  },
  company: {
    fontSize: "0.85rem",
    color: "#2563eb",
    fontWeight: 500,
    margin: 0,
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.35rem",
  },
  metaChip: {
    fontSize: "0.75rem",
    color: "#475569",
    background: "#f1f5f9",
    padding: "0.2rem 0.5rem",
    borderRadius: "6px",
  },
  description: {
    fontSize: "0.82rem",
    color: "#64748b",
    lineHeight: 1.5,
    margin: 0,
  },
  reason: {
    fontSize: "0.8rem",
    color: "#475569",
    background: "#f8fafc",
    padding: "0.4rem 0.6rem",
    borderRadius: "8px",
    margin: 0,
  },
  reasonLabel: {
    fontWeight: 600,
    color: "#0f172a",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.3rem",
  },
  tag: {
    fontSize: "0.72rem",
    padding: "0.15rem 0.45rem",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: "5px",
    fontWeight: 500,
  },
  applyBtn: {
    display: "block",
    marginTop: "auto",
    padding: "0.55rem 1rem",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: 600,
    textAlign: "center",
    transition: "background 0.15s",
  },
};
