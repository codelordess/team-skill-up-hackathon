import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertCircle, Award, Brain, CheckCircle2, ChevronRight,
  Clock, Code2, Loader2, RotateCcw, Sparkles, Target,
  Trophy, XCircle, Zap
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://skillmap-gy34.onrender.com/api";

type Question = {
  id: number;
  type: "multiple_choice" | "true_false" | "short_answer" | "code";
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
};

type AssessmentBundle = {
  skill: string;
  level: string;
  questions: Question[];
  time_limit_minutes: number;
};

type QuestionResult = {
  question_id: number;
  question: string;
  your_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  topic: string;
};

type AssessmentResult = {
  overall_score: number;
  grade: string;
  badge: string;
  total_questions: number;
  correct_answers: number;
  skill_breakdown: { topic: string; correct: number; total: number; score: number }[];
  results: QuestionResult[];
  strengths: string[];
  weak_areas: string[];
  recommendation: string;
};

const DIFF_COLOR = {
  easy: "text-green-500 bg-green-500/10",
  medium: "text-amber-500 bg-amber-500/10",
  hard: "text-red-500 bg-red-500/10",
};

const GRADE_COLOR: Record<string, string> = {
  A: "text-green-500",
  B: "text-blue-500",
  C: "text-amber-500",
  D: "text-orange-500",
  F: "text-red-500",
};

export default function SkillAssessment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Profile data
  const [primarySkill, setPrimarySkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [level, setLevel] = useState("Beginner");
  const [profileLoading, setProfileLoading] = useState(true);

  // Assessment state
  const [phase, setPhase] = useState<"intro" | "loading" | "test" | "submitting" | "results">("intro");
  const [bundle, setBundle] = useState<AssessmentBundle | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load talent profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: t } = await supabase
        .from("talents")
        .select("primary_skill, extracted_skills, experience_level")
        .eq("user_id", user.id)
        .maybeSingle();
      if (t) {
        setPrimarySkill(t.primary_skill || "");
        setSkills(t.extracted_skills || []);
        setLevel(t.experience_level || "Beginner");
      }
      setProfileLoading(false);
    })();
  }, [user]);

  // Timer countdown
  useEffect(() => {
    if (phase !== "test" || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const startAssessment = async () => {
    if (!primarySkill) {
      toast.error("Please set your primary skill in your profile first.");
      navigate("/talent/edit");
      return;
    }
    setPhase("loading");
    try {
      const res = await fetch(`${API_URL}/v1/assessment/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_skill: primarySkill,
          extracted_skills: skills,
          experience_level: level,
          num_questions: 8,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate assessment");
      const data: AssessmentBundle = await res.json();
      setBundle(data);
      setAnswers({});
      setCurrentQ(0);
      setShowExplanation(false);
      setTimeLeft(data.time_limit_minutes * 60);
      startTimeRef.current = Date.now();
      setPhase("test");
    } catch (err: any) {
      toast.error(err.message || "Could not generate assessment");
      setPhase("intro");
    }
  };

  const selectAnswer = (questionId: number, answer: string) => {
    if (showExplanation) return; // locked after reveal
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (!bundle) return;
    setShowExplanation(false);
    if (currentQ < bundle.questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      handleSubmit();
    }
  };

  const handleReveal = () => setShowExplanation(true);

  const handleSubmit = async () => {
    if (!bundle) return;
    clearInterval(timerRef.current!);
    setPhase("submitting");
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await fetch(`${API_URL}/v1/assessment/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_skill: bundle.skill,
          experience_level: bundle.level,
          questions: bundle.questions,
          answers: Object.entries(answers).map(([id, answer]) => ({
            question_id: parseInt(id),
            answer,
          })),
        }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      const data: AssessmentResult = await res.json();
      data.time_taken_seconds = timeTaken;
      setResult(data);

      // ── Persist result to Supabase so it shows on the dashboard ────
      if (user) {
        const { error: saveErr } = await supabase.from("skill_assessments").insert({
          user_id: user.id,
          skill: bundle.skill,
          experience_level: bundle.level,
          overall_score: data.overall_score,
          grade: data.grade,
          badge: data.badge,
          correct_answers: data.correct_answers,
          total_questions: data.total_questions,
          time_taken_seconds: timeTaken,
          strengths: data.strengths,
          weak_areas: data.weak_areas,
          recommendation: data.recommendation,
          skill_breakdown: data.skill_breakdown,
        });
        if (saveErr) {
          // Non-fatal — result is still shown, just not persisted
          console.error("Could not save assessment result:", saveErr.message);
        } else {
          toast.success("Result saved to your profile! 🎉");
        }
      }
      // ───────────────────────────────────────────────────────────────

      setPhase("results");
    } catch (err: any) {
      toast.error(err.message || "Evaluation failed");
      setPhase("test");
    }
  };

  if (profileLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // ── INTRO ──────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <Layout>
        <section className="container max-w-2xl py-16 space-y-8">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Brain className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl font-extrabold">Skill Assessment</h1>
            <p className="text-muted-foreground text-lg">
              Prove your skills with an AI-powered test tailored to your specialization.
            </p>
          </div>

          {/* Profile snapshot */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Your assessment will cover</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">{primarySkill || "No skill set"}</p>
                <p className="text-sm text-muted-foreground">{level} level · {skills.length} detected skills</p>
              </div>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 8).map(s => (
                  <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{s}</span>
                ))}
              </div>
            )}
            {!primarySkill && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Set your primary skill in your profile first before taking the assessment.
                </p>
              </div>
            )}
          </div>

          {/* What to expect */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Zap, label: "8 questions", sub: "Mixed formats" },
              { icon: Clock, label: "24 minutes", sub: "3 min per question" },
              { icon: Trophy, label: "Instant score", sub: "With badge" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
                <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-secondary/50 p-4 space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Before you start:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Questions are generated specifically for your skill set</li>
              <li>Mix of multiple choice, true/false, and practical questions</li>
              <li>You can check each answer before moving on</li>
              <li>Timer auto-submits when it runs out</li>
            </ul>
          </div>

          <button
            onClick={startAssessment}
            disabled={!primarySkill}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-4 font-bold text-lg text-primary-foreground shadow-elegant hover:shadow-glow transition-all disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" /> Start Assessment
          </button>
        </section>
      </Layout>
    );
  }

  // ── LOADING ─────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <Layout>
        <section className="container max-w-lg py-32 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow animate-pulse">
            <Brain className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold">Generating your assessment...</h2>
          <p className="text-muted-foreground">
            AI is crafting questions tailored to your <strong>{primarySkill}</strong> skills at <strong>{level}</strong> level.
          </p>
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        </section>
      </Layout>
    );
  }

  // ── TEST ─────────────────────────────────────────────────────────────────
  if (phase === "test" && bundle) {
    const q = bundle.questions[currentQ];
    const answered = answers[q.id];
    const isLast = currentQ === bundle.questions.length - 1;
    const progress = ((currentQ + 1) / bundle.questions.length) * 100;
    const timerWarning = timeLeft < 120;

    return (
      <Layout>
        <section className="container max-w-2xl py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Question {currentQ + 1} of {bundle.questions.length}
              </p>
              <p className="font-bold">{bundle.skill} Assessment</p>
            </div>
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono font-bold text-lg ${timerWarning ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-secondary text-foreground"}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-gradient-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          {/* Question card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            {/* Meta */}
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${DIFF_COLOR[q.difficulty]}`}>
                {q.difficulty}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {q.topic}
              </span>
              {q.type === "code" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <Code2 className="h-3 w-3" /> Code
                </span>
              )}
            </div>

            {/* Question text */}
            <div className="space-y-3">
              {q.question.includes("```") ? (
                <div className="space-y-3">
                  {q.question.split("```").map((part, i) =>
                    i % 2 === 0 ? (
                      <p key={i} className="font-medium leading-relaxed whitespace-pre-wrap">{part.trim()}</p>
                    ) : (
                      <pre key={i} className="overflow-x-auto rounded-xl bg-[#0f172a] p-4 text-sm text-green-400 font-mono leading-relaxed">
                        {part.replace(/^[a-z]+\n/, "")}
                      </pre>
                    )
                  )}
                </div>
              ) : (
                <p className="font-medium leading-relaxed text-lg">{q.question}</p>
              )}
            </div>

            {/* Answer options */}
            {q.type === "multiple_choice" || q.type === "true_false" ? (
              <div className="space-y-2">
                {(q.options || []).map(opt => {
                  const letter = opt[0];
                  const isSelected = answered === letter || answered === opt;
                  const isCorrect = showExplanation && (q.correct_answer === letter || q.correct_answer === opt || opt.startsWith(q.correct_answer));
                  const isWrong = showExplanation && isSelected && !isCorrect;

                  return (
                    <button
                      key={opt}
                      onClick={() => selectAnswer(q.id, q.type === "multiple_choice" ? letter : opt)}
                      disabled={showExplanation}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                        isCorrect
                          ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                          : isWrong
                          ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                          : isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {showExplanation && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
                        {showExplanation && isWrong && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
                        {!showExplanation && isSelected && <div className="h-4 w-4 shrink-0 rounded-full border-2 border-primary bg-primary/20" />}
                        {!showExplanation && !isSelected && <div className="h-4 w-4 shrink-0 rounded-full border-2 border-border" />}
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Short answer / code text input
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your answer
                </label>
                <textarea
                  value={answers[q.id] || ""}
                  onChange={e => selectAnswer(q.id, e.target.value)}
                  disabled={showExplanation}
                  rows={4}
                  placeholder="Type your answer here..."
                  className="h-auto w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono disabled:opacity-70"
                />
              </div>
            )}

            {/* Explanation (after reveal) */}
            {showExplanation && (
              <div className="rounded-xl bg-secondary/60 border border-border p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Explanation</p>
                <p className="text-sm leading-relaxed">{q.explanation}</p>
                {q.type !== "multiple_choice" && q.type !== "true_false" && (
                  <div className="mt-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                    <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">Model answer:</p>
                    <p className="text-sm">{q.correct_answer}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              {Object.keys(answers).length} of {bundle.questions.length} answered
            </p>
            <div className="flex gap-3">
              {answered && !showExplanation && (
                <button
                  onClick={handleReveal}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary transition"
                >
                  Check answer
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!answered && q.type !== "short_answer" && q.type !== "code"}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 font-bold text-primary-foreground shadow-elegant disabled:opacity-50 hover:shadow-glow transition-all"
              >
                {isLast ? "Submit" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // ── SUBMITTING ──────────────────────────────────────────────────────────
  if (phase === "submitting") {
    return (
      <Layout>
        <section className="container max-w-lg py-32 text-center space-y-4">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <h2 className="font-display text-2xl font-bold">Evaluating your answers...</h2>
          <p className="text-muted-foreground">AI is scoring your responses and preparing feedback.</p>
        </section>
      </Layout>
    );
  }

  // ── RESULTS ─────────────────────────────────────────────────────────────
  if (phase === "results" && result) {
    return (
      <Layout>
        <section className="container max-w-2xl py-10 space-y-6">
          {/* Score hero */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-primary/5 p-8 text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Trophy className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <div className={`font-display text-7xl font-extrabold ${GRADE_COLOR[result.grade]}`}>
                {result.overall_score}
              </div>
              <div className="text-muted-foreground text-sm mt-1">out of 100</div>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border ${
              result.overall_score >= 75 ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
              : result.overall_score >= 50 ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
              : "bg-red-500/10 border-red-500/30 text-red-600"
            }`}>
              {result.badge}
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{result.recommendation}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="font-display text-2xl font-extrabold text-primary">{result.correct_answers}/{result.total_questions}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className={`font-display text-2xl font-extrabold ${GRADE_COLOR[result.grade]}`}>{result.grade}</div>
              <div className="text-xs text-muted-foreground">Grade</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="font-display text-2xl font-extrabold">
                {result.time_taken_seconds ? `${Math.floor(result.time_taken_seconds / 60)}m` : "—"}
              </div>
              <div className="text-xs text-muted-foreground">Time taken</div>
            </div>
          </div>

          {/* Skill breakdown */}
          {result.skill_breakdown.length > 1 && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-bold">Topic breakdown</h3>
              {result.skill_breakdown.map(b => (
                <div key={b.topic}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{b.topic}</span>
                    <span className={`font-bold ${b.score >= 70 ? "text-green-500" : b.score >= 50 ? "text-amber-500" : "text-red-500"}`}>
                      {b.correct}/{b.total}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full transition-all ${b.score >= 70 ? "bg-green-500" : b.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${b.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Strengths & weak areas */}
          <div className="grid grid-cols-2 gap-4">
            {result.strengths.length > 0 && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                </h4>
                <ul className="space-y-1">
                  {result.strengths.map(s => <li key={s} className="text-sm">{s}</li>)}
                </ul>
              </div>
            )}
            {result.weak_areas.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Needs work
                </h4>
                <ul className="space-y-1">
                  {result.weak_areas.map(s => <li key={s} className="text-sm">{s}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Per-question review */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-bold">Question review</h3>
            {result.results.map((r, i) => (
              <div key={r.question_id} className={`rounded-xl border p-4 space-y-2 ${r.is_correct ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                <div className="flex items-start gap-2">
                  {r.is_correct
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium leading-snug">{r.question.split("```")[0].trim()}</p>
                </div>
                <div className="pl-6 space-y-1 text-xs">
                  <p className="text-muted-foreground">Your answer: <span className={r.is_correct ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>{r.your_answer}</span></p>
                  {!r.is_correct && <p className="text-muted-foreground">Correct: <span className="font-semibold text-foreground">{r.correct_answer}</span></p>}
                  <p className="text-muted-foreground italic">{r.explanation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setPhase("intro"); setResult(null); setBundle(null); }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 font-semibold hover:bg-secondary transition"
            >
              <RotateCcw className="h-4 w-4" /> Retake
            </button>
            <Link
              to="/talent/dashboard"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-all"
            >
              <Award className="h-4 w-4" /> See my dashboard
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return null;
}