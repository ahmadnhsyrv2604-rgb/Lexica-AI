export interface Score {
  grammar: number;
  clarity: number;
  flow: number;
  overall: number;
}

export interface HardCorrection {
  original: string;
  corrected: string;
  type: "spelling" | "grammar" | "punctuation" | "clarity" | string;
  explanation: string;
  offset?: number;
  length?: number;
}

export interface StyleSuggestion {
  category: string;
  issue: string;
  explanation: string;
  suggestion: string;
}

export interface ToneAdjustment {
  toneName: "Professional" | "Casual" | "Academic" | "Persuasive" | "Friendly" | "Concise" | string;
  text: string;
  description: string;
}

export interface AnalysisResult {
  originalText: string;
  correctedText: string;
  score: Score;
  corrections: HardCorrection[];
  styleSuggestions: StyleSuggestion[];
  toneAdjustments: ToneAdjustment[];
  isMocked?: boolean;
}

export interface SavedHistoryItem {
  id: string;
  timestamp: string;
  originalText: string;
  result: AnalysisResult;
}
