import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Sparkles, 
  Loader2, 
  ArrowLeftRight, 
  BookOpen, 
  ArrowUpRight, 
  ThumbsUp, 
  AlertCircle
} from "lucide-react";

interface VocabularyLabsProps {
  editorText: string;
  onApplyUpgrade: (original: string, corrected: string) => void;
  triggerAlert: (msg: string, type?: "success" | "info" | "error") => void;
}

interface SynonymBuckets {
  scholarly: string[];
  premium: string[];
  active: string[];
  concise: string[];
}

interface SynonymResponse {
  word: string;
  synonyms: SynonymBuckets;
  contextExample: string;
  isMocked?: boolean;
}

interface WordUpgradeItem {
  original: string;
  corrected: string;
  explanation: string;
  type: string;
}

const COMMON_LOOKUPS = ["good", "bad", "important", "try", "very"];

export default function VocabularyLabs({ editorText, onApplyUpgrade, triggerAlert }: VocabularyLabsProps) {
  // Option A: Synonym Search State
  const [searchWord, setSearchWord] = useState<string>("important");
  const [synonymResult, setSynonymResult] = useState<SynonymResponse | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Option B: Prose Upgrader Diagnostic State
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [upgradedWords, setUpgradedWords] = useState<WordUpgradeItem[]>([]);
  const [diagnosticsRun, setDiagnosticsRun] = useState<boolean>(false);

  // Trigger search on mount and when query changes
  const handleSynonymSearch = async (query: string) => {
    if (!query.trim()) {
      triggerAlert("Please enter a valid word to dissect inside the search console.", "info");
      return;
    }
    
    setIsSearching(true);
    setSynonymResult(null);

    try {
      const response = await fetch("/api/vocab-labs/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ word: query.trim() })
      });

      if (!response.ok) {
        throw new Error("Synonym API error");
      }

      const data: SynonymResponse = await response.json();
      setSynonymResult(data);
    } catch (e) {
      triggerAlert("Failed to retrieve laboratory vocabulary suggestions.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRunProseUpgrade = async () => {
    if (!editorText.trim()) {
      triggerAlert("Please write or import a draft in your main editor workspace first.", "error");
      return;
    }

    setIsDiagnosing(true);
    setUpgradedWords([]);
    setDiagnosticsRun(true);

    try {
      const response = await fetch("/api/vocab-labs/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: editorText })
      });

      if (!response.ok) {
        throw new Error("Upgrader API error");
      }

      const data = await response.json();
      setUpgradedWords(data.upgrades || []);
      triggerAlert(`Scanned text! Identified ${data.upgrades?.length || 0} vocabulary optimization points.`, "success");
    } catch (e) {
      triggerAlert("Problem communicating with the vocabulary upgrade daemon.", "error");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleApplyReplacementInDoc = (orig: string, replacement: string) => {
    onApplyUpgrade(orig, replacement);
    // filter upgraded words client-side to reflect updated state dynamically
    setUpgradedWords(prev => prev.filter(w => w.original !== orig));
    triggerAlert(`Upraded "${orig}" with "${replacement}" inside your document.`, "success");
  };

  // Perform initial search
  useEffect(() => {
    handleSynonymSearch("important");
  }, []);

  return (
    <div className="w-full space-y-8" id="vocabulary_labs_panel">
      {/* Introduction Banner */}
      <div className="border border-[#E5E2D9] rounded-lg p-5 bg-[#FDFCF8] shadow-2xs">
        <h2 className="font-serif italic text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-700" />
          <span>Vocabulary Upgrade Labs</span>
        </h2>
        <p className="text-xs text-[#1A1A1A]/60 leading-relaxed mt-2 max-w-2xl">
          Reject ordinary, repetitive wording in your publications. This lexicon laboratory helps you dissect flat language into high-validity terminology and lets you scan your current active draft to upgrade tired modifiers with precision synonyms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Synonym Search Laboratory Interface (Cols: 5) */}
        <section className="lg:col-span-5 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 block">Lexicon Search Console</span>
            <span className="text-[11px] leading-relaxed block text-stone-500">Query overused words to unlock premium editorial-grade alternatives.</span>
          </div>

          {/* Search box card */}
          <div className="p-5 rounded-lg border border-[#E5E2D9] bg-white space-y-4 shadow-2xs">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSynonymSearch(searchWord)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E2D9] rounded text-xs text-stone-900 focus:outline-hidden focus:border-[#1A1A1A] font-medium"
                  placeholder="e.g., interesting, try, good, bad..."
                  id="vocab_search_input"
                />
              </div>
              <button
                onClick={() => handleSynonymSearch(searchWord)}
                disabled={isSearching}
                className="px-4 py-2 bg-[#1A1A1A] hover:opacity-90 disabled:bg-stone-300 rounded text-[10px] font-bold text-white uppercase tracking-widest shrink-0 transition-opacity"
                id="vocab_search_btn"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Dissect"}
              </button>
            </div>

            {/* Presets buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 shrink-0">Common Lookups:</span>
              {COMMON_LOOKUPS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSearchWord(c);
                    handleSynonymSearch(c);
                  }}
                  className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold transition-colors ${
                    synonymResult?.word === c 
                      ? "bg-slate-100 border-stone-850 text-stone-950" 
                      : "bg-[#FDFCF8] border-[#E5E2D9] text-[#1A1A1A]/60 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Visual Cards */}
          {isSearching ? (
            <div className="p-8 border border-dashed border-[#E5E2D9] bg-[#FDFCF8] rounded-lg text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-900 animate-pulse">Consulting the laboratory thesaurus...</p>
            </div>
          ) : synonymResult ? (
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-widest font-bold opacity-45">Dissected Word:</span>
                <span className="font-serif italic text-lg font-bold border-b-2 border-indigo-200 pb-0.5 text-stone-900">"{synonymResult.word}"</span>
                {synonymResult.isMocked && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-[8px] font-bold uppercase text-amber-700 tracking-wider">
                    Local Core Dict
                  </span>
                )}
              </div>

              {/* Grid of Buckets */}
              <div className="grid grid-cols-2 gap-3" id="synonym_visual_buckets">
                {/* Bucket 1: Scholarly */}
                <div className="p-3.5 rounded bg-stone-50 border border-[#E5E2D9] space-y-1.5 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Scholarly Papers</span>
                  <div className="flex flex-col gap-1">
                    {synonymResult.synonyms.scholarly.map((s, idx) => (
                      <span key={idx} className="text-xs font-serif font-medium text-stone-850 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-stone-400 shrink-0" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bucket 2: Premium Editorial */}
                <div className="p-3.5 rounded bg-amber-50/25 border border-amber-100 space-y-1.5 shadow-2xs">
                  <span className="text-[9px] font-bold text-amber-900 uppercase tracking-widest block font-sans">Premium Editorial</span>
                  <div className="flex flex-col gap-1">
                    {synonymResult.synonyms.premium.map((s, idx) => (
                      <span key={idx} className="text-xs font-serif font-bold text-amber-950 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bucket 3: Active Verbs */}
                <div className="p-3.5 rounded bg-emerald-50/25 border border-emerald-100 space-y-1.5 shadow-2xs">
                  <span className="text-[9px] font-bold text-emerald-950 uppercase tracking-widest block font-sans">Active Vectors</span>
                  <div className="flex flex-col gap-1">
                    {synonymResult.synonyms.active.map((s, idx) => (
                      <span key={idx} className="text-xs font-serif font-medium text-emerald-950 flex items-center gap-1">
                        <ArrowLeftRight className="w-3 h-3 text-emerald-600 shrink-0" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bucket 4: Concise Brief */}
                <div className="p-3.5 rounded bg-indigo-50/25 border border-indigo-100 space-y-1.5 shadow-2xs">
                  <span className="text-[9px] font-bold text-indigo-950 uppercase tracking-widest block font-sans">Concise Briefs</span>
                  <div className="flex flex-col gap-1">
                    {synonymResult.synonyms.concise.map((s, idx) => (
                      <span key={idx} className="text-xs font-serif font-medium text-indigo-900 flex items-center gap-1 font-semibold">
                        <ThumbsUp className="w-3 h-3 text-indigo-600 shrink-0" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Premium Context Sentence usage */}
              <div className="p-4 border border-[#E5E2D9] bg-[#FDFCF8] rounded-lg space-y-1.5">
                <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 block">Editorial Laboratory Example Sentence</span>
                <p className="text-xs leading-relaxed text-stone-700 italic font-serif">
                  "{synonymResult.contextExample}"
                </p>
              </div>
            </div>
          ) : null}

        </section>

        {/* Right Side: Paragraph Vocab Upgrader Diagnostic System (Cols: 7) */}
        <section className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 block">Prose Vocab Upgrader Laboratory</span>
              <span className="text-[11px] leading-relaxed block text-stone-500">Scan your current working draft in the editor to extract overused elements.</span>
            </div>
            
            <button
              onClick={handleRunProseUpgrade}
              disabled={isDiagnosing || !editorText.trim()}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white rounded cursor-pointer transition-colors ${
                isDiagnosing || !editorText.trim()
                  ? "bg-[#1A1A1A]/40 cursor-not-allowed"
                  : "bg-indigo-700 hover:bg-indigo-800"
              }`}
            >
              {isDiagnosing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning draft...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan Active Draft</span>
                </>
              )}
            </button>
          </div>

          {/* Upgrader Diagnostic Results Box */}
          {isDiagnosing ? (
            <div className="p-12 text-center border border-dashed border-[#E5E2D9] rounded bg-white flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 animate-pulse">Running Lexicon Laboratory Diagnostics</h4>
                <p className="text-[11px] text-[#1A1A1A]/50">Checking vocabulary levels and searching for low-validity modifiers or verbs.</p>
              </div>
            </div>
          ) : upgradedWords.length > 0 ? (
            <div className="space-y-3.5" id="prose_upgrade_results">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-900">
                  🎉 Detected {upgradedWords.length} Optimization Opportunities
                </span>
                <span className="text-[9px] uppercase font-bold text-stone-400">Click to swap inline directly</span>
              </div>

              <div className="space-y-2.5">
                {upgradedWords.map((upg, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-white border border-[#E5E2D9] rounded hover:border-[#1A1A1A] hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[8px] font-bold text-indigo-700 uppercase tracking-widest shrink-0">
                          {upg.type}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">Suggestion #{idx + 1}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 font-serif text-sm">
                        <span className="line-through decoration-rose-300 text-stone-400 px-1 italic">"{upg.original}"</span>
                        <span className="text-stone-300">➔</span>
                        <span className="font-bold text-stone-900 bg-emerald-50 px-1 shadow-2xs rounded-xs font-sans text-xs flex items-center gap-1 text-emerald-800">
                          <Sparkles className="w-3 h-3 text-emerald-600 inline" /> {upg.corrected}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-stone-550 pt-0.5">
                        "{upg.explanation}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleApplyReplacementInDoc(upg.original, upg.corrected)}
                      className="px-3_5 py-1.5 bg-[#1A1A1A] hover:bg-stone-850 text-white text-[9px] font-bold uppercase tracking-widest rounded-xs flex items-center gap-1 max-w-max self-end sm:self-center shrink-0"
                    >
                      <span>Upgrade Word</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : diagnosticsRun ? (
            <div className="p-8 border border-dashed border-[#E5E2D9] rounded bg-[#FDFCF8] text-center flex flex-col items-center justify-center space-y-2.5">
              <span className="w-8 h-8 rounded-full border border-emerald-100 bg-emerald-50/50 flex items-center justify-center text-emerald-600 font-bold text-sm">✓</span>
              <div>
                <h4 className="text-xs font-bold font-serif italic text-stone-900">Vocabulary Score: Sublime</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed max-w-xs mt-1">
                  Our diagnostics checked the active draft in the editor. Your draft contains excellent, precise, high-status adjectives and verbs.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 border border-dashed border-[#E5E2D9] rounded bg-white text-center flex flex-col items-center justify-center space-y-3">
              <AlertCircle className="w-6 h-6 text-stone-400" />
              <div>
                <h4 className="text-xs font-bold text-stone-905 uppercase tracking-wider">Laboratories Standing By</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed max-w-xs mt-1 leading-snug">
                  Click <strong className="text-stone-800">"Scan Active Draft"</strong> to inspect your document editor, search for tired modifiers, and run diagnostic vocabulary tests.
                </p>
              </div>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
