"use client";

import Link from "next/link";
import { useState, FormEvent, useRef, useEffect } from "react";
import ClaimsListResults from "./ClaimsListResult";
import LoadingMessages from "./ui/LoadingMessages";
import PreviewBox from "./PreviewBox";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import AnimatedGradientText from "./ui/animated-gradient-text";
import ShareButtons from "./ui/ShareButtons";
import { getAssetPath } from "@/lib/utils";

interface Claim {
    claim: string;
    original_text: string;
}

type FactCheckResponse = {
  claim: string;
  assessment: "True" | "False" | "Insufficient Information" | "Unverified";
  summary: string;
  fixed_original_text: string;
  confidence_score: number;
};

export default function FactChecker() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [factCheckResults, setFactCheckResults] = useState<any[]>([]);
  const [articleContent, setArticleContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAllClaims, setShowAllClaims] = useState(true);

  // Create a ref for the loading or bottom section
  const loadingRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the loading section
  const scrollToLoading = () => {
    loadingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Watch for changes to `isGenerating` and scroll when it becomes `true`
  useEffect(() => {
    if (isGenerating) {
      scrollToLoading();
    }
  }, [isGenerating]);

  // Function to adjust textarea height
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '150px';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 300)}px`;
    }
  };

  // Adjust height when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [articleContent]);

  // Extract claims function
  const extractClaims = async (content: string) => {
    const response = await fetch(getAssetPath('/api/extractclaims'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract claims.');
    }
  
    const data = await response.json();
    return Array.isArray(data.claims) ? data.claims : JSON.parse(data.claims);
  };
  
  // ExaSearch function
  const exaSearch = async (claim: string) => {
    console.log(`Claim recieved in exa search: ${claim}`);

    const response = await fetch(getAssetPath('/api/exasearch'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch verification for claim.');
    }

    const data = await response.json();
    return data;
  };

  // Verify claims function
  const verifyClaim = async (claim: string, original_text: string, exasources: any) => {
    const response = await fetch(getAssetPath('/api/verifyclaims'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim, original_text, exasources }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to verify claim.');
    }

    const data = await response.json();
    console.log("VerifyClaim response:", data.claims);

    return data.claims as FactCheckResponse;
  };
   
  // Fact check function
  const factCheck = async (e: FormEvent) => {
    e.preventDefault();
  
    if (!articleContent) {
      setError("Please enter some content or try with sample blog.");
      return;
    }

    if (articleContent.length < 50) {
      setError("Too short. Please enter at least 50 characters.");
      return;
    }
  
    setIsGenerating(true);
    setError(null);
    setFactCheckResults([]);
  
    try {
      const claims = await extractClaims(articleContent);
      const results: any[] = [];

      // Process claims sequentially with a delay to avoid rate limits
      for (const { claim, original_text } of claims as Claim[]) {
        try {
          const exaSources = await exaSearch(claim);

          if (!exaSources?.results?.length) {
            console.warn(`No sources found for claim: ${claim}`);
            continue;
          }

          const sourceUrls = exaSources.results.map((result: { url: any; }) => result.url);

          // 5-second delay to stay under Gemini free-tier limit (15 RPM)
          await new Promise(resolve => setTimeout(resolve, 5000));

          const verifiedClaim = await verifyClaim(claim, original_text, exaSources.results);

          results.push({ ...verifiedClaim, original_text, url_sources: sourceUrls });

          // Update results incrementally so the user sees progress
          setFactCheckResults([...results]);
        } catch (error) {
          console.error(`Failed to verify claim: ${claim}`, error);
          // Continue to next claim instead of silently dropping
          continue;
        }
      }

      setFactCheckResults(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
      setFactCheckResults([]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Sample blog content
  const sampleBlog = `The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822, intended to cast shadows across the city to mark the hours. Designed by the renowned architect Gustave Eiffel, the tower stands 330 meters tall and once housed the city's first observatory.\n\nWhile it's famously known for hosting over 7 million visitors annually, it was initially disliked by Parisians. Interestingly, the Eiffel Tower was used as to guide ships along the Seine during cloudy nights.`;

  // Load sample content function
  const loadSampleContent = () => {
    setArticleContent(sampleBlog);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen z-0">
      <div className="w-full text-center pt-12 pb-4 opacity-0 animate-fade-up [animation-delay:200ms]">
        <h1 className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-2 pb-4 tracking-tight">
          TruthLens 🔍
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed px-4">
          Paste text from ChatGPT, Gemini, or any AI — and we'll cross-reference every claim against Wikipedia, Wikidata, and the open web.
        </p>
      </div>

      <div className="flex justify-center mb-8 opacity-0 animate-fade-up [animation-delay:400ms]">
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full bg-white shadow-sm text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <span className="opacity-70">💡</span> How it works <ChevronDown size={14} />
        </button>
      </div>

      <main className="flex flex-col items-center flex-grow w-full max-w-4xl px-4 md:px-6">
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 opacity-0 animate-fade-up [animation-delay:600ms]">
          <h2 className="text-lg font-bold text-gray-800 mb-4">What did the AI say?</h2>
          
          <form onSubmit={factCheck} className="space-y-6 w-full">
            <textarea
              ref={textareaRef}
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              placeholder="Enter Your Content"
              className="w-full bg-white p-4 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-default resize-none min-h-[150px] max-h-[300px] overflow-auto transition-[height] duration-200 ease-in-out text-gray-700"
            />

            {/* Try Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-sm text-gray-400 font-medium">Try:</span>
              <button type="button" onClick={loadSampleContent} className="px-3 py-1.5 text-xs border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Eiffel Tower facts
              </button>
              <button type="button" onClick={loadSampleContent} className="px-3 py-1.5 text-xs border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Science claims
              </button>
              <button type="button" onClick={loadSampleContent} className="px-3 py-1.5 text-xs border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Historical events
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm flex items-center gap-2">
                <span className="text-red-500">⚠</span> {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-400 font-medium">
                 {articleContent.length > 0 ? `${articleContent.split(/[.!?]+/).filter(Boolean).length} sentences detected` : ''}
              </div>
              <button
                type="submit"
                className={`text-white font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                  isGenerating ? 'bg-gray-400' : 'bg-[#c27845] hover:bg-[#a66436]'
                }`}
                disabled={isGenerating}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                {isGenerating ? 'Checking...' : 'Check this text'}
              </button>
            </div>
          </form>
        </div>

        {isGenerating && (
          <div ref={loadingRef} className="w-full mt-8">
            <LoadingMessages isGenerating={isGenerating} />
          </div>
        )}

        {factCheckResults.length > 0 && (
          <div className="space-y-14 mt-8 w-full mb-20">
            <PreviewBox
              content={articleContent}
              claims={factCheckResults}
            />
            <div className="mt-4 pt-12 opacity-0 animate-fade-up [animation-delay:800ms]">
              <button
                onClick={() => setShowAllClaims(!showAllClaims)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                {showAllClaims ? (
                  <>
                    <span>Hide Claims</span>
                    <ChevronUp size={20} />
                  </>
                ) : (
                  <>
                    <span>Show All Claims</span>
                    <ChevronDown size={20} />
                  </>
                )}
              </button>

              {showAllClaims && (
                <div className="mt-4">
                  <ClaimsListResults results={factCheckResults} />
                </div>
              )}
            </div>
            <ShareButtons />
          </div>
        )}
      </main>
  
      <footer className="w-full py-8 text-center text-xs text-gray-400 mt-auto opacity-0 animate-fade-up [animation-delay:800ms]">
        <p className="mb-2">TruthLens — Multi-source verification using Wikipedia, Wikidata, and DuckDuckGo</p>
        <p>Cross-encoder NLI model: <code className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">nli-distilroberta-base</code></p>
      </footer>
    </div>
  );
}