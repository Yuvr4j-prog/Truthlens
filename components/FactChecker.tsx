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
    <div className="flex flex-col min-h-screen z-0 relative w-full">
      {/* Texture Overlay */}
      <div className="bg-grain absolute inset-0 pointer-events-none opacity-50 mix-blend-multiply"></div>

      <div className="flex justify-between items-center w-full max-w-5xl mx-auto pt-8 px-6 opacity-0 animate-fade-up">
        <div className="text-sm font-bold tracking-widest uppercase text-gray-400">
          AI Fact Checker
        </div>
        <Link href="/verify-document" className="text-white font-medium bg-gray-900 hover:bg-gray-800 hover:-translate-y-0.5 px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-sm group">
          Verify Document <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
        </Link>
      </div>

      <div className="w-full max-w-5xl mx-auto pt-20 pb-12 px-6 opacity-0 animate-fade-up [animation-delay:200ms]">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-4">
          Truth<span className="font-light font-serif italic text-gray-500">Lens.</span>
        </h1>
        <p className="text-2xl md:text-3xl font-serif text-gray-500 max-w-2xl leading-snug">
          Don't trust. <span className="italic">Verify.</span>
        </p>
      </div>

      <main className="flex flex-col flex-grow w-full max-w-5xl mx-auto px-6 pb-12">
        {/* HOW IT WORKS / TRY THESE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full mb-4 opacity-0 animate-fade-up [animation-delay:400ms]">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 md:mb-0">
            Verify Any Claim
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 mr-2 uppercase tracking-wider">Examples:</span>
            <button type="button" onClick={loadSampleContent} className="px-4 py-1.5 text-xs font-medium bg-[#141414] border border-gray-800 rounded-full text-gray-400 hover:bg-gray-900 hover:text-gray-200 hover:-translate-y-0.5 transition-all shadow-sm">
              Eiffel Tower
            </button>
            <button type="button" onClick={loadSampleContent} className="px-4 py-1.5 text-xs font-medium bg-[#141414] border border-gray-800 rounded-full text-gray-400 hover:bg-gray-900 hover:text-gray-200 hover:-translate-y-0.5 transition-all shadow-sm">
              Science Claims
            </button>
            <button type="button" onClick={loadSampleContent} className="px-4 py-1.5 text-xs font-medium bg-[#141414] border border-gray-800 rounded-full text-gray-400 hover:bg-gray-900 hover:text-gray-200 hover:-translate-y-0.5 transition-all shadow-sm">
              History
            </button>
          </div>
        </div>

        <div className="w-full bg-[#141414] rounded-2xl rounded-tr-none shadow-sm border border-gray-800 p-6 opacity-0 animate-fade-up [animation-delay:600ms]">
          <form onSubmit={factCheck} className="flex flex-col w-full h-full relative">
            <textarea
              ref={textareaRef}
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              placeholder="Paste text from ChatGPT, Gemini, or any AI to cross-reference against Wikipedia, Wikidata, and the open web..."
              className="w-full bg-transparent p-2 outline-none resize-none min-h-[160px] max-h-[400px] overflow-auto transition-[height] duration-200 ease-in-out text-gray-200 text-lg leading-relaxed placeholder:text-gray-600"
            />

            {error && (
              <div className="mt-4 p-4 bg-red-950/50 border-l-2 border-red-800 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-6 mt-2">
              <div className="text-xs font-mono text-gray-500">
                 {articleContent.length > 0 ? `${articleContent.split(/[.!?]+/).filter(Boolean).length} sentences` : '0 sentences'}
              </div>
              <button
                type="submit"
                className={`text-gray-900 font-medium px-6 py-3 rounded-xl rounded-br-none transition-all flex items-center gap-2 text-sm shadow-sm ${
                  isGenerating ? 'bg-gray-600 cursor-not-allowed text-gray-400' : 'bg-white hover:bg-gray-200 hover:-translate-y-0.5'
                }`}
                disabled={isGenerating}
              >
                {isGenerating ? 'Analyzing...' : 'Verify Text'}
                {!isGenerating && <span className="ml-1">→</span>}
              </button>
            </div>
          </form>
        </div>

        {isGenerating && (
          <div ref={loadingRef} className="w-full mt-12 mb-12">
            <LoadingMessages isGenerating={isGenerating} />
          </div>
        )}

        {factCheckResults.length > 0 && (
          <div className="space-y-12 mt-16 w-full mb-24">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-4 border-b border-gray-800 pb-2">
              Analysis Results
            </div>
            <PreviewBox
              content={articleContent}
              claims={factCheckResults}
            />
            <div className="mt-8 pt-8 opacity-0 animate-fade-up [animation-delay:800ms]">
              <button
                onClick={() => setShowAllClaims(!showAllClaims)}
                className="group flex items-center space-x-2 text-gray-400 hover:text-white font-serif italic text-lg transition-colors"
              >
                {showAllClaims ? (
                  <>
                    <span className="border-b border-transparent group-hover:border-white transition-colors">Hide detailed claims</span>
                    <ChevronUp size={18} />
                  </>
                ) : (
                  <>
                    <span className="border-b border-transparent group-hover:border-white transition-colors">Show detailed claims</span>
                    <ChevronDown size={18} />
                  </>
                )}
              </button>

              {showAllClaims && (
                <div className="mt-8">
                  <ClaimsListResults results={factCheckResults} />
                </div>
              )}
            </div>
            <div className="pt-8">
              <ShareButtons />
            </div>
          </div>
        )}
      </main>
  
      <footer className="w-full max-w-5xl mx-auto px-6 py-12 text-xs text-gray-500 mt-auto opacity-0 animate-fade-up [animation-delay:800ms] flex flex-col md:flex-row justify-between items-start md:items-center">
        <p className="mb-2 md:mb-0">TruthLens © 2026</p>
        <p>Engine: <code className="bg-[#141414] border border-gray-800 text-gray-400 px-2 py-1 rounded-md font-mono text-[10px]">nli-distilroberta-base</code></p>
      </footer>
    </div>
  );
}