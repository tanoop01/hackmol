"use client";

import { Scale, Search, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useMemo, useState } from "react";

import Navbar from "@/components/Navbar";

const SUGGESTED_PROMPTS = [
  "My employer has not paid salary for 2 months. What can I do?",
  "My landlord is refusing to return security deposit after moving out.",
  "A builder delayed possession of my flat beyond promised date.",
  "Police are not registering my complaint. What are legal options?",
];

export default function LegalAssistantPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);

  const hasResults = sessions.length > 0;

  const latestSession = useMemo(() => {
    if (!hasResults) {
      return null;
    }

    return sessions[0];
  }, [hasResults, sessions]);

  async function askLegalAssistant(nextQuery) {
    const input = String(nextQuery || query).trim();
    if (!input || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/legal-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json?.success) {
        throw new Error(json?.message || "Unable to fetch legal advice right now.");
      }

      const next = {
        id: `${Date.now()}`,
        query: input,
        legalAdvice: String(json?.legalAdvice || "").trim(),
        kanoonDocuments: Array.isArray(json?.kanoonDocuments) ? json.kanoonDocuments : [],
        vectorMatches: Array.isArray(json?.vectorMatches) ? json.vectorMatches : [],
      };

      setSessions((previous) => [next, ...previous]);
      setQuery("");
    } catch (requestError) {
      setError(requestError?.message || "Unable to fetch legal advice right now.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    askLegalAssistant();
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-5 pb-16 pt-24">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: "#6B7280" }}>
            AI Legal Assistant
          </p>
          <h1
            className="mt-2 text-[44px] font-semibold leading-[1.08]"
            style={{ color: "#111827", fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Ask a legal question
          </h1>
          <p className="mt-3 max-w-[780px] text-[18px] leading-[1.7]" style={{ color: "#4B5563" }}>
            Get AI-generated legal guidance grounded in your legal RAG pipeline. Advice is shown in markdown format.
          </p>
        </div>

        <section className="mt-8 rounded-[18px] bg-white p-6" style={{ border: "1px solid #E5E7EB" }}>
          <form onSubmit={handleSubmit}>
            <label htmlFor="legal-query" className="mb-2 block text-[14px] font-semibold" style={{ color: "#374151" }}>
              Your legal query
            </label>
            <textarea
              id="legal-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Describe your issue in detail. Mention timeline, parties involved, and key facts."
              className="w-full resize-none rounded-[12px] px-4 py-3 text-[16px] leading-[1.7] focus:outline-none"
              style={{ minHeight: "140px", border: "1px solid #D1D5DB", background: "#FFFFFF", color: "#111827" }}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => askLegalAssistant(prompt)}
                  disabled={loading}
                  className="rounded-[999px] px-3 py-1.5 text-[12px] font-semibold"
                  style={{ border: "1px solid #D1D5DB", background: "#FFFFFF", color: "#4B5563" }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {error ? (
              <p className="mt-3 text-[13px]" style={{ color: "#B91C1C" }}>
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="inline-flex items-center justify-center rounded-[12px] px-6 py-3 text-[15px] font-semibold text-white"
                style={{ background: loading || !query.trim() ? "#9CA3AF" : "#111827" }}
              >
                <Search size={16} className="mr-2" />
                {loading ? "Getting advice..." : "Get Legal Advice"}
              </button>

              {hasResults ? (
                <button
                  type="button"
                  onClick={() => setSessions([])}
                  className="rounded-[12px] px-4 py-3 text-[14px] font-semibold"
                  style={{ border: "1px solid #D1D5DB", color: "#374151", background: "#FFFFFF" }}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="mt-8 space-y-5">
          {!hasResults ? (
            <div className="rounded-[16px] bg-white px-6 py-8" style={{ border: "1px solid #E5E7EB" }}>
              <div className="inline-flex items-center gap-2 text-[14px] font-semibold" style={{ color: "#374151" }}>
                <Sparkles size={15} />
                Waiting for your first query
              </div>
              <p className="mt-2 text-[15px]" style={{ color: "#6B7280" }}>
                The legal advice response will appear here. Optional retrieval context is shown below each answer.
              </p>
            </div>
          ) : null}

          {sessions.map((item, index) => (
            <article key={item.id} className="rounded-[16px] bg-white p-6" style={{ border: "1px solid #E5E7EB" }}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#6B7280" }}>
                Query
              </p>
              <p className="mt-2 text-[17px] leading-[1.65]" style={{ color: "#111827" }}>
                {item.query}
              </p>

              <div className="my-5 h-px" style={{ background: "#E5E7EB" }} />

              <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#374151" }}>
                <Scale size={14} />
                Legal Advice
              </div>

              <div className="mt-3 text-[16px] leading-[1.8]" style={{ color: "#374151" }}>
                <ReactMarkdown
                  components={{
                    h1: ({ ...props }) => <h2 className="mt-4 text-[24px] font-semibold" style={{ color: "#111827" }} {...props} />,
                    h2: ({ ...props }) => <h3 className="mt-4 text-[21px] font-semibold" style={{ color: "#111827" }} {...props} />,
                    h3: ({ ...props }) => <h4 className="mt-3 text-[18px] font-semibold" style={{ color: "#111827" }} {...props} />,
                    p: ({ ...props }) => <p className="mt-2 text-[16px] leading-[1.85]" style={{ color: "#374151" }} {...props} />,
                    li: ({ ...props }) => <li className="ml-5 list-disc text-[16px] leading-[1.8]" style={{ color: "#374151" }} {...props} />,
                    strong: ({ ...props }) => <strong className="font-semibold" style={{ color: "#111827" }} {...props} />,
                  }}
                >
                  {item.legalAdvice || "No legal advice returned by the service."}
                </ReactMarkdown>
              </div>

              <details className="mt-5 rounded-[12px] px-4 py-3" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                <summary className="cursor-pointer text-[14px] font-semibold" style={{ color: "#374151" }}>
                  Optional retrieval context
                </summary>

                <div className="mt-3 space-y-4">
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#6B7280" }}>
                      Kanoon docs
                    </p>
                    {item.kanoonDocuments.length === 0 ? (
                      <p className="mt-1 text-[14px]" style={{ color: "#6B7280" }}>
                        No docs returned.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {item.kanoonDocuments.map((doc, docIndex) => (
                          <li key={`${item.id}-doc-${docIndex}`} className="text-[14px]" style={{ color: "#374151" }}>
                            {typeof doc === "string" ? doc : JSON.stringify(doc)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#6B7280" }}>
                      Vector matches
                    </p>
                    {item.vectorMatches.length === 0 ? (
                      <p className="mt-1 text-[14px]" style={{ color: "#6B7280" }}>
                        No vector matches returned.
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {item.vectorMatches.map((match, matchIndex) => (
                          <div key={`${item.id}-vec-${matchIndex}`} className="rounded-[10px] bg-white px-3 py-3" style={{ border: "1px solid #E5E7EB" }}>
                            <p className="text-[14px] leading-[1.7]" style={{ color: "#374151" }}>
                              {String(match?.content || "").slice(0, 320)}
                              {String(match?.content || "").length > 320 ? "..." : ""}
                            </p>
                            <p className="mt-1 text-[12px]" style={{ color: "#6B7280" }}>
                              Source: {match?.metadata?.source || "Unknown"}
                              {Number.isFinite(Number(match?.score))
                                ? ` | Score: ${Number(match.score).toFixed(3)}`
                                : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </details>

              {index === 0 ? null : (
                <p className="mt-4 text-[12px]" style={{ color: "#9CA3AF" }}>
                  Previous query
                </p>
              )}
            </article>
          ))}
        </section>

        {latestSession ? (
          <p className="mt-5 text-[12px] leading-[1.5]" style={{ color: "#9CA3AF" }}>
            Disclaimer: This output is AI-generated legal information and not professional legal advice.
          </p>
        ) : null}
      </main>
    </div>
  );
}
