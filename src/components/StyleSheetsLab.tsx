import { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Check, 
  Loader2, 
  ArrowLeftRight, 
  HelpCircle,
  AlertCircle
} from "lucide-react";

interface StyleSheetsLabProps {
  editorText: string;
  onApplyStyle: (newText: string) => void;
  triggerAlert: (msg: string, type?: "success" | "info" | "error") => void;
}

const STYLE_SHEETS_GUIDE = [
  {
    id: "ap",
    name: "AP Stylebook (Journalistic Modern)",
    focused: "Brevity, Objectivity, and Strict Layout Mechanics",
    description: "The publication-ready industry standard for journalists. Focuses on objective assertions, short energetic sentences, formal titles, and precise numeric mappings.",
    principles: [
      "Spell out numeric counters from one to nine; use raw figures for numbers 10 and above.",
      "Abbreviate common professional titles (Gov., Sen., Rep.) when preceding an exact proper name.",
      "Omit lazy conversational preambles (e.g. replace 'basically writing to say' with 'writing to propose').",
      "Reject passive coordinates and sentence bloat to support high speed-read velocity."
    ]
  },
  {
    id: "tech",
    name: "Silicon Valley Tech Copy (Sleek Product)",
    focused: "Dense, User-First Value and Active Performance Verbs",
    description: "Formulated specifically for landing pages, SaaS messaging, and developer manuals. Eradicates hyperbole and marketing fluff in favor of maximum verbal density.",
    principles: [
      "Reject low-credibility adverbial qualifiers ('honestly', 'literally', 'revolutionary', 'game-changing').",
      "Replace compound verbal structures with single, high-velocity active verbs (e.g. 'streamlines' instead of 'helps to easily manage').",
      "Omit passive helper clauses and needless filler prepositions ('in order to', 'at your earliest convenience').",
      "Translate features into human outcomes directly."
    ]
  },
  {
    id: "vintage",
    name: "Classic Vintage Narrative (Literary Editorial)",
    focused: "Luxurious Rhythmic Cadences and Sensory Textures",
    description: "Designed for expressive essays, brand storytellers, and deep-dive newsletters. Upgrades flat modern business-speak to sophisticated prose with classical coordinate structures.",
    principles: [
      "Welcome coordinate subordinate clauses and poetic sentence length variation.",
      "Substitute mechanical nouns ('workflows', 'efficiency', 'SaaS') with organic human equivalents.",
      "Deploy vivid sensory descriptors and elegant metaphors to capture reader attention.",
      "Emphasize prose color, vocabulary depth, and acoustic balance."
    ]
  }
];

export default function StyleSheetsLab({ editorText, onApplyStyle, triggerAlert }: StyleSheetsLabProps) {
  const [selectedStyleId, setSelectedStyleId] = useState<string>("ap");
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [transformedText, setTransformedText] = useState<string>("");
  const [auditReport, setAuditReport] = useState<string>("");
  const [isMocked, setIsMocked] = useState<boolean>(false);

  const activeStyle = STYLE_SHEETS_GUIDE.find(s => s.id === selectedStyleId) || STYLE_SHEETS_GUIDE[0];

  const handleAlignToStyleSheet = async () => {
    if (!editorText.trim()) {
      triggerAlert("Please enter or paste draft text in the main workspace first.", "error");
      return;
    }

    setIsApplying(true);
    setTransformedText("");
    setAuditReport("");
    setIsMocked(false);

    try {
      const response = await fetch("/api/style-sheets/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: editorText,
          styleId: selectedStyleId
        })
      });

      if (!response.ok) {
        throw new Error("Server stylesheet processor error");
      }

      const data = await response.json();
      setTransformedText(data.correctedText || "");
      setAuditReport(data.changesMade || "No major violations detected.");
      setIsMocked(!!data.isMocked);
      triggerAlert("Style sheet alignment successfully completed!", "success");
    } catch (e) {
      triggerAlert("Failed to complete AI style check.", "error");
    } finally {
      setIsApplying(false);
    }
  };

  const handleMergeToEditor = () => {
    if (!transformedText) return;
    onApplyStyle(transformedText);
    triggerAlert("Merged aligned style draft back into document!", "success");
  };

  return (
    <div className="w-full space-y-8" id="stylesheets_lab_panel">
      {/* Introduction Banner */}
      <div className="border border-[#E5E2D9] rounded-lg p-5 bg-stone-50/70 shadow-2xs">
        <h2 className="font-serif italic text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-700" />
          <span>Style Sheets Reference Lab</span>
        </h2>
        <p className="text-xs text-[#1A1A1A]/60 leading-relaxed mt-2 max-w-2xl">
          Elevate draft compliance instantly. Choose one of our three custom writing manuals. Our AI-editor automatically refines mechanics, syntactic weight, and coordinates to match style expectations and ensure polished formatting.
        </p>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left column: Style selectors */}
        <div className="xl:col-span-5 space-y-4">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 block">Select Target Style Manual</span>
          
          <div className="space-y-2.5">
            {STYLE_SHEETS_GUIDE.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => {
                  setSelectedStyleId(sheet.id);
                  setTransformedText("");
                  setAuditReport("");
                }}
                className={`w-full text-left p-4 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                  selectedStyleId === sheet.id 
                    ? "border-[#1A1A1A] bg-white shadow-xs ring-1 ring-[#1A1A1A]/10" 
                    : "border-[#E5E2D9] bg-[#FDFCF8] hover:bg-stone-50"
                }`}
                id={`style_option_${sheet.id}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-stone-900">{sheet.name}</span>
                  {selectedStyleId === sheet.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block shrink-0" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest leading-none">Focus: {sheet.focused}</span>
                <span className="text-[11px] leading-relaxed text-[#1A1A1A]/50 font-serif italic pt-0.5">{sheet.description}</span>
              </button>
            ))}
          </div>

          {/* Core manual principles */}
          <div className="p-4 rounded-lg bg-[#FDFCF8] border border-[#E5E2D9] space-y-3">
            <span className="text-[9px] uppercase tracking-widest font-bold text-indigo-900 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Checked Compliance Assertions:
            </span>
            <ul className="space-y-2 text-[11px] leading-relaxed text-stone-700">
              {activeStyle.principles.map((pr, pidx) => (
                <li key={pidx} className="flex gap-2">
                  <span className="text-indigo-600 font-bold shrink-0">✓</span>
                  <span>{pr}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column: Interactive Alignment Console */}
        <div className="xl:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Manual Alignment Panel</span>
            <button
              onClick={handleAlignToStyleSheet}
              disabled={isApplying || !editorText.trim()}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-white transition-all select-none ${
                isApplying || !editorText.trim()
                  ? "bg-[#1A1A1A]/40 cursor-not-allowed"
                  : "bg-indigo-700 hover:bg-indigo-800"
              }`}
              id="style_check_action_btn"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Aligning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Style: {activeStyle.id.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>

          {/* Split Screen Diff comparison */}
          <div className="border border-[#E5E2D9] bg-[#FDFCF8] rounded-xs overflow-hidden">
            {/* Headers */}
            <div className="bg-stone-50 border-b border-[#E5E2D9] px-4 py-2 flex items-center gap-1 justify-between">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A]/40">Interactive Comparator</span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-700 uppercase tracking-widest">
                Real-Time Sandbox
              </span>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E2D9] min-h-[190px]">
              {/* Left Sandbox (input snapshot) */}
              <div className="p-4 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/40">Current Document Draft</span>
                  <p className="text-xs font-serif leading-relaxed text-stone-600 line-clamp-6">
                    {editorText || "Editor is empty. Please load or write text."}
                  </p>
                </div>
                {!editorText.trim() && (
                  <p className="text-[10px] text-amber-800 bg-amber-50 rounded border border-amber-100 p-2 italic">
                    Load a preset in the Advisor Workspace first!
                  </p>
                )}
              </div>

              {/* Right Sandbox (transformed output) */}
              <div className="p-4 bg-white space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-indigo-800">Style Sheets Reformatted Output</span>
                  {isApplying ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      <span className="text-[9px] font-bold text-indigo-900 uppercase tracking-wider">Reformulating components...</span>
                    </div>
                  ) : transformedText ? (
                    <p className="text-xs font-serif leading-relaxed text-stone-900">
                      {transformedText}
                    </p>
                  ) : (
                    <p className="text-[11px] italic text-stone-400 py-6">
                      Click the alignment button above to generate a perfectly formatted copy of your draft.
                    </p>
                  )}
                </div>

                {transformedText && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleMergeToEditor}
                      className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-xs flex items-center gap-1 transition-colors"
                      id="merge_style_btn"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Merge Into Document</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit report changes */}
          {transformedText && (
            <div className="p-4 border border-indigo-100 bg-indigo-50/40 rounded-lg space-y-1.5 transition-all">
              <span className="text-[9px] tracking-widest font-bold uppercase text-indigo-900 flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                <span>Editorial Changes Synopsis:</span>
              </span>
              <p className="text-[11px] leading-relaxed text-indigo-950 font-serif italic">
                "{auditReport}"
              </p>
              {isMocked && (
                <div className="pt-1.5 flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold text-amber-700">
                  <AlertCircle className="w-3 h-3 text-amber-700" />
                  <span>Enacted local model alignment</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
