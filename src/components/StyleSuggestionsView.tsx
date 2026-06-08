import { StyleSuggestion } from "../types";
import { Lightbulb, Info, FileText, HelpCircle, Sparkles } from "lucide-react";

interface StyleSuggestionsViewProps {
  suggestions: StyleSuggestion[];
}

export default function StyleSuggestionsView({ suggestions }: StyleSuggestionsViewProps) {
  
  const getCategoryTheme = (category: string) => {
    const term = category.toLowerCase();
    if (term.includes("concise") || term.includes("brevity")) {
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-300",
        icon: <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
      };
    }
    if (term.includes("vocab") || term.includes("word choice") || term.includes("quality")) {
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300",
        icon: <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
      };
    }
    if (term.includes("structure") || term.includes("flow") || term.includes("variety")) {
      return {
        badge: "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-300",
        icon: <FileText className="w-3.5 h-3.5 text-indigo-500" />
      };
    }
    return {
      badge: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-300",
      icon: <Info className="w-3.5 h-3.5 text-blue-500" />
    };
  };

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-gray-200 bg-white text-center">
        <Lightbulb className="w-8 h-8 text-gray-300 animate-pulse mb-2" />
        <p className="text-sm font-semibold text-gray-700">Excellent Prose Structure!</p>
        <p className="text-xs text-gray-500 max-w-xs mt-1">No stylistic bottlenecks found. Your writing style is direct and clear.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 px-0.5">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-gray-900">Stylistic & Vocabulary Recommendations</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((sug, idx) => {
          const theme = getCategoryTheme(sug.category);
          return (
            <div 
              key={idx} 
              className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-100 hover:shadow-xs transition-all duration-200 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${theme.badge}`}>
                  {theme.icon}
                  <span>{sug.category}</span>
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {sug.issue}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {sug.explanation}
                </p>
              </div>

              <div className="p-3 bg-[#FDFCF8] rounded-lg border border-gray-100 space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase select-none">Actionable Improvement Advice</p>
                <p className="text-xs text-gray-700 font-semibold select-all italic before:content-['\201C'] after:content-['\201D']">
                  {sug.suggestion}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
