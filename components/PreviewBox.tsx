// PreviewBox.tsx
import React, { useState } from 'react';
import { Copy, CheckCheck } from 'lucide-react';

interface Claim {
  claim: string;
  assessment: string;
  summary: string;
  original_text: string;
  fixed_original_text: string;
  confidence_score: number;
  url_sources?: string[];
}

interface PreviewBoxProps {
  content: string;
  claims: Claim[];
}

const PreviewBox: React.FC<PreviewBoxProps> = ({ content, claims }) => {
  const [displayText, setDisplayText] = useState(content);
  const [copied, setCopied] = useState(false);
  // Filter out unverifiable claims
  const filteredClaims = claims.filter((claim) => {
    const lower = claim.assessment.toLowerCase();
    return !lower.includes('insufficient') && !lower.includes('unverified');
  });

  const highlightClaims = () => {
    let segments = [];
    let lastIndex = 0;

    const sortedClaims = [...filteredClaims].sort((a, b) => {
      return displayText.indexOf(a.original_text) - displayText.indexOf(b.original_text);
    });

    sortedClaims.forEach((claim) => {
      const index = displayText.indexOf(claim.original_text, lastIndex);
      if (index !== -1) {
        const previousText = displayText.substring(lastIndex, index);
        segments.push(
          previousText.split('\n').map((line, i) => (
            <React.Fragment key={`text-${lastIndex}-${i}`}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))
        );

        const lower = claim.assessment.toLowerCase();
        const isTrue = lower.includes('true');
        const isUnverified = lower.includes('insufficient') || lower.includes('unverified');
        
        let borderClass, bgClass;
        if (isTrue) {
          borderClass = 'border-green-500'; bgClass = 'bg-green-950/20';
        } else if (isUnverified) {
          borderClass = 'border-amber-500'; bgClass = 'bg-amber-950/20';
        } else {
          borderClass = 'border-red-500'; bgClass = 'bg-red-950/20';
        }
        
        segments.push(
          <span
            key={`claim-${index}`}
            className={`border-b-2 ${borderClass} ${bgClass}`}
          >
            {claim.original_text}
          </span>
        );
        lastIndex = index + claim.original_text.length;
      }
    });

    const remainingText = displayText.substring(lastIndex);
    segments.push(
      remainingText.split('\n').map((line, i) => (
        <React.Fragment key={`text-end-${i}`}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))
    );

    return segments;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 w-full">

      {/* Preview Box */}
      <div className="relative">
        <div className="w-full min-h-[200px] p-6 bg-[#141414] text-gray-200 border border-gray-800 rounded-xl shadow-sm opacity-0 animate-fade-up [animation-delay:200ms]">
          {highlightClaims()}
        </div>
        
        {/* Copy Button */}
        <div className="flex justify-end mt-3 mb-10 mr-5 opacity-0 animate-fade-up [animation-delay:400ms]">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white"
          >
            {copied ? (
              <>
                <CheckCheck size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy all text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewBox;