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
  const [mode, setMode] = useState<"single" | "teacher">("single");
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [batchResults, setBatchResults] = useState<InspectionResult[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setBatchResults([]);
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
      } else {
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

          <div className="flex justify-center gap-2 pt-4">
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
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleInspect} className="space-y-4 print:hidden">
          {mode === "single" ? (
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="url"
                required
                placeholder="Paste Live Web URL or GitHub Repo Link..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 px-6 py-3 rounded-lg font-medium transition"
              >
                {loading ? "Inspecting..." : "Inspect Code"}
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
                      🎓 Detailed Evaluator Assessment & Guidance
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
                    💡 Website Purpose & Full Explanation
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
                    🚀 Future Scope & Commercial Use-Cases
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