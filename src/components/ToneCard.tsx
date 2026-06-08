import { useState } from "react";
import { ToneAdjustment } from "../types";
import { 
  Briefcase, 
  Smile, 
  BookOpen, 
  Megaphone, 
  Heart, 
  Zap, 
  Copy, 
  Check, 
  ArrowLeftRight,
  Sparkles
} from "lucide-react";

interface ToneCardProps {
  adjustments: ToneAdjustment[];
  onApplyTone: (text: string) => void;
}

export default function ToneCard({ adjustments, onApplyTone }: ToneCardProps) {
  const [selectedTone, setSelectedTone] = useState<string>(
    adjustments[0]?.toneName || "Professional"
  );
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  const getToneIcon = (tone: string) => {
    switch (tone.toLowerCase()) {
      case "professional":
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case "casual":
        return <Smile className="w-4 h-4 text-emerald-500" />;
      case "academic":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "persuasive":
        return <Megaphone className="w-4 h-4 text-rose-500" />;
      case "friendly":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "concise":
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-gray-500" />;
    }
  };

  const currentAdjustment = adjustments.find(
    (adj) => adj.toneName.toLowerCase() === selectedTone.toLowerCase()
  );

  const handleCopy = async (text: string, toneName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMap((prev) => ({ ...prev, [toneName]: true }));
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [toneName]: false }));
      }, 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  if (!adjustments || adjustments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-gray-200 bg-white text-center">
        <Sparkles className="w-8 h-8 text-gray-300 animate-pulse mb-2" />
        <p className="text-sm text-gray-500">No tone adjustments available. Execute an analysis first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tone Select Button Reels */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 rounded-xl">
        {adjustments.map((adj) => {
          const isSelected = adj.toneName.toLowerCase() === selectedTone.toLowerCase();
          return (
            <button
              key={adj.toneName}
              onClick={() => setSelectedTone(adj.toneName)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 shrink-0 ${
                isSelected
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              {getToneIcon(adj.toneName)}
              <span>{adj.toneName}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tone Panel */}
      {currentAdjustment && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                {getToneIcon(currentAdjustment.toneName)}
                <span>{currentAdjustment.toneName} Tone Rewrite</span>
              </h4>
              <p className="text-xs text-gray-500 italic max-w-sm">
                {currentAdjustment.description}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm leading-relaxed text-gray-700 min-h-24 whitespace-pre-wrap select-text">
            {currentAdjustment.text}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(currentAdjustment.text, currentAdjustment.toneName)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100/50 transition-colors"
            >
              {copiedMap[currentAdjustment.toneName] ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Rewrite</span>
                </>
              )}
            </button>

            <button
              onClick={() => onApplyTone(currentAdjustment.text)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 hover:text-indigo-50 active:scale-[0.98] transition-all"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Apply to Editor</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
