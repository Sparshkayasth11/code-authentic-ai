"use client";

import { useState } from "react";

interface TeacherEvaluation {
  summary: string;
  risk_level: string;
  recommended_viva_questions: string[];
  grading_advice: string;
}

interface ProjectSummary {
  title: string;
  purpose: string;
  target_audience: string;
  key_features: string[];
}

interface SlideContent {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  suggestedVisual: string;
  badgeText?: string;
}

interface InspectionResult {
  type: string;
  url: string;
  authenticity_score: number;
  ai_generated_percentage: number;
  detected_tech: string[];
  teacher_evaluation?: TeacherEvaluation;
  future_scope?: string[];
  project_summary?: ProjectSummary;
  insights: string[];
  suggestions: string[];
  social_prompt: string;
}

export default function Home() {
  const [mode, setMode] = useState<"single" | "teacher" | "ppt">("single");
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [batchResults, setBatchResults] = useState<InspectionResult[]>([]);
  const [pptSlides, setPptSlides] = useState<SlideContent[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedSlideIndex, setCopiedSlideIndex] = useState<number | null>(null);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setBatchResults([]);
    setPptSlides(null);
    setCopied(false);

    try {
      if (mode === "single") {
        if (!url) return;
        const res = await fetch("https://code-authentic-ai.onrender.com/api/inspect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!res.ok) throw new Error("Failed to inspect URL.");
        const data = await res.json();
        setResult(data);
      } else if (mode === "teacher") {
        const urlList = bulkUrls.split("\n").map(u => u.trim()).filter(u => u.length > 0);
        if (urlList.length === 0) throw new Error("Please enter at least one URL.");

        const res = await fetch("https://code-authentic-ai.onrender.com/api/bulk-inspect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: urlList }),
        });

        if (!res.ok) throw new Error("Failed to process batch inspection.");
        const data = await res.json();
        setBatchResults(data.batch_results || []);
      } else if (mode === "ppt") {
        if (!url) return;
        const res = await fetch("https://code-authentic-ai.onrender.com/api/inspect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!res.ok) throw new Error("Failed to inspect URL for PPT generation.");
        const data: InspectionResult = await res.json();
        setResult(data);

        const projTitle = data.project_summary?.title || url.replace("https://", "").replace("http://", "").split("/")[0] || "Project";
        const generatedSlides: SlideContent[] = [
          {
            slideNumber: 1,
            title: projTitle,
            subtitle: "Next-Generation Intelligent AI Platform",
            badgeText: "Title Slide",
            bullets: [
              `Project Name: ${projTitle}`,
              `Core Purpose: ${data.project_summary?.purpose || "AI-driven project execution & code inspection."}`,
              "Department: Computer Science / Engineering / AI & DS",
              "Presented By: Student / Development Team Lead"
            ],
            suggestedVisual: "Main Project Banner with high-contrast theme & logo."
          },
          {
            slideNumber: 2,
            title: "Problem Statement",
            badgeText: "Background & Need",
            bullets: data.insights.length > 0 ? data.insights.slice(0, 4) : [
              "Manual project inspection and evaluation is extremely time-consuming.",
              "Identifying AI-generated boilerplate code requires automated checks.",
              "Lack of real-time architectural insights and presentation tools."
            ],
            suggestedVisual: "Screenshot placeholder of key user pain-point interface."
          },
          {
            slideNumber: 3,
            title: "Objectives & Target Audience",
            badgeText: "Goals",
            bullets: [
              `Target Audience: ${data.project_summary?.target_audience || "Developers, Students, & Academic Evaluators"}`,
              "Automate technical project validation & score reporting.",
              "Provide transparent code authenticity and AI ratio breakdown.",
              "Streamline presentation creation directly from code repositories."
            ],
            suggestedVisual: "Grid layout highlighting Accuracy, Efficiency, and Speed."
          },
          {
            slideNumber: 4,
            title: "Purposed Solution & Modules",
            badgeText: "Features",
            bullets: data.project_summary?.key_features || [
              "Live Web URL & GitHub Repo Inspection",
              "Teacher/Evaluator Viva Question Generation",
              "Automated Presentation Content Generator"
            ],
            suggestedVisual: "Two-column feature list comparing User vs Admin features."
          },
          {
            slideNumber: 5,
            title: "AI Components & Tech Stack",
            badgeText: "Technical Details",
            bullets: [
              `Detected Tech Stack: ${data.detected_tech.join(", ")}`,
              "Frontend & UI: Next.js, React, Tailwind CSS",
              "Backend & API: Node.js / Python FastAPI",
              "Deployment: Vercel / Cloud Infrastructure"
            ],
            suggestedVisual: "Technology stack badges and architecture flowchart."
          },
          {
            slideNumber: 6,
            title: "System Flowchart & Workflow",
            badgeText: "Architecture",
            bullets: [
              "Step 1: Input GitHub / Web URL → Parsing & Scrape",
              "Step 2: AI Code Authenticity Scan & Feature Extraction",
              "Step 3: Evaluator Assessment & Viva Question Mapping",
              "Step 4: Slide-by-Slide PPT Generation & Export"
            ],
            suggestedVisual: "Vertical process flow cards with directional arrows."
          },
          {
            slideNumber: 7,
            title: "Future Scope & Upgrades",
            badgeText: "Roadmap",
            bullets: data.future_scope || [
              "Integration with GitHub Classroom and Canvas LMS.",
              "Multi-language code verification (Python, Java, C++).",
              "Automated grading and analytics dashboard."
            ],
            suggestedVisual: "Roadmap timeline or pricing/tier subscription cards."
          },
          {
            slideNumber: 8,
            title: "Conclusion & Summary",
            badgeText: "Conclusion",
            bullets: [
              `${projTitle} provides a smarter, faster, and more efficient approach.`,
              "Reduces manual evaluation efforts and simplifies viva preparation.",
              "Bridging the gap between raw codebases and academic slide decks."
            ],
            suggestedVisual: "Clean 'Thank You' card with repo link & developer contact."
          }
        ];

        setPptSlides(generatedSlides);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.social_prompt) {
      navigator.clipboard.writeText(result.social_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopySlide = (slide: SlideContent, idx: number) => {
    const text = `Slide ${slide.slideNumber}: ${slide.title}\n\nBullets:\n${slide.bullets.map(b => `- ${b}`).join("\n")}\n\nVisual Suggestion: ${slide.suggestedVisual}`;
    navigator.clipboard.writeText(text);
    setCopiedSlideIndex(idx);
    setTimeout(() => setCopiedSlideIndex(null), 2000);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <main className="print-page min-h-screen bg-neutral-950 text-white p-6 md:p-12 font-sans">
      <div className="print-content max-w-4xl mx-auto space-y-8">
        
        {/* Main Header */}
        <div className="text-center space-y-3 print:hidden">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            CodeAuthentic AI
          </h1>
          <p className="text-neutral-400 text-lg">
            Verify code authenticity, AI ratio & full project architecture explanations.
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <button
              onClick={() => setMode("single")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                mode === "single"
                  ? "bg-indigo-600 text-white"
                  : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              Single Inspector Mode
            </button>
            <button
              onClick={() => setMode("teacher")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                mode === "teacher"
                  ? "bg-indigo-600 text-white"
                  : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              🎓 Teacher / Evaluator Mode
            </button>
            <button
              onClick={() => setMode("ppt")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                mode === "ppt"
                  ? "bg-blue-600 text-white ring-2 ring-blue-500/50"
                  : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              📊 AI PPT Outline Mode
            </button>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleInspect} className="space-y-4 print:hidden">
          {mode === "single" || mode === "ppt" ? (
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="url"
                required
                placeholder={mode === "ppt" ? "Paste Live Web URL or GitHub Repo Link for PPT Outline..." : "Paste Live Web URL or GitHub Repo Link..."}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 px-6 py-3 rounded-lg font-medium transition whitespace-nowrap"
              >
                {loading 
                  ? (mode === "ppt" ? "Generating Slide Deck..." : "Inspecting...") 
                  : (mode === "ppt" ? "Generate PPT Slides" : "Inspect Code")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                required
                rows={4}
                placeholder="Enter Student GitHub URLs or Live Web Links (One URL per line)..."
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-white focus:outline-none focus:border-indigo-500 transition font-mono text-xs"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 py-3 rounded-lg font-medium transition"
              >
                {loading ? "Evaluating Batch Projects..." : "Run Class Batch Audit"}
              </button>
            </div>
          )}
        </form>

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800 text-red-400 rounded-lg text-sm print:hidden">
            {error}
          </div>
        )}

        {/* Teacher Batch Audit Scoreboard */}
        {mode === "teacher" && batchResults.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4 print:hidden">
            <h3 className="text-xl font-bold text-indigo-400 flex items-center justify-between">
              <span>📊 Class Authenticity & Evaluator Scoreboard</span>
              <span className="text-xs font-normal text-neutral-400">Total Projects: {batchResults.length}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase">
                    <th className="p-3">#</th>
                    <th className="p-3">Project / Repo URL</th>
                    <th className="p-3 text-center">Human Ratio</th>
                    <th className="p-3 text-center">AI Ratio</th>
                    <th className="p-3">Risk Level</th>
                    <th className="p-3">Evaluator Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {batchResults.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-950/50 transition">
                      <td className="p-3 font-bold text-neutral-500">{idx + 1}</td>
                      <td className="p-3 font-mono text-neutral-300 max-w-xs truncate">{item.url}</td>
                      <td className="p-3 text-center font-bold text-emerald-400">{item.authenticity_score}%</td>
                      <td className="p-3 text-center font-bold text-amber-400">{item.ai_generated_percentage}%</td>
                      <td className="p-3 font-semibold text-indigo-400">
                        {item.teacher_evaluation?.risk_level || "N/A"}
                      </td>
                      <td className="p-3 text-neutral-300 font-sans italic text-[11px]">
                        {item.teacher_evaluation?.grading_advice || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI PPT Outline Mode Display */}
        {mode === "ppt" && pptSlides && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-900 border border-neutral-800 p-6 rounded-xl gap-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-950/60 border border-blue-800/40 px-3 py-1 rounded-full">
                  AI Generated PPT Plan
                </span>
                <h2 className="text-2xl font-bold mt-2 text-white">
                  8-Slide Presentation Outline
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Ready-to-use slide titles, bullet points, and screenshot visual suggestions.
                </p>
              </div>
              <button
                onClick={() => {
                  const fullText = pptSlides.map(s => `SLIDE ${s.slideNumber}: ${s.title}\n${s.bullets.map(b => `- ${b}`).join('\n')}\nVisual Note: ${s.suggestedVisual}\n`).join('\n---\n\n');
                  navigator.clipboard.writeText(fullText);
                  alert("Full PPT Outline Copied!");
                }}
                className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-4 py-2 rounded-lg text-xs font-medium transition"
              >
                📋 Copy All Slides Text
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pptSlides.map((slide, idx) => (
                <div key={slide.slideNumber} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between space-y-4 relative">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold bg-neutral-950 text-neutral-400 px-2.5 py-1 rounded border border-neutral-800">
                        Slide {slide.slideNumber} of {pptSlides.length}
                      </span>
                      {slide.badgeText && (
                        <span className="text-[10px] font-semibold text-blue-400 bg-blue-950/40 border border-blue-900/40 px-2 py-0.5 rounded-full">
                          {slide.badgeText}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-indigo-400 mb-1">{slide.title}</h3>
                    {slide.subtitle && <p className="text-xs text-neutral-400 italic mb-3">{slide.subtitle}</p>}

                    <ul className="space-y-1.5 list-disc list-inside text-xs text-neutral-200">
                      {slide.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 space-y-3">
                    <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 text-[11px]">
                      <span className="font-semibold text-indigo-300 block">🖼️ Visual Suggestion:</span>
                      <p className="text-neutral-400 italic text-[11px] mt-0.5">{slide.suggestedVisual}</p>
                    </div>

                    <button
                      onClick={() => handleCopySlide(slide, idx)}
                      className="w-full bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 py-1.5 rounded transition font-medium"
                    >
                      {copiedSlideIndex === idx ? "Copied Slide ✓" : `Copy Slide ${slide.slideNumber} Text`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Inspection View */}
        {mode === "single" && result && (
          <div className="print-report-wrapper space-y-6">
            <div className="flex justify-end print:hidden">
              <button
                onClick={handleDownloadPDF}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition shadow flex items-center gap-2"
              >
                📥 Download PDF Audit Report
              </button>
            </div>

            {/* Audit Report Container */}
            <div id="audit-report" className="space-y-5 bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-xl text-white">
              <div className="border-b border-neutral-800 pb-4 text-center print-card">
                <h2 className="text-2xl font-extrabold text-indigo-400">
                  CodeAuthentic AI Audit Report
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Target URL: <span className="text-neutral-200 font-mono">{result.url}</span>
                </p>
              </div>

              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4 print-card">
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 text-center print-card">
                  <span className="text-neutral-400 text-xs uppercase tracking-wider">Human Authenticity Score</span>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {result.authenticity_score}%
                  </div>
                </div>
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 text-center print-card">
                  <span className="text-neutral-400 text-xs uppercase tracking-wider">AI Generated Ratio</span>
                  <div className="text-3xl font-extrabold text-amber-400 mt-1">
                    {result.ai_generated_percentage}%
                  </div>
                </div>
              </div>

              {/* Detailed Evaluator Assessment */}
              {result.teacher_evaluation && (
                <div className="bg-neutral-950 p-5 rounded-lg border border-indigo-900/50 space-y-2.5 print-card">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      🎓 Detailed Evaluator Assessment &amp; Guidance
                    </h4>
                    <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                      {result.teacher_evaluation.risk_level}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 italic">
                    "{result.teacher_evaluation.summary}"
                  </p>

                  <div className="space-y-1 pt-1">
                    <h5 className="text-[11px] font-semibold text-neutral-400 uppercase">Suggested Viva Exam Questions:</h5>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-neutral-300">
                      {result.teacher_evaluation.recommended_viva_questions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-1">
                    <h5 className="text-[11px] font-semibold text-neutral-400 uppercase">Grading Advice:</h5>
                    <p className="text-xs text-emerald-400 font-medium mt-0.5">
                      {result.teacher_evaluation.grading_advice}
                    </p>
                  </div>
                </div>
              )}

              {/* Website Purpose & Full Explanation */}
              {result.project_summary && (
                <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 space-y-3 print-card">
                  <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    💡 Website Purpose &amp; Full Explanation
                  </h3>
                  <div>
                    <h4 className="text-[10px] font-semibold text-neutral-400 uppercase">PROJECT PURPOSE:</h4>
                    <p className="text-xs text-neutral-200 mt-0.5">{result.project_summary.purpose}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-semibold text-neutral-400 uppercase">TARGET AUDIENCE:</h4>
                    <p className="text-xs text-neutral-300 mt-0.5">{result.project_summary.target_audience}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-semibold text-neutral-400 uppercase">KEY IDENTIFIED MODULES:</h4>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-neutral-300 mt-0.5">
                      {result.project_summary.key_features.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Boxed Tech Stack Section */}
              <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 space-y-2 print-card">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  🛠️ Detected Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.detected_tech.map((tech, idx) => (
                    <span key={idx} className="bg-indigo-950 text-indigo-300 border border-indigo-800/50 text-xs px-3 py-1 rounded-full font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Future Scope */}
              {result.future_scope && (
                <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 space-y-2 print-card">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    🚀 Future Scope &amp; Commercial Use-Cases
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300">
                    {result.future_scope.map((scope, idx) => (
                      <li key={idx}>{scope}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Code Insights Box */}
              <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 space-y-2 print-card">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  🔍 Code Insights
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300">
                  {result.insights.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Improvement Suggestions Box */}
              <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 space-y-2 print-card">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  ⚡ Improvement Suggestions
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300">
                  {result.suggestions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Social Prompt Box */}
              <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 space-y-3 print-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    📱 GENERATED SOCIAL MEDIA POST
                  </h3>
                  <button
                    onClick={handleCopy}
                    className="bg-neutral-800 hover:bg-neutral-700 text-xs text-indigo-400 px-3 py-1.5 rounded transition font-medium border border-neutral-700 print:hidden"
                  >
                    {copied ? "Copied! ✓" : "Copy Post"}
                  </button>
                </div>
                <p className="text-xs text-neutral-300 font-mono bg-neutral-900 p-3 rounded border border-neutral-800 whitespace-pre-wrap leading-relaxed">
                  {result.social_prompt}
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}