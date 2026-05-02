"use client";

import React from 'react';

interface DocumentVerifyResultProps {
  result: {
    claim?: string;
    verdict: "True" | "False" | "Insufficient Information";
    confidence_score: number;
    summary: string;
    relevant_excerpt: string;
  };
}

export default function DocumentVerifyResult({ result }: DocumentVerifyResultProps) {
  const { verdict, confidence_score, summary, relevant_excerpt } = result;

  let style;
  if (verdict === "True") {
    style = { 
      bg: 'bg-green-50/70', 
      border: 'border-green-200', 
      text: 'text-green-900', 
      badgeText: 'text-green-800', 
      badgeBg: 'bg-green-100/50', 
      icon: '✅', 
      label: 'Supported by Document' 
    };
  } else if (verdict === "Insufficient Information") {
    style = { 
      bg: 'bg-amber-50/70', 
      border: 'border-amber-200', 
      text: 'text-amber-900', 
      badgeText: 'text-amber-800', 
      badgeBg: 'bg-amber-100/50', 
      icon: '⚠️', 
      label: 'Insufficient Info' 
    };
  } else {
    style = { 
      bg: 'bg-red-50/70', 
      border: 'border-red-200', 
      text: 'text-red-900', 
      badgeText: 'text-red-800', 
      badgeBg: 'bg-red-100/50', 
      icon: '❌', 
      label: 'Refuted by Document' 
    };
  }

  const confidencePercentage = Math.round(confidence_score * 100);

  return (
    <div className={`w-full h-full flex flex-col max-w-2xl mx-auto rounded-3xl border p-8 shadow-sm space-y-6 ${style.bg} ${style.border}`}>
      
      <div className="flex items-start justify-between gap-4">
        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${style.badgeBg} ${style.badgeText} border ${style.border}`}>
          <span className="mr-2 text-sm">{style.icon}</span>
          {style.label}
        </span>
        <div className={`flex items-center gap-3 bg-white/40 px-3 py-1.5 rounded-full border ${style.border}`}>
            <span className={`text-xs font-medium ${style.badgeText}`}>
                {confidencePercentage}% Confident
            </span>
            <div className="w-16 h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div 
                    className={`h-full opacity-70 ${verdict === 'True' ? 'bg-green-600' : verdict === 'False' ? 'bg-red-600' : 'bg-amber-600'}`} 
                    style={{ width: `${confidencePercentage}%` }} 
                />
            </div>
        </div>
      </div>

      <h3 className={`font-serif text-2xl md:text-3xl leading-snug font-medium ${style.text}`}>{result.claim || "Verification Result"}</h3>

      <div className="pt-2">
        <h4 className={`text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2 ${style.text}`}>Summary</h4>
        <p className={`text-base leading-relaxed opacity-90 ${style.text}`}>{summary}</p>
      </div>

      {verdict !== "Insufficient Information" && relevant_excerpt && relevant_excerpt.trim() !== "" && (
        <div className={`pt-6 border-t ${style.border}`}>
          <h4 className={`text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3 ${style.text}`}>Relevant Excerpt</h4>
          <blockquote className={`border-l-2 pl-4 py-1 italic text-sm opacity-80 ${style.border} ${style.text}`}>
            {relevant_excerpt}
          </blockquote>
        </div>
      )}
    </div>
  );
}
