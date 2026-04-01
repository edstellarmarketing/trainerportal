"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Step {
  id: string | null;
  trainer_id: string;
  step_number: number;
  step_name: string;
  label: string;
  status: string;
  reviewer_notes: string | null;
  score: number | null;
  score_details: Record<string, number> | null;
  started_at: string | null;
  completed_at: string | null;
}

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-300" },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  approved: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  rejected: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  info_requested: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

const SCORE_RUBRIC_LABELS: Record<string, string[]> = {
  domain_assessment: ["Domain Knowledge", "Communication Clarity", "Problem-Solving", "Industry Relevance"],
  trial_session: ["Content Delivery", "Engagement", "Practical Examples", "Time Management", "Q&A Handling"],
};

export default function VerificationPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;

  const [steps, setSteps] = useState<Step[]>([]);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/trainers/${trainerId}/verification`);
    const data = await res.json();
    setSteps(data.steps || []);
    setTrainer(data.trainer || null);

    // Set active step to first non-approved step
    const firstPending = data.steps?.find(
      (s: Step) => s.status !== "approved"
    );
    if (firstPending) setActiveStep(firstPending.step_number);

    setLoading(false);
  }, [trainerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentStep = steps.find((s) => s.step_number === activeStep);
  const hasScoreRubric = currentStep && SCORE_RUBRIC_LABELS[currentStep.step_name];

  async function handleAction(status: string) {
    setActionLoading(true);
    setError("");

    try {
      const totalScore = Object.keys(scores).length > 0
        ? Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
        : null;

      const res = await fetch(`/api/admin/trainers/${trainerId}/verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepNumber: activeStep,
          status,
          reviewerNotes: notes,
          score: totalScore,
          scoreDetails: Object.keys(scores).length > 0 ? scores : null,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Action failed");
      }

      setNotes("");
      setScores({});
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="p-8 text-center text-gray-500">
        Trainer not found.
        <button onClick={() => router.push("/admin")} className="ml-2 text-blue-600">Back</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <button
        onClick={() => router.push(`/admin/trainers/${trainerId}`)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to profile
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Verification Pipeline — {trainer.first_name} {trainer.last_name}
        </h1>
        <p className="text-sm text-gray-500">{trainer.email}</p>
      </div>

      {/* Pipeline stepper */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const colors = STATUS_COLORS[step.status] || STATUS_COLORS.pending;
          const isActive = step.step_number === activeStep;

          return (
            <div key={step.step_number} className="flex items-center">
              <button
                onClick={() => setActiveStep(step.step_number)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition border-2 ${
                  isActive
                    ? `${colors.bg} ${colors.text} border-current`
                    : `${colors.bg} ${colors.text} border-transparent hover:border-gray-200`
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${colors.dot} shrink-0`} />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.step_number}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-6 h-0.5 shrink-0 ${step.status === "approved" ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Active step detail */}
      {currentStep && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-gray-900">
                Step {currentStep.step_number}: {currentStep.label}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Status: <span className={STATUS_COLORS[currentStep.status]?.text || ""}>{currentStep.status.replace("_", " ")}</span>
                {currentStep.completed_at && (
                  <span className="ml-2">
                    — Completed {new Date(currentStep.completed_at).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="px-5 py-5 space-y-5">
            {/* Previous notes/score */}
            {currentStep.reviewer_notes && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Previous reviewer notes</p>
                <p className="text-sm text-gray-700">{currentStep.reviewer_notes}</p>
              </div>
            )}
            {currentStep.score != null && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Score</p>
                <p className="text-2xl font-bold text-gray-900">{Number(currentStep.score).toFixed(1)} <span className="text-sm font-normal text-gray-400">/ 5.0</span></p>
                {currentStep.score_details && (
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-500">
                    {Object.entries(currentStep.score_details).map(([key, val]) => (
                      <span key={key}>{key}: {String(val)}/5</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Score rubric for steps 3 & 4 */}
            {hasScoreRubric && currentStep.status !== "approved" && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Score Card</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SCORE_RUBRIC_LABELS[currentStep.step_name].map((label) => (
                    <div key={label} className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-600">{label}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => setScores({ ...scores, [label]: val })}
                            className={`w-7 h-7 rounded text-xs font-medium transition ${
                              scores[label] === val
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-300 text-gray-500 hover:border-blue-300"
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {Object.keys(scores).length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Average: <span className="font-semibold text-gray-900">
                      {(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length).toFixed(1)}
                    </span> / 5.0
                    {currentStep.step_name === "trial_session" && (
                      <span className="ml-1 text-xs">
                        {Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length >= 4.0
                          ? "(✓ Passes 4.0 threshold)"
                          : "(✗ Below 4.0 threshold)"}
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Reviewer notes */}
            {currentStep.status !== "approved" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reviewer Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Add notes for this verification step..."
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>
            )}

            {/* Action buttons */}
            {currentStep.status !== "approved" && (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => handleAction("approved")}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? "..." : "Approve Step"}
                </button>
                <button
                  onClick={() => handleAction("rejected")}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? "..." : "Reject"}
                </button>
                <button
                  onClick={() => handleAction("info_requested")}
                  disabled={actionLoading}
                  className="px-5 py-2 border border-amber-400 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 disabled:opacity-50 transition"
                >
                  {actionLoading ? "..." : "Request More Info"}
                </button>
                {currentStep.status === "pending" && (
                  <button
                    onClick={() => handleAction("in_progress")}
                    disabled={actionLoading}
                    className="px-5 py-2 border border-blue-400 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition"
                  >
                    {actionLoading ? "..." : "Start Review"}
                  </button>
                )}
              </div>
            )}

            {currentStep.status === "approved" && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This step has been approved
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
