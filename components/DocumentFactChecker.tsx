"use client";

import { useState, useRef, FormEvent } from "react";
import DocumentVerifyResult from "./DocumentVerifyResult";
import * as mammoth from "mammoth";
import { UploadCloud, FileText } from "lucide-react";
import Carousel from "./ui/Carousel";

export default function DocumentFactChecker() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [claim, setClaim] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResults([]);

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds maximum size of 10MB");
      return;
    }

    // Validate type
    const validTypes = [
      "text/plain", 
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      setError("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    setUploadedFile(file);
    setIsLoading(true);

    try {
      let text = "";
      
      if (file.type === "text/plain" || file.name.endsWith('.txt')) {
        text = await file.text();
      } else if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          text += strings.join(" ") + " ";
        }
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
        file.name.endsWith('.docx')
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const docResult = await mammoth.extractRawText({ arrayBuffer });
        text = docResult.value;
      }

      setExtractedText(text.trim());
    } catch (err: any) {
      console.error(err);
      setError("Failed to extract text from the document. " + (err.message || ""));
      setUploadedFile(null);
      setExtractedText("");
    } finally {
      setIsLoading(false);
    }
  };

  const extractClaims = async (content: string) => {
    const response = await fetch('/api/extractclaims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract claims.');
    }
  
    const data = await response.json();
    return Array.isArray(data.claims) ? data.claims : JSON.parse(data.claims);
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!extractedText) {
      setError("Please upload a valid document first.");
      return;
    }
    
    if (!claim.trim()) {
      setError("Please enter a claim to verify.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      // 1. Extract individual claims
      const claimsArray = await extractClaims(claim);
      const verifiedResults: any[] = [];
      
      // 2. Process claims sequentially to avoid rate limits
      for (const { claim: extractedClaim } of claimsArray) {
        // Wait 5 seconds between requests for Gemini rate limits (as done in main FactChecker)
        if (verifiedResults.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        try {
          const response = await fetch("/api/documentverifyclaim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claim: extractedClaim, documentText: extractedText }),
          });

          if (!response.ok) {
            console.error("Verification failed for claim:", extractedClaim);
            continue;
          }

          const data = await response.json();
          verifiedResults.push({ ...data, claim: extractedClaim });
          setResults([...verifiedResults]);
        } catch (error) {
          console.error("Failed to verify claim:", extractedClaim, error);
        }
      }

      if (verifiedResults.length === 0) {
        setError("Could not verify any claims. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full bg-[#141414] rounded-2xl shadow-sm border border-gray-800 p-6 md:p-8 opacity-0 animate-fade-up [animation-delay:600ms]">
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">Verify Against Document</h2>
        
        <form onSubmit={handleVerify} className="space-y-8 w-full flex flex-col">
          {/* File Upload Zone */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">1. Source of Truth</label>
            <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${uploadedFile && extractedText ? 'border-white bg-gray-900' : 'border-gray-700 bg-transparent hover:bg-gray-900 hover:border-gray-500'}`}
                onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
              
              {isLoading && !uploadedFile ? (
                  <div className="text-gray-500 text-sm animate-pulse font-medium">Processing document...</div>
              ) : uploadedFile && extractedText ? (
                <>
                  <FileText className="w-8 h-8 text-white mb-3" />
                  <p className="text-sm font-bold text-white">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{extractedText.length.toLocaleString()} characters extracted</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-3">Click to replace</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-gray-500 mb-3" />
                  <p className="text-sm font-medium text-gray-400">Upload PDF, DOCX, or TXT</p>
                  <p className="text-xs text-gray-500 mt-1">Up to 10MB</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">2. Claim to Verify</label>
              <textarea
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="What do you want to verify against this document?"
                className="w-full bg-transparent p-4 border border-gray-800 rounded-xl outline-none focus:border-gray-600 focus:ring-0 resize-none min-h-[120px] text-gray-200 text-lg leading-relaxed placeholder:text-gray-600 transition-colors"
              />
          </div>

          {error && (
            <div className="p-4 bg-red-950/50 border-l-2 border-red-800 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end pt-4 border-t border-gray-800">
            <button
              type="submit"
              className={`text-gray-900 font-medium px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-sm shadow-sm ${
                isLoading || (!extractedText) || (!claim.trim()) ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-200 hover:-translate-y-0.5'
              }`}
              disabled={isLoading || !extractedText || !claim.trim()}
            >
              {isLoading ? 'Processing...' : 'Verify Claim'}
              {!isLoading && <span className="ml-1">→</span>}
            </button>
          </div>
        </form>
      </div>

      {results.length > 0 && (
        <div className="mt-12 w-full opacity-0 animate-fade-up [animation-delay:200ms]">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-6 border-b border-gray-800 pb-2">
            Verification Results
          </div>
          <Carousel>
            {results.map((res, index) => (
              <DocumentVerifyResult key={index} result={res} />
            ))}
          </Carousel>
        </div>
      )}
    </div>
  );
}
