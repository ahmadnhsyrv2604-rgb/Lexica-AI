import { SavedHistoryItem } from "../types";
import { History, Calendar, Trash2, ArrowRight, RotateCcw } from "lucide-react";

interface HistoryListProps {
  history: SavedHistoryItem[];
  onSelectHistory: (item: SavedHistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
}

export default function HistoryList({
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearHistory,
}: HistoryListProps) {
  
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-700 bg-emerald-50 border-emerald-100";
    if (score >= 70) return "text-indigo-700 bg-indigo-50 border-indigo-100";
    return "text-amber-700 bg-amber-50 border-amber-100";
  };

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-gray-200 bg-white text-center">
        <History className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-sm font-semibold text-gray-500">History Empty</p>
        <p className="text-xs text-gray-400 mt-0.5">Your analyzed files will be saved here in your browser.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-0.5">
          <History className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-bold text-gray-900">Analysis History</h3>
        </div>
        <button
          onClick={onClearHistory}
          className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider px-2 py-1 rounded hover:bg-red-50"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-2xs transition-all duration-200"
          >
            <button
              onClick={() => onSelectHistory(item)}
              className="flex-grow text-left flex items-start gap-3"
            >
              <div className={`p-2 flex items-center justify-center font-bold text-xs border rounded-lg shrink-0 ${scoreColor(item.result.score.overall)}`}>
                {item.result.score.overall}
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-gray-800 truncate leading-snug group-hover:text-indigo-600 transition-colors">
                  {item.originalText.replace(/\n/g, " ")}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.originalText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelectHistory(item)}
                title="Restore analysis report"
                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteHistory(item.id)}
                title="Delete history item"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
