import { Score } from "../types";
import { Gauge, Sparkles } from "lucide-react";

interface ScoreDashboardProps {
  score: Score;
}

export default function ScoreDashboard({ score }: ScoreDashboardProps) {
  // Helper to choose color based on high/mid/low scores
  const getScoreColor = (val: number) => {
    if (val >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400";
    if (val >= 70) return "text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400";
    return "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400";
  };

  const getScoreStroke = (val: number) => {
    if (val >= 85) return "#10b981"; // emerald-500
    if (val >= 70) return "#6366f1"; // indigo-500
    return "#f59e0b"; // amber-500
  };

  const getScoreBadgeText = (val: number) => {
    if (val >= 90) return "Excellent";
    if (val >= 80) return "Very Good";
    if (val >= 70) return "Average";
    return "Needs Review";
  };

  const CircularProgress = ({ value, label }: { value: number; label: string }) => {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    const strokeColor = getScoreStroke(value);

    return (
      <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-xs shadow-xs">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-gray-100 fill-none"
              strokeWidth="5"
            />
            {/* Indicator circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="fill-none transition-all duration-1000 ease-out"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke={strokeColor}
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-xl font-bold tracking-tight text-gray-800">{value}</span>
          </div>
        </div>
        <p className="mt-2 text-xs font-semibold text-gray-500 tracking-wide uppercase">{label}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-r from-gray-900 to-slate-800 p-6 text-white shadow-xs">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-emerald-200 backdrop-blur-xs mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Writing Quality Report
            </span>
            <h3 className="text-lg font-bold text-gray-100">Overall Assessment</h3>
            <p className="mt-1.5 text-sm text-gray-300">
              Your writing scored <span className="font-semibold text-emerald-300">{score.overall}/100</span>.
              This indicates an <span className="underline decoration-emerald-400 font-medium">{getScoreBadgeText(score.overall)}</span> level of clarity and structure.
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-br from-white to-gray-400">
              {score.overall}
            </span>
            <span className="text-xs text-gray-400 mt-1 font-medium tracking-wider">OVERALL SCORE</span>
          </div>
        </div>
      </div>

      {/* Breakdown Gauges */}
      <div className="grid grid-cols-3 gap-3">
        <CircularProgress value={score.grammar} label="Grammar" />
        <CircularProgress value={score.clarity} label="Clarity" />
        <CircularProgress value={score.flow} label="Vocabulary" />
      </div>

      {/* Evaluator Explanations */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3.5">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-gray-400" /> Scoring Metrics Reference
        </h4>

        <div className="space-y-3">
          <div className="text-xs flex gap-3">
            <span className="font-bold text-emerald-600 w-16 shrink-0">85 - 100</span>
            <span className="text-gray-600">Polished, publishing-ready content requiring little to no modifications. Excellent word economy.</span>
          </div>
          <div className="text-xs flex gap-3">
            <span className="font-bold text-indigo-600 w-16 shrink-0">70 - 84</span>
            <span className="text-gray-600">Clear and highly legible, but exhibits minor grammatical noise or slight sentence structures bottlenecks.</span>
          </div>
          <div className="text-xs flex gap-3">
            <span className="font-bold text-amber-600 w-16 shrink-0">0 - 69</span>
            <span className="text-gray-600">Significant grammar mistakes, spelling oversights, or highly passive/claustrophobic phrasing requiring review.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
