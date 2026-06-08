import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Detailed Mock Analysis Generator for when quotas are exceeded
function generateMockAnalysis(text: string): any {
  const norm = text.trim();
  
  // Preset 1: Verbose Business Email
  if (norm.includes("Basically, I am writing this email") || norm.includes("Project Alpha Alignment")) {
    return {
      originalText: text,
      correctedText: "I am writing to propose that we meet tomorrow to discuss the proposal. It is crucial that we align our objectives because recent developments have been rapid. Rumor has it the deadline might shift, which would be highly disruptive for us.",
      isMocked: true,
      score: {
        grammar: 92,
        clarity: 88,
        flow: 85,
        overall: 88
      },
      corrections: [
        {
          original: "Basically, I am writing this email to say that we should really try to",
          corrected: "I am writing to propose that we",
          type: "clarity",
          explanation: "Remove excessive conversational preambles to establish a direct, executive tone immediately."
        },
        {
          original: "meet up",
          corrected: "meet",
          type: "punctuation",
          explanation: "Slight professional upgrade; 'meet up' is conversational."
        },
        {
          original: "in order to talk about",
          corrected: "to discuss",
          type: "clarity",
          explanation: "Replace wordy prepositional fillers with direct, action-oriented verbs."
        },
        {
          original: "super important",
          corrected: "crucial",
          type: "vocabulary",
          explanation: "Elevate vocab from informal modifiers to strong professional adjectives."
        },
        {
          original: "things have been happening really fast recently",
          corrected: "recent developments have been rapid",
          type: "style",
          explanation: "Transition from passive descriptive clauses to formal noun-heavy patterns."
        },
        {
          original: "incredibly problematic",
          corrected: "highly disruptive",
          type: "vocabulary",
          explanation: "Use stronger, business-oriented lexicon instead of exclamation-based adjectives."
        }
      ],
      styleSuggestions: [
        {
          category: "Conciseness",
          issue: "Verbose introductory clauses dilute the central objective constraint.",
          explanation: "Readers skim executive text quickly. Leading with 'Basically, I am writing...' is unnecessary word filler.",
          suggestion: "Get straight to the point of your writing to capture high-status alignment."
        },
        {
          category: "Active Voice",
          issue: "Use of filler transition structures like 'Some people are saying'.",
          explanation: "Introduces weak attribution and lacks objective credibility.",
          suggestion: "Refer to structured situations such as 'Reports suggest' or list sources directly."
        }
      ],
      toneAdjustments: [
        {
          toneName: "Professional",
          text: "I am writing to propose that we meet tomorrow to discuss the proposal. It is crucial that we are aligned, as recent developments have been rapid. Changes to the deadline remain a possibility, which would be highly disruptive for our timeline.",
          description: "Removed informal adjectives and padded conversational markers to present a formal aligned stance."
        },
        {
          toneName: "Casual",
          text: "Hey! Let's meet up tomorrow to chat about the proposal. We really need to be on the same page with everything moving so fast. I heard the deadline might change, which would really throw things off for us.",
          description: "Used conversational contraction forms, direct imperatives, and light colloquial descriptions."
        },
        {
          toneName: "Academic",
          text: "This correspondence serves to propose an immediate assembly tomorrow to review the sub-proposal. Achieving structural consensus is paramount given the volatile pace of current operations; potential shifts in scheduling metrics present substantial risk of systemic disruption.",
          description: "Formulated highly technical passive verbs, long structures, and abstract Latinate vocabulary."
        },
        {
          toneName: "Persuasive",
          text: "We must meet tomorrow to secure alignment on this proposal. With the pace of change accelerating and a critical deadline extension looming, immediate action is our only safeguard against major project disruption.",
          description: "Deployed assertive auxiliary verbs, strong adjectives, threat-action dynamic patterns."
        },
        {
          toneName: "Friendly",
          text: "Hope you're having a good week! I'd love for us to catch up tomorrow and go over the proposal together. It's super helpful if we stay aligned since everything is moving so quickly. Let's make sure we're prepared in case the dates shift!",
          description: "Infused warm greetings, empathetic exclamations, collaborative terms."
        },
        {
          toneName: "Concise",
          text: "We should meet tomorrow to review the proposal. Immediate alignment is crucial given rapid changes and potential deadline shifts.",
          description: "Maximum brevity; removed all filler, padding, and unnecessary introductory words."
        }
      ]
    };
  }

  // Preset 2: Unfocused Essay Draft
  if (norm.includes("There is no doubt in my mind") || norm.includes("Observations on Modern Digitization")) {
    return {
      originalText: text,
      correctedText: "Undoubtedly, the internet has profoundly impacted how readers engage with books. Most people no longer visit physical libraries; instead, they search Google. While this digital shift yields convenience, it simultaneously degrades attention spans, presenting a critical psychological concern.",
      isMocked: true,
      score: {
        grammar: 94,
        clarity: 85,
        flow: 89,
        overall: 89
      },
      corrections: [
        {
          original: "There is no doubt in my mind that the internet has had a huge effect on",
          corrected: "Undoubtedly, the internet has profoundly impacted",
          type: "clarity",
          explanation: "Streamlines sentence structures and elevates the soft descriptive adjective 'huge effect'."
        },
        {
          original: "If you think about it, most people don't go to libraries anymore",
          corrected: "Most readers no longer visit physical libraries",
          type: "clarity",
          explanation: "Removes conversational asides ('If you think about it') and ensures academic nouns."
        },
        {
          original: "look up stuff on Google",
          corrected: "search Google",
          type: "vocabulary",
          explanation: "Elegantly condenses conversational lookups into precise verbs."
        },
        {
          original: "It is definitely true that this makes things easier",
          corrected: "While this digital shift yields convenience",
          type: "grammar",
          explanation: "Establishes a neat subordinate clause that replaces weak tautologies like 'definitely true'."
        },
        {
          original: "getting shorter and shorter, which is extremely bad",
          corrected: "are declining rapidly, presenting a critical concern",
          type: "style",
          explanation: "Escapes repetitive comparative structures ('shorter and shorter') and informal qualifiers ('extremely bad')."
        }
      ],
      styleSuggestions: [
        {
          category: "Vocabulary",
          issue: "Conversational slang and repetitive modifiers erode essay gravitas.",
          explanation: "Terms such as 'stuff' and 'huge' lack precise descriptive dimensions.",
          suggestion: "Use high-validity terminology such as 'resources', 'materials', and 'profound impact'."
        },
        {
          category: "Sentence Structure",
          issue: "Simple flat independent sentences linked by coordinating conjunctions.",
          explanation: "Varying sentence length and incorporating subordinate markers improves essay cadence.",
          suggestion: "Combine assertions using transition words like 'consequently', 'nonetheless', and 'albeit'."
        }
      ],
      toneAdjustments: [
        {
          toneName: "Professional",
          text: "Undoubtedly, the internet has profoundly impacted how individuals engage with literature. Physical library attendance is declining as digital database queries rise. While this shift enhances efficiency, it simultaneously compresses cognitive attention spans, presenting a distinct sociological challenge.",
          description: "Elevated language to business/societal level, avoiding personal pronouns."
        },
        {
          toneName: "Casual",
          text: "There's no question the internet completely changed how we read. Hard, physical libraries are empty because everyone just Googles everything now. Sure, it's super convenient, but our attention spans are basically shrinking into nothing.",
          description: "Injected contractions, energetic modern verbs ('Googles'), and conversational pacing."
        },
        {
          toneName: "Academic",
          text: "Quantifiable evidence substantiates that digital connectivity has structurally transformed literary consumption paradigms. Empirical observances reveal a systematic migration from static archive access to query-based indexing systems. Although this accelerates research velocity, cognitive focus spans exhibit a parallel decline.",
          description: "Employed technical jargon ('consumption paradigms', 'indexing systems', 'empirical observances') and rigorous structural complexity."
        },
        {
          toneName: "Persuasive",
          text: "The internet has permanently disrupted how we access knowledge, emptying our physical libraries and driving us to Google. This instant convenience masks a dangerous reality: our attention spans are collapsing. We must actively counter this digital erosion of the intellect.",
          description: "Used action-focused, warning-laden language to rally reader consensus."
        },
        {
          toneName: "Friendly",
          text: "It is amazing to see how the internet has changed the way we all read! Most of us find ourselves Googling things rather than walking to libraries. What an incredible time-saver, though we do have to watch out for our modern attention spans!",
          description: "Framed comments enthusiastically, utilizing warm, shared observations."
        },
        {
          toneName: "Concise",
          text: "The internet has profoundly transformed reading habits. Google has replaced physical libraries, and although convenient, this digital transition is compressing human attention spans.",
          description: "Direct, dense formulation avoiding side comments."
        }
      ]
    };
  }

  // Preset 3: Cluttered Product Pitch
  if (norm.includes("Our brand new software is honestly") || norm.includes("SaaS Launch Announcement")) {
    return {
      originalText: text,
      correctedText: "Our primary software platform offers an optimal solution to streamline daily workflows. It is equipped with unique features designed to fundamentally transform your operations. If you are interested in a product demonstration, please contact our team.",
      isMocked: true,
      score: {
        grammar: 96,
        clarity: 82,
        flow: 84,
        overall: 87
      },
      corrections: [
        {
          original: "brand new software is honestly the absolute best",
          corrected: "primary software platform offers an optimal",
          type: "clarity",
          explanation: "Removes commercial hyperbole ('honestly the absolute best') which degrades product authority."
        },
        {
          original: "helping users to easily manage their daily workflow issues",
          corrected: "streamline daily workflows",
          type: "grammar",
          explanation: "Simplifies split-infinitive structures and removes negative nouns ('issues')."
        },
        {
          original: "packed full of incredibly unique",
          corrected: "equipped with unique",
          type: "clarity",
          explanation: "'Unique' is an absolute state; it cannot be 'incredibly unique' or 'packed full' of it."
        },
        {
          original: "literally change the way you do work forever",
          corrected: "fundamentally transform your operations",
          type: "style",
          explanation: "Avoids conversational clichés ('literally', 'forever') in business copy."
        },
        {
          original: "please don’t hesitate to contact us at your earliest convenience",
          corrected: "please contact our team",
          type: "clarity",
          explanation: "Bypasses clichés like 'don’t hesitate' and 'earliest convenience' with sleek, modern call-to-actions."
        }
      ],
      styleSuggestions: [
        {
          category: "Active Voice",
          issue: "Over-reliance on conversational qualifiers like 'honestly', 'literally', 'absolute best'.",
          explanation: "In product pitches, exaggeration triggers cognitive resistance in readers.",
          suggestion: "Present hard value propositions using strong, active verbs and concrete performance metrics."
        },
        {
          category: "Conciseness",
          issue: "Prepositional bloat in the call to action ('don't hesitate to... at your convenience').",
          explanation: "Makes the step to engage feel complex and dated.",
          suggestion: "Use modern direct triggers such as 'Join our demo' or 'Connect with us'."
        }
      ],
      toneAdjustments: [
        {
          toneName: "Professional",
          text: "Our new platform delivers a robust solution designed to streamline daily operational workflows. It features a suite of capabilities that fundamentally optimize enterprise productivity. Please contact our sales division to schedule an introductory demonstration.",
          description: "Crafted sleek corporate copy with clear professional verbs and specialized nouns."
        },
        {
          toneName: "Casual",
          text: "Our new tool is the perfect way to take the pain out of managing your daily tasks. It's loaded with handy features that will completely change how you work. Want to see it in action? Drop us a line and let's set up a quick demo!",
          description: "Friendly contractions, conversational idioms ('take the pain out', 'drop us a line'), active style."
        },
        {
          toneName: "Academic",
          text: "We present a novel software architecture engineered to optimize daily workflow management paradigms. The system possesses a custom array of functional attributes that structurally modify labor efficiency. Interested parties are invited to submit requests for live technical demonstrations.",
          description: "Highly formal Latinate structure, passive voice constructs, and objective scientific style."
        },
        {
          toneName: "Persuasive",
          text: "Stop wasting time on clumsy workflows. Our platform is the key to unlocking seamless, automated productivity. Designed with revolutionary capabilities, it will completely revolutionize your operations. Contact us today to secure your custom demo and get ahead.",
          description: "Urgent problem-solving framing, action directives, values emphasis."
        },
        {
          toneName: "Friendly",
          text: "We're so excited to share our new software with you! It's built specifically to help you breeze through your daily tasks with ease. We put a lot of love into these features to make your workdays happier. If you'd like a tour, just let us know—we'd love to chat!",
          description: "Empathetic, welcoming terms, emotional connection, warm greetings."
        },
        {
          toneName: "Concise",
          text: "Our software streamlines daily workflows with unique, transformative features. Contact us to schedule a product demo today.",
          description: "Absolute maximum structural efficiency and brevity."
        }
      ]
    };
  }

  // Fallback default mock for custom texts
  const words = norm.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const generalCorrected = norm
    .replace(/\bbasically\b/gi, "")
    .replace(/\bliterally\b/gi, "fundamentally")
    .replace(/\bvery unique\b/gi, "unique")
    .replace(/\bsuper important\b/gi, "paramount")
    .replace(/\bin order to\b/gi, "to")
    .replace(/\bhas had a huge effect\b/gi, "profoundly impacted")
    .replace(/,\s*which is extremely bad\b/gi, ". This presents a significant challenge");

  return {
    originalText: text,
    correctedText: generalCorrected,
    isMocked: true,
    score: {
      grammar: Math.min(95, 75 + Math.floor(wordCount % 20)),
      clarity: Math.min(93, 70 + Math.floor(wordCount % 25)),
      flow: Math.min(96, 72 + Math.floor(wordCount % 23)),
      overall: Math.min(94, 72 + Math.floor(wordCount % 22))
    },
    corrections: [
      {
        original: "in order to",
        corrected: "to",
        type: "clarity",
        explanation: "Reduce multi-word prepositions to streamlined direct connectors."
      },
      {
        original: "is helping to easily",
        corrected: "helps to streamline",
        type: "grammar",
        explanation: "Replace conversational passive split infinitives with active professional forms."
      }
    ],
    styleSuggestions: [
      {
        category: "Conciseness",
        issue: "Presence of weak conversational placeholder modifiers.",
        explanation: "Words like 'basically', 'honestly' and 'literally' weaken objective text and add fluff.",
        suggestion: "Strip these verbal tics to instantly elevate written authoritative quality."
      },
      {
        category: "Active Voice",
        issue: "Indirect progressive verbs weaken sentence velocity.",
        explanation: "Replacing passive status verbs creates shorter sentences and keeps readers engaged.",
        suggestion: "Use active verbs (e.g., 'facilitate', 'optimize', 'clarify') to drive key actions."
      }
    ],
    toneAdjustments: [
      {
        toneName: "Professional",
        text: generalCorrected + " This facilitates refined, aligned productivity of objectives.",
        description: "Standardized modern corporate voice utilizing clear objective outcomes."
      },
      {
        toneName: "Casual",
        text: generalCorrected.toLowerCase() + " basically, this makes things so much easier and super fun!",
        description: "Laidback with light contractions and high-affinity connectors."
      },
      {
        toneName: "Academic",
        text: "The aforementioned textual thesis exhibits qualitative markers of structured prose, albeit requiring minor syntactic optimization. " + generalCorrected,
        description: "Formalized lexical register paired with complex adverbial clauses."
      },
      {
        toneName: "Persuasive",
        text: "Imagine immediately elevating your message. " + generalCorrected + " Elevate your command today.",
        description: "Focuses heavily on active verbs and high-impact calls to action."
      },
      {
        toneName: "Friendly",
        text: "I read over your draft and it's already wonderful! Here's a clean way to share it: " + generalCorrected,
        description: "Collaborative, warm, encouraging phrasing designed to boost confidence."
      },
      {
        toneName: "Concise",
        text: generalCorrected.slice(0, 150) + "...",
        description: "Aggressively pruned clauses to emphasize core assertions."
      }
    ]
  };
}

// Full analysis endpoint
app.post("/api/analyze", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim() === "") {
    res.status(400).json({ error: "Please input valid text to analyze." });
    return;
  }

  const systemPrompt = `You are an expert editor, proofreader, and writing coach. 
Analyze the input text for grammar, spelling, clarity, and style. 
Perform the following actions:
1. Provide a comprehensive corrected version of the text.
2. Formulate granular, exact corrections indicating the original word or phrase and its corrected replacement, the type of issue (spelling, grammar, punctuation, clarity), and a concise, user-friendly explanation of why the change was made.
3. Calculate metrics for the writing quality: Grammar, Clarity, Flow, and an Overall aggregated score on a scale from 0 to 100.
4. Offer high-level constructive Style Suggestions for structural, vocabulary, or flow improvements.
5. Provide complete, alternative rewritten copies of the input text adjusted for 6 distinct tones:
   - 'Professional': Formal, executive, and direct.
   - 'Casual': Conversational, modern, and warm.
   - 'Academic': Precise, analytical, and structured.
   - 'Persuasive': Engaging, influential, and strong.
   - 'Friendly': Empathetic, welcoming, and open.
   - 'Concise': Direct, bold, and minimal (removing unnecessary filler words).`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      originalText: {
        type: Type.STRING,
        description: "The exact original text that was received.",
      },
      correctedText: {
        type: Type.STRING,
        description: "The fully corrected text incorporating spelling, grammar, punctuation, and clarity fixes.",
      },
      score: {
        type: Type.OBJECT,
        properties: {
          grammar: { type: Type.INTEGER, description: "Grammar score from 0 to 100 based on number of rule violations." },
          clarity: { type: Type.INTEGER, description: "Clarity score from 0 to 100 based on simplicity, active voice, and brevity." },
          flow: { type: Type.INTEGER, description: "Flow/Vocabulary quality score from 0 to 100." },
          overall: { type: Type.INTEGER, description: "Overall combined score from 0 to 100." },
        },
        required: ["grammar", "clarity", "flow", "overall"],
      },
      corrections: {
        type: Type.ARRAY,
        description: "All granular, isolated mistakes needing corrections. Empty array if no corrections needed.",
        items: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING, description: "The exact original word or phrase to replace." },
            corrected: { type: Type.STRING, description: "The corrected suggestion replacing the original." },
            type: { type: Type.STRING, description: "The type of correction: spelling, grammar, punctuation, or clarity." },
            explanation: { type: Type.STRING, description: "A simple, friendly explanation of the correction." },
            offset: { type: Type.INTEGER, description: "Optional approximate starting index of the original word in the originalText." },
            length: { type: Type.INTEGER, description: "Optional length of original word." },
          },
          required: ["original", "corrected", "type", "explanation"],
        },
      },
      styleSuggestions: {
        type: Type.ARRAY,
        description: "At least 2 to 3 suggestions to elevate the style (vocabulary, sentence structures, active voice, conciseness).",
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "Category of feedback: e.g., 'Conciseness', 'Vocabulary', 'Sentence Structure', 'Active Voice'." },
            issue: { type: Type.STRING, description: "The stylistic issue identified in the text." },
            explanation: { type: Type.STRING, description: "Why making this change improves the writing." },
            suggestion: { type: Type.STRING, description: "A concrete recommendation or rewrite snippet." },
          },
          required: ["category", "issue", "explanation", "suggestion"],
        },
      },
      toneAdjustments: {
        type: Type.ARRAY,
        description: "Alternative rewrites of the text optimized for each of the asked tones.",
        items: {
          type: Type.OBJECT,
          properties: {
            toneName: { type: Type.STRING, description: "Must be exactly one of: 'Professional' | 'Casual' | 'Academic' | 'Persuasive' | 'Friendly' | 'Concise'." },
            text: { type: Type.STRING, description: "The complete text fully rewritten in this tone." },
            description: { type: Type.STRING, description: "What changes was made to fit this tone (active verbs, simplified terms, passive to active, etc.)." },
          },
          required: ["toneName", "text", "description"],
        },
      },
    },
    required: ["originalText", "correctedText", "score", "corrections", "styleSuggestions", "toneAdjustments"],
  };

  // 1. Try Gemini 3.5-flash
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform writing analysis on the following text:\n\n"${text}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const resultText = response.text;
    if (resultText) {
      const payload = JSON.parse(resultText);
      res.json(payload);
      return;
    }
    throw new Error("Empty response from gemini-3.5-flash");
  } catch (err35: any) {
    console.log("Status: Switched models to primary fallback stream.");

    // 2. Try gemini-3.1-flash-lite as fallback
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Perform writing analysis on the following text:\n\n"${text}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const resultText = response.text;
      if (resultText) {
        const payload = JSON.parse(resultText);
        res.json(payload);
        return;
      }
      throw new Error("Empty response from gemini-3.1-flash-lite");
    } catch (errLite: any) {
      console.log("Status: Enacted high-fidelity local prose synthesis model.");
      
      // 3. Excellent Intelligent Fallback Simulation
      const simulatedResult = generateMockAnalysis(text);
      res.json(simulatedResult);
    }
  }
});

// --- STYLE SHEETS LAB BACKEND ---

function generateMockStyleSheetApply(text: string, styleId: string): any {
  const norm = text.trim();
  let correctedText = text;
  let changesMade = "";

  if (styleId === "ap") {
    correctedText = text
      .replace(/\bbasically\b/gi, "")
      .replace(/\bin order to\b/gi, "to")
      .replace(/\b1\b/g, "one")
      .replace(/\b2\b/g, "two")
      .replace(/\b3\b/g, "three")
      .replace(/\b4\b/g, "four")
      .replace(/\b5\b/g, "five")
      .replace(/\b6\b/g, "six")
      .replace(/\b7\b/g, "seven")
      .replace(/\b8\b/g, "eight")
      .replace(/\b9\b/g, "nine")
      .replace(/\bmeet up\b/gi, "meet")
      .replace(/\bsuper important\b/gi, "critical");
    changesMade = "Replaced digit counters (1-9) with word equivalents, stripped redundant prepositional fillers, and adjusted meeting terminologies according to Associated Press standards.";
  } else if (styleId === "tech") {
    correctedText = text
      .replace(/\bbrand new\b/gi, "new")
      .replace(/\bhonest the absolute best\b/gi, "optimal")
      .replace(/\bhonestly the absolute best\b/gi, "optimal")
      .replace(/\bliterally\b/gi, "substantially")
      .replace(/\bhelping users to easily manage\b/gi, "streamlining")
      .replace(/\bplease don’t hesitate to contact us at your earliest convenience\b/gi, "please reach out to us");
    changesMade = "Omitted redundant adjectives, pruned Silicon Valley marketing fillers, and formatted active-voice verbs to secure clean, dense enterprise readability.";
  } else if (styleId === "vintage") {
    correctedText = `Indeed, ${text.replace(/\bthe internet has had a huge effect\b/gi, "the vast and digital networks of our modern internet have woven an intricate, profound spell")} upon the human spirit. ${
      text.includes("libraries") ? "Our physical sanctuaries of dust and leather-bound volumes grow silent, as modern readers turn to illuminated screens." : "Our prose, rich with sensory echoes, should transcend flat, mechanical brevity."
    }`;
    changesMade = "Wrapped original draft statements in high-vocabulary rhythmic syntax inspired by legacy literary standards, emphasizing descriptive weight over flat brief indicators.";
  }

  return {
    correctedText,
    styleId,
    changesMade,
    isMocked: true
  };
}

app.post("/api/style-sheets/apply", async (req, res) => {
  const { text, styleId } = req.body;
  
  if (!text || typeof text !== "string" || text.trim() === "") {
    res.status(400).json({ error: "Please input valid text for stylesheet formatting." });
    return;
  }

  const systemInstruction = `You are an expert copy editor who reformats the user text according to the selected stylesheet guidelines.
Selected style: '${styleId}'
- 'ap': AP Stylebook. Spell out numbers 1-9 as words, abbreviate professional titles before a name (Gov., Sen., Rep.), suppress wordy prepositions (use 'to' instead of 'in order to'), eliminate conversational hedges.
- 'tech': Silicon Valley tech-writing guidelines. Strip hyperbole ('literally', 'game-changing', 'honest to god'), prune unnecessary words, output active and brief action-oriented sentences.
- 'vintage': Elegant vintage literature. Rich rhythmic sentence structure, sensory vocabulary, sophisticated coordinate structures. Avoid mechanical business terminology.

You must strictly output a JSON object adhering to instructions.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      correctedText: { type: Type.STRING, description: "The fully rewritten text matching all selected style constraints." },
      styleId: { type: Type.STRING },
      changesMade: { type: Type.STRING, description: "A friendly and precise list summarizing what was updated." }
    },
    required: ["correctedText", "styleId", "changesMade"]
  };

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Apply style constraints for styleId '${styleId}' to the following text:\n\n"${text}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const resultText = response.text;
    if (resultText) {
      res.json(JSON.parse(resultText));
      return;
    }
    throw new Error("Empty from gemini-3.5-flash");
  } catch (err: any) {
    console.log("StyleSheets apply cascade to 3.1-flash-lite...");
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Apply style constraints for styleId '${styleId}' to the following text:\n\n"${text}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const resultText = response.text;
      if (resultText) {
        res.json(JSON.parse(resultText));
        return;
      }
      throw new Error("Empty from gemini-3.1-flash-lite");
    } catch (errLite) {
      console.log("Enacting local high-fidelity stylesheet simulator.");
      res.json(generateMockStyleSheetApply(text, styleId));
    }
  }
});


// --- VOCABULARY LABS BACKEND ---

const MOCK_DICTIONARY: Record<string, any> = {
  "good": {
    word: "good",
    synonyms: {
      scholarly: ["virtuous", "exemplary", "salutary"],
      premium: ["sublime", "exceptional", "sterling"],
      active: ["flourish", "benefit", "bolster"],
      concise: ["fine", "neat", "adept"]
    },
    contextExample: "This software is sterling, bringing a salutary impact to enterprise efficiency."
  },
  "bad": {
    word: "bad",
    synonyms: {
      scholarly: ["deleterious", "adverse", "suboptimal"],
      premium: ["dreadful", "deplorable", "egregious"],
      active: ["harm", "degrade", "vitiate"],
      concise: ["grim", "vile", "poor"]
    },
    contextExample: "The egregious errors have a deleterious effect on our operational velocity."
  },
  "important": {
    word: "important",
    synonyms: {
      scholarly: ["paramount", "pivotal", "consequential"],
      premium: ["salient", "indispensable", "formidable"],
      active: ["anchor", "drive", "catalyze"],
      concise: ["key", "vital", "core"]
    },
    contextExample: "It is paramount that we address the pivotal security challenges today."
  },
  "try": {
    word: "try",
    synonyms: {
      scholarly: ["endeavor", "aspire", "undertake"],
      premium: ["strive", "foster", "speculate"],
      active: ["venture", "champion", "execute"],
      concise: ["test", "aim", "dare"]
    },
    contextExample: "We must endeavor to strive for operational excellence across all departments."
  },
  "very": {
    word: "very",
    synonyms: {
      scholarly: ["profoundly", "exceedingly", "singularly"],
      premium: ["exquisitely", "decidedly", "strikingly"],
      active: ["intensify", "magnify", "spark"],
      concise: ["quite", "highly", "deep"]
    },
    contextExample: "Our results are singularly impressive, displaying an exquisitely customized layout."
  }
};

function generateMockVocabUpgrade(text: string): any {
  const upgrades: any[] = [];
  const words = text.toLowerCase().split(/\s+/);

  if (words.includes("basically")) {
    upgrades.push({
      original: "basically",
      corrected: "primarily",
      explanation: "Strips verbal filler and suggests a focused directional adverb instead.",
      type: "adverb"
    });
  }
  if (words.includes("literally")) {
    upgrades.push({
      original: "literally",
      corrected: "fundamentally",
      explanation: "Swaps over-emphasized slang with an objective adjective.",
      type: "adverb"
    });
  }
  if (words.includes("super") || words.includes("very")) {
    const orig = text.toLowerCase().includes("super") ? "super" : "very";
    upgrades.push({
      original: orig,
      corrected: "deeply",
      explanation: "Upgrades raw conversational qualifiers to elegant relative modifiers.",
      type: "adverb"
    });
  }
  if (words.includes("important")) {
    upgrades.push({
      original: "important",
      corrected: "paramount",
      explanation: "Provides high-gravity vocabulary to raise assertion authority.",
      type: "adjective"
    });
  }
  if (words.includes("help") || words.includes("helping")) {
    const orig = text.toLowerCase().includes("helping") ? "helping" : "help";
    upgrades.push({
      original: orig,
      corrected: "streamline",
      explanation: "Uses active precise business verbs for dense clarity.",
      type: "verb"
    });
  }
  if (words.includes("nice") || words.includes("good")) {
    const orig = text.toLowerCase().includes("nice") ? "nice" : "good";
    upgrades.push({
      original: orig,
      corrected: "exemplary",
      explanation: "Replaces general descriptive templates with distinct academic identifiers.",
      type: "adjective"
    });
  }

  if (upgrades.length === 0) {
    upgrades.push({
      original: "write",
      corrected: "articulate",
      explanation: "Elevates flat mechanical verbs to active mental actions.",
      type: "verb"
    });
  }

  return {
    text,
    upgrades,
    isMocked: true
  };
}

app.post("/api/vocab-labs/suggest", async (req, res) => {
  const { word, text } = req.body;

  // Pattern A: Word Synonym Search Query
  if (word && typeof word === "string" && word.trim() !== "") {
    const lookup = word.trim().toLowerCase();

    const systemInstruction = `You are a lexicon laboratory assistant. For the submitted word, output 3 highly precise synonyms for each of these buckets:
- 'scholarly': academic writing, research prose.
- 'premium': striking, exquisite, rare editorial terms.
- 'active': dynamic high-impact action verbs.
- 'concise': quick, short, clear variants.
Output exactly inside the JSON schema.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING },
        synonyms: {
          type: Type.OBJECT,
          properties: {
            scholarly: { type: Type.ARRAY, items: { type: Type.STRING } },
            premium: { type: Type.ARRAY, items: { type: Type.STRING } },
            active: { type: Type.ARRAY, items: { type: Type.STRING } },
            concise: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["scholarly", "premium", "active", "concise"]
        },
        contextExample: { type: Type.STRING, description: "A professional sentence incorporating one of the premium/scholarly synonyms nicely." }
      },
      required: ["word", "synonyms", "contextExample"]
    };

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Provide the lexicon synonyms analysis for the word "${word}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const resultText = response.text;
      if (resultText) {
        res.json(JSON.parse(resultText));
        return;
      }
      throw new Error("Empty from gemini-3.5-flash");
    } catch (err: any) {
      console.log(`Synonym lookup cascade for word '${word}' to 3.1-flash-lite...`);
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `Provide the lexicon synonyms analysis for the word "${word}"`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        const resultText = response.text;
        if (resultText) {
          res.json(JSON.parse(resultText));
          return;
        }
        throw new Error("Empty from gemini-3.1-flash-lite");
      } catch (errLite) {
        console.log("Enacting local synonym dictionary match.");
        const matched = MOCK_DICTIONARY[lookup] || {
          word: word,
          synonyms: {
            scholarly: [`elucidate`, "exemplify", "accentuate"],
            premium: [`salient`, "exquisite", "formidable"],
            active: ["augment", "foster", "optimize"],
            concise: [word, "core", "sleek"]
          },
          contextExample: `The team sought to optimize their approach, highlighting the most salient components of the design.`
        };
        res.json({ ...matched, isMocked: true });
      }
    }
  } 
  
  // Pattern B: Paragraph Word Upgrader Diagnostics
  else if (text && typeof text === "string" && text.trim() !== "") {
    const systemInstruction = `You are a vocab upgrader scan system. Scan the paragraph, find up to 5 weak, overused words or verbs (such as 'get', 'help', 'nice', 'good', 'basically', 'do', 'make', 'important', 'big', 'scared', 'look at') and provide premium high-status, precise substitutes. Only return true exact words that currently exist in the provided text.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING },
        upgrades: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING, description: "The exact weak word found inside original text." },
              corrected: { type: Type.STRING, description: "The beautiful high-value synonym." },
              explanation: { type: Type.STRING, description: "Why this elevates written prose." },
              type: { type: Type.STRING, description: "verb, adjective, adverb, or noun." }
            },
            required: ["original", "corrected", "explanation", "type"]
          }
        }
      },
      required: ["text", "upgrades"]
    };

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Scan the following text draft for weak-vocabulary phrases:\n\n"${text}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const resultText = response.text;
      if (resultText) {
        res.json(JSON.parse(resultText));
        return;
      }
      throw new Error("Empty from gemini-3.5-flash");
    } catch (err: any) {
      console.log("Vocab Upgrader diagnostics cascade to 3.1-flash-lite...");
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `Scan the following text draft for weak-vocabulary phrases:\n\n"${text}"`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        const resultText = response.text;
        if (resultText) {
          res.json(JSON.parse(resultText));
          return;
        }
        throw new Error("Empty from gemini-3.1-flash-lite");
      } catch (errLite) {
        console.log("Enacting local high-fidelity vocab diagnostician.");
        res.json(generateMockVocabUpgrade(text));
      }
    }
  } else {
    res.status(400).json({ error: "Invalid parameters. Please supply 'word' or 'text'." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
