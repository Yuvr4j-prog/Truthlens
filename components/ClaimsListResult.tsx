import React from 'react';
import { ChevronRight } from 'lucide-react';
import Carousel from './ui/Carousel';

interface ClaimsListResult {
  claim: string;
  assessment: string;
  summary: string;
  fixed_original_text: string;
  confidence_score: number;
  url_sources?: string[];
}

interface ClaimsListResultsProps {
  results: ClaimsListResult[];
}

const ClaimsListResults: React.FC<ClaimsListResultsProps> = ({ results }) => {
  const getCardStyle = (assessment: string) => {
    const lower = assessment.toLowerCase();
    const isTrue = lower.includes('true');
    const isUnverified = lower.includes('insufficient') || lower.includes('unverified');
    
    if (isTrue) {
      return { 
        bg: 'bg-green-50/70', 
        border: 'border-green-200', 
        text: 'text-green-900', 
        badgeText: 'text-green-800', 
        badgeBg: 'bg-green-100/50', 
        icon: '✅', 
        label: 'Supported' 
      };
    } else if (isUnverified) {
      return { 
        bg: 'bg-amber-50/70', 
        border: 'border-amber-200', 
        text: 'text-amber-900', 
        badgeText: 'text-amber-800', 
        badgeBg: 'bg-amber-100/50', 
        icon: '⚠️', 
        label: 'Insufficient Info' 
      };
    } else {
      return { 
        bg: 'bg-red-50/70', 
        border: 'border-red-200', 
        text: 'text-red-900', 
        badgeText: 'text-red-800', 
        badgeBg: 'bg-red-100/50', 
        icon: '❌', 
        label: 'Refuted' 
      };
    }
  };

  return (
    <div className="w-full mt-4">
      <Carousel>
        {results.map((result, index) => {
          const style = getCardStyle(result.assessment);
          return (
            <div key={index} className={`w-full h-full flex flex-col justify-between max-w-2xl mx-auto rounded-3xl border p-8 shadow-sm space-y-6 ${style.bg} ${style.border}`}>
              
              <div className="flex items-start justify-between gap-4">
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${style.badgeBg} ${style.badgeText} border ${style.border}`}>
                  <span className="mr-2 text-sm">{style.icon}</span>
                  {style.label}
                </span>
                <span className={`text-sm font-medium ${style.badgeText} opacity-80 bg-white/40 px-3 py-1 rounded-full border ${style.border}`}>
                  {result.confidence_score}% Confident
                </span>
              </div>

              <h3 className={`font-serif text-2xl md:text-3xl leading-snug font-medium ${style.text}`}>{result.claim}</h3>
              
              <p className={`text-base leading-relaxed opacity-90 ${style.text}`}>{result.summary}</p>
              
              <div className={`pt-6 border-t ${style.border}`}>
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${style.text}`}>Sources</span>
                </div>
                
                <ul className={`space-y-3 pl-4 border-l-2 ${style.border}`}>
                  {result.url_sources && result.url_sources.length > 0 ? (
                    result.url_sources.map((source, idx) => (
                      <li key={idx}>
                        <a 
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`hover:underline text-sm break-all opacity-80 hover:opacity-100 font-medium transition-opacity flex items-center gap-2 ${style.text}`}
                        >
                          <ChevronRight size={14} className="flex-shrink-0" />
                          {source}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className={`text-sm italic opacity-60 ${style.text}`}>No sources found — this claim could not be verified</li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
};

export default ClaimsListResults;