import { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Plus, 
  History, 
  AlertCircle, 
  ArrowLeftRight, 
  Loader2,
  FileText,
  RotateCcw,
  Check,
  Languages,
  BookOpen,
  LayoutGrid
} from "lucide-react";
import { AnalysisResult, SavedHistoryItem } from "./types";
import ScoreDashboard from "./components/ScoreDashboard";
import ToneCard from "./components/ToneCard";
import StyleSuggestionsView from "./components/StyleSuggestionsView";
import HistoryList from "./components/HistoryList";
import StyleSheetsLab from "./components/StyleSheetsLab";
import VocabularyLabs from "./components/VocabularyLabs";

const WRITING_PRESETS = [
  {
    name: "Verbose Business Email",
    title: "Project Alpha Alignment Proposal",
    text: "Basically, I am writing this email to say that we should really try to meet up tomorrow in order to talk about the proposal. It is super important that we are on the same page because things have been happening really fast recently. Some people are saying the deadline might be changed which would be incredibly problematic for us."
  },
  {
    name: "Unfocused Essay Draft",
    title: "Observations on Modern Digitization",
    text: "There is no doubt in my mind that the internet has had a huge effect on how people read books. If you think about it, most people don't go to libraries anymore. They just look up stuff on Google. It is definitely true that this makes things easier but at the same time, people's attention spans are getting shorter and shorter, which is extremely bad."
  },
  {
    name: "Cluttered Product Pitch",
    title: "SaaS Launch Announcement Pitch",
    text: "Our brand new software is honestly the absolute best solution for helping users to easily manage their daily workflow issues. It is packed full of incredibly unique features that will literally change the way you do work forever. If you are interested in seeing a demo, please don’t hesitate to contact us at your earliest convenience."
  }
];

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<"workspace" | "stylesheets" | "vocabulary">("workspace");
  const [text, setText] = useState<string>(
    "Writing in the age of intelligence requires a unique perspective that transcends mere grammar. It's about resonance and clarity. Most people write things that are way too long and lack a specific point."
  );
  const [draftTitle, setDraftTitle] = useState<string>("The Future of Digital Prose");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedHistoryItem[]>([]);
  const [activeRefinementTab, setActiveRefinementTab] = useState<"all" | "corrections" | "style" | "tone" | "score">("all");
  const [editorAlert, setEditorAlert] = useState<{message: string; type: "success" | "info" | "error"} | null>(null);

  // Initialize history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lexica_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  // Save history helper
  const saveHistory = (newHistory: SavedHistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("lexica_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  };

  // Live Metrics
  const metrics = useMemo(() => {
    const trimmed = text.trim();
    const wordCount = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    const charCount = text.length;
    // Average reading speed: ~200 words per minute
    const readingTimeSec = Math.round((wordCount / 200) * 60);
    const readingTime = readingTimeSec < 60 
      ? `${readingTimeSec}s` 
      : `${Math.floor(readingTimeSec / 60)}m ${readingTimeSec % 60}s`;

    return { wordCount, charCount, readingTime };
  }, [text]);

  const triggerAlert = (message: string, type: "success" | "info" | "error" = "success") => {
    setEditorAlert({ message, type });
    setTimeout(() => {
      setEditorAlert(null);
    }, 4000);
  };

  const handleClearEditor = () => {
    setText("");
    setDraftTitle("Untitled Draft");
    setResult(null);
    setError(null);
    triggerAlert("Editor cleared", "info");
  };

  const handleApplyPreset = (preset: typeof WRITING_PRESETS[0]) => {
    setText(preset.text);
    setDraftTitle(preset.title);
    setResult(null);
    setError(null);
    triggerAlert(`Loaded preset: "${preset.name}"`, "success");
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please input some text before initiating analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server returned error status ${response.status}`);
      }

      const payload: AnalysisResult = await response.json();
      setResult(payload);

      // Save to localStorage history
      const historyItem: SavedHistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        timestamp: new Date().toISOString(),
        originalText: text,
        result: payload,
      };

      const updatedHistory = [historyItem, ...history.filter(h => h.originalText !== text)].slice(0, 50);
      saveHistory(updatedHistory);
      triggerAlert("AI analysis complete!", "success");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong while correcting the text.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistory = (item: SavedHistoryItem) => {
    setText(item.originalText);
    setDraftTitle(item.originalText.slice(0, 30) + "...");
    setResult(item.result);
    setError(null);
    triggerAlert("Draft and report restored from history", "info");
  };

  const handleDeleteHistoryItem = (id: string) => {
    const next = history.filter((item) => item.id !== id);
    saveHistory(next);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your entire analysis history?")) {
      saveHistory([]);
      triggerAlert("History cleared", "info");
    }
  };

  const handleApplyToneAdjustment = (rewrittenText: string) => {
    setText(rewrittenText);
    triggerAlert("Applied tone adaptation directly to the editor Document!", "success");
  };

  // Replaces a single targeted grammar/spelling error in the text editor
  const handleApplyCorrection = (original: string, corrected: string) => {
    // Escape regex safety, replace the exact match
    try {
      const escapedOriginal = original.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedOriginal}\\b`, "i");
      
      if (regex.test(text)) {
        setText(text.replace(regex, corrected));
        triggerAlert(`Replaced "${original}" with "${corrected}"`, "success");
      } else {
        // Fallback simple replacement if boundaries don't fit perfectly
        setText(text.replace(original, corrected));
        triggerAlert(`Replaced "${original}" with "${corrected}"`, "success");
      }

      // Filter resolved correction out of active result display dynamically for premium UX
      if (result) {
        setResult({
          ...result,
          corrections: result.corrections.filter(c => c.original !== original)
        });
      }
    } catch (e) {
      setText(text.replace(original, corrected));
      triggerAlert(`Replaced "${original}"`, "success");
    }
  };

  // Copy standard corrected text directly
  const handleCopyCorrected = () => {
    if (result?.correctedText) {
      navigator.clipboard.writeText(result.correctedText);
      triggerAlert("Fully corrected text copied!", "success");
    }
  };

  // Set the editor text to the fully corrected version
  const handleApplyAllChanges = () => {
    if (result?.correctedText) {
      setText(result.correctedText);
      // clear corrections list
      setResult({
        ...result,
        corrections: []
      });
      triggerAlert("All automated grammar fixes applied!", "success");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto h-screen flex flex-col bg-[#FDFCF8] text-[#1A1A1A] overflow-hidden antialiased">
      {/* Editorial Header */}
      <header className="h-16 px-6 sm:px-10 shrink-0 flex items-center justify-between border-b border-[#E5E2D9] bg-[#FDFCF8]">
        <div className="flex items-center gap-6 sm:gap-10">
          <span className="font-serif italic text-2xl tracking-tighter font-bold select-none cursor-default">
            Lexica AI
          </span>
          <nav className="flex gap-4 sm:gap-6 text-xs uppercase tracking-widest font-bold">
            <button
              onClick={() => setActiveMainTab("workspace")}
              className={`pb-1 transition-all ${
                activeMainTab === "workspace"
                  ? "text-[#1A1A1A] border-b-2 border-[#1A1A1A] opacity-100"
                  : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
              }`}
            >
              Advisor Workspace
            </button>
            <button
              onClick={() => setActiveMainTab("stylesheets")}
              className={`pb-1 transition-all ${
                activeMainTab === "stylesheets"
                  ? "text-[#1A1A1A] border-b-2 border-[#1A1A1A] opacity-100"
                  : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
              }`}
            >
              Style Sheets
            </button>
            <button
              onClick={() => setActiveMainTab("vocabulary")}
              className={`pb-1 transition-all ${
                activeMainTab === "vocabulary"
                  ? "text-[#1A1A1A] border-b-2 border-[#1A1A1A] opacity-100"
                  : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
              }`}
            >
              Vocabulary Labs
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#E5E2D9]/40 border border-[#E5E2D9] px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-widest font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            <span>Gemini 3.5 Engine</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {activeMainTab === "workspace" ? (
          <>
            {/* Left Hand: Editing Studio */}
            <section className="w-full lg:w-[65%] p-6 sm:p-10 flex flex-col border-r border-[#E5E2D9] bg-white overflow-y-auto">
          
          {/* Preset Buttons Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FDFCF8] border border-[#E5E2D9] p-3 rounded-lg">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60 flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Select Writing Presets:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {WRITING_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-gray-150 border border-[#E5E2D9] rounded transition-all cursor-pointer text-gray-700 hover:text-black"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Stats */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2.5 pb-2 border-b border-[#F0EEE9]">
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="font-serif text-2xl sm:text-3xl font-medium outline-hidden border-none w-full bg-transparent text-[#1A1A1A] placeholder-[#1A1A1A]/30 focus:placeholder-transparent"
              placeholder="Give your writing a title..."
              id="draft_title_input"
            />
            {isAnalyzing && (
              <span className="text-[10px] uppercase tracking-wider text-indigo-600 animate-pulse flex items-center gap-1 whitespace-nowrap font-bold shrink-0">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Running AI diagnostic...</span>
              </span>
            )}
          </div>

          {/* Interactive Textarea area with absolute overlays or notifications */}
          <div className="flex-1 min-h-[280px] flex flex-col relative">
            
            {editorAlert && (
              <div 
                className={`absolute top-2 right-2 max-w-sm px-3.5 py-2 z-10 rounded-lg text-xs font-semibold shadow-md transition-all duration-300 flex items-center gap-2 border ${
                  editorAlert.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                    : editorAlert.type === "error"
                    ? "bg-rose-50 text-rose-800 border-rose-100"
                    : "bg-indigo-50 text-indigo-800 border-indigo-100"
                }`}
                id="alert_notification"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{editorAlert.message}</span>
              </div>
            )}

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full flex-1 font-serif text-lg leading-relaxed text-[#2C2C2C] focus:outline-hidden resize-none bg-transparent"
              placeholder="Unleash your draft ideas here. Paste clumsy notes, loose emails or incomplete paragraphs..."
              id="main_writing_editor"
            />
          </div>

          {/* Error panel */}
          {error && (
            <div className="my-4 p-4 rounded-xl border border-rose-100 bg-rose-50/70 text-rose-800 text-xs leading-relaxed flex gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold">Analysis Bottleneck:</span> {error}
                <p className="mt-1 text-[10px] opacity-80">
                  Please confirm that the GEMINI_API_KEY secret parameters are configured properly in Settings &gt; Secrets, and check your network environment.
                </p>
              </div>
            </div>
          )}

          {/* Workspace Controls */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#F0EEE9] pt-5">
            
            {/* Meta Word count */}
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/50">
              <span id="meta_word_count">Words: {metrics.wordCount}</span>
              <span id="meta_reading_time">Est. Read: {metrics.readingTime}</span>
            </div>

            {/* Action group */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearEditor}
                className="px-4 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest border border-[#E5E2D9] text-[#1A1A1A] hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                title="Clear content"
                id="word_clear_btn"
              >
                Clear
              </button>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
                className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest text-white shadow-xs select-none transition-all ${
                  isAnalyzing || !text.trim()
                    ? "bg-[#1A1A1A]/40 cursor-not-allowed"
                    : "bg-[#1A1A1A] hover:opacity-90 active:scale-[0.98]"
                }`}
                id="word_analyze_btn"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze Prose</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Right Hand: AI Refinement Board */}
        <aside className="w-full lg:w-[35%] bg-[#FDFCF8] flex flex-col h-full overflow-hidden">
          
          {/* Tab Selection */}
          <div className="flex border-b border-[#E5E2D9] bg-[#FDFCF8]/90 overflow-x-auto select-none shrink-0 scrollbar-none">
            <button
              onClick={() => setActiveRefinementTab("all")}
              className={`px-4 sm:px-5 py-3.5 text-[10px] uppercase font-bold tracking-widest border-b-2 transition-all whitespace-nowrap ${
                activeRefinementTab === "all" ? "border-[#1A1A1A] text-[#1A1A1A]" : "border-transparent text-[#1A1A1A]/40"
              }`}
            >
              All Report
            </button>
            <button
              onClick={() => setActiveRefinementTab("corrections")}
              className={`px-4 sm:px-5 py-3.5 text-[10px] uppercase font-bold tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeRefinementTab === "corrections" ? "border-[#1A1A1A] text-[#1A1A1A]" : "border-transparent text-[#1A1A1A]/40"
              }`}
            >
              Errors
              {result && result.corrections.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-[9px]">
                  {result.corrections.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveRefinementTab("style")}
              className={`px-4 sm:px-5 py-3.5 text-[10px] uppercase font-bold tracking-widest border-b-2 transition-all whitespace-nowrap ${
                activeRefinementTab === "style" ? "border-[#1A1A1A] text-[#1A1A1A]" : "border-transparent text-[#1A1A1A]/40"
              }`}
            >
              Style
            </button>
            <button
              onClick={() => setActiveRefinementTab("tone")}
              className={`px-4 sm:px-5 py-3.5 text-[10px] uppercase font-bold tracking-widest border-b-2 transition-all whitespace-nowrap ${
                activeRefinementTab === "tone" ? "border-[#1A1A1A] text-[#1A1A1A]" : "border-transparent text-[#1A1A1A]/40"
              }`}
            >
              Tone
            </button>
            <button
              onClick={() => setActiveRefinementTab("score")}
              className={`px-4 sm:px-5 py-3.5 text-[10px] uppercase font-bold tracking-widest border-b-2 transition-all whitespace-nowrap ${
                activeRefinementTab === "score" ? "border-[#1A1A1A] text-[#1A1A1A]" : "border-transparent text-[#1A1A1A]/40"
              }`}
            >
              Score
            </button>
          </div>

          {/* Refinement scroll container */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
            
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-full border border-[#E5E2D9] bg-white flex items-center justify-center">
                  <Languages className="w-6 h-6 text-[#1A1A1A]/40" />
                </div>
                <div>
                  <h3 className="font-serif italic text-lg font-bold">Awaiting Input Draft</h3>
                  <p className="text-xs text-[#1A1A1A]/50 max-w-xs mt-1.5 leading-relaxed">
                    Type or load a preset, then tap <strong className="text-black font-semibold">“Analyze Prose”</strong> to review advanced stylistic metrics, spelling, and tone adjustments.
                  </p>
                </div>

                {/* Inline History snapshot */}
                <div className="w-full pt-6 border-t border-[#E5E2D9] max-w-xs">
                  <HistoryList 
                    history={history} 
                    onSelectHistory={handleSelectHistory} 
                    onDeleteHistory={handleDeleteHistoryItem} 
                    onClearHistory={handleClearHistory} 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-8">

                {result.isMocked && (
                  <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-900 text-xs leading-relaxed space-y-1.5 shadow-2xs">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950 uppercase tracking-widest text-[10px]">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      Mock Advisor Active
                    </p>
                    <p className="opacity-90">
                      The active Gemini API free-tier quota is exhausted, so we've simulation-mode activated the advisor. All corrective actions, style suggestions, dynamic scores, and tone presets remain fully functional!
                    </p>
                  </div>
                )}

                {/* Score panel (Visible on All or Score tabs) */}
                {(activeRefinementTab === "all" || activeRefinementTab === "score") && (
                  <div className="space-y-4 border-b border-[#E5E2D9] pb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">AI Analysis Report</span>
                      <button 
                        onClick={() => setResult(null)} 
                        className="text-[10px] uppercase tracking-wider font-semibold opacity-40 hover:opacity-100 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset View
                      </button>
                    </div>
                    <ScoreDashboard score={result.score} />
                  </div>
                )}

                {/* Corrections panel (Visible on All or Corrections tabs) */}
                {(activeRefinementTab === "all" || activeRefinementTab === "corrections") && (
                  <div className="space-y-4 border-b border-[#E5E2D9] pb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-40">Hard Corrections</h3>
                      {result.corrections.length > 0 && (
                        <button
                          onClick={handleApplyAllChanges}
                          className="text-[10px] tracking-wider font-bold text-indigo-600 hover:text-indigo-800 underline uppercase"
                        >
                          Apply All Corrections ({result.corrections.length})
                        </button>
                      )}
                    </div>

                    {result.corrections.length === 0 ? (
                      <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/50 flex gap-3">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800">Clean Bill of Health!</p>
                          <p className="text-[11px] text-emerald-700/80 leading-relaxed mt-0.5">
                            Spelling, basic grammar parameters, and punctuation markers look spotless.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {result.corrections.map((corr, cidx) => (
                          <div 
                            key={cidx} 
                            className="p-4 bg-white border border-[#E5E2D9] shadow-2xs hover:border-[#1A1A1A] transition-colors rounded-xs space-y-3"
                          >
                            <div className="flex justify-between items-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                corr.type === "spelling" 
                                  ? "bg-rose-50 text-rose-700 border border-rose-100" 
                                  : corr.type === "grammar"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                  : "bg-blue-50 text-blue-700 border border-blue-100"
                              }`}>
                                {corr.type}
                              </span>
                              <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/40">Diagnostic #{cidx + 1}</span>
                            </div>

                            <p className="text-sm font-medium leading-relaxed leading-snug">
                              <span className="line-through text-rose-500 bg-rose-50/40 px-1 decoration-rose-300">
                                {corr.original}
                              </span>
                              <span className="mx-2 text-[#1A1A1A]/30">➔</span>
                              <span className="bg-emerald-50 text-emerald-800 px-1 font-semibold">
                                {corr.corrected}
                              </span>
                            </p>

                            <p className="text-xs leading-relaxed text-gray-500 italic">
                              "{corr.explanation}"
                            </p>

                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => handleApplyCorrection(corr.original, corr.corrected)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[#1A1A1A] hover:opacity-95 text-white text-[9px] font-bold uppercase tracking-wider rounded-xs"
                              >
                                <Check className="w-3 h-3" />
                                <span>Apply Change</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tone adjustments panel (Visible on All or Tone tabs) */}
                {(activeRefinementTab === "all" || activeRefinementTab === "tone") && (
                  <div className="space-y-4 border-b border-[#E5E2D9] pb-6">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 block">Tone Modulation Lab</span>
                    <ToneCard 
                      adjustments={result.toneAdjustments} 
                      onApplyTone={handleApplyToneAdjustment} 
                    />
                  </div>
                )}

                {/* Style Suggestions view panel (Visible on All or Style tabs) */}
                {(activeRefinementTab === "all" || activeRefinementTab === "style") && (
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 block">Aesthetic Recommendations</span>
                    <StyleSuggestionsView suggestions={result.styleSuggestions} />
                  </div>
                )}

                {/* History widget shown at the bottom of report view representatively */}
                {activeRefinementTab === "all" && history.length > 1 && (
                  <div className="pt-8 border-t border-[#E5E2D9]">
                    <HistoryList 
                      history={history} 
                      onSelectHistory={handleSelectHistory} 
                      onDeleteHistory={handleDeleteHistoryItem} 
                      onClearHistory={handleClearHistory} 
                    />
                  </div>
                )}

              </div>
            )}

          </div>
        </aside>
          </>
        ) : activeMainTab === "stylesheets" ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#FDFCF8]">
            <StyleSheetsLab 
              editorText={text}
              onApplyStyle={(newText) => {
                setText(newText);
              }}
              triggerAlert={triggerAlert}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#FDFCF8]">
            <VocabularyLabs 
              editorText={text}
              onApplyUpgrade={(orig, corrected) => handleApplyCorrection(orig, corrected)}
              triggerAlert={triggerAlert}
            />
          </div>
        )}

      </main>
    </div>
  );
}
