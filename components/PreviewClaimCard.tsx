// PreviewClaimCard.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Claim {
  claim: string;
  assessment: string;
  summary: string;
  original_text: string;
  fixed_original_text: string;
  confidence_score: number;
  url_sources?: string[];
}

interface PreviewClaimCardProps {
  claim: Claim;
  onAcceptFix: (claim: Claim) => void;
}

export const PreviewClaimCard: React.FC<PreviewClaimCardProps> = ({ claim, onAcceptFix }) => {
  const lower = claim.assessment.toLowerCase();
  const isTrue = lower.includes('true');
  const isUnverified = lower.includes('insufficient') || lower.includes('unverified');
  const hasFix = !isUnverified && claim.fixed_original_text !== claim.original_text;

  let bgColor, textColor, borderColor, icon, label;
  if (isTrue) {
    bgColor = 'bg-green-100'; textColor = 'text-green-800'; borderColor = 'border-green-200';
    icon = '✅'; label = 'Supported';
  } else if (isUnverified) {
    bgColor = 'bg-amber-100'; textColor = 'text-amber-800'; borderColor = 'border-amber-200';
    icon = '⚠️'; label = 'Unverified';
  } else {
    bgColor = 'bg-red-100'; textColor = 'text-red-800'; borderColor = 'border-red-200';
    icon = '❌'; label = 'Refuted';
  }

  return (
    <div className="bg-white border rounded-none shadow-sm p-6 space-y-4 opacity-0 animate-fade-up [animation-delay:600ms]">
      <h3 className="font-semibold text-lg text-gray-900">{claim.claim}</h3>

      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-none text-sm font-medium ${bgColor} ${textColor} border ${borderColor}`}
        >
          <span className="mr-2">{icon}</span>
          {label}
        </span>
        <span className="text-gray-600 text-sm">
          {claim.confidence_score}% Confident
        </span>
      </div>

      <p className="text-gray-700">{claim.summary}</p>

      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2 text-gray-700">
          <ChevronRight size={20} />
          <span className="font-medium">Sources</span>
        </div>
        
        <ul className="space-y-2 pl-6">
          {claim.url_sources && claim.url_sources.length > 0 ? (
            claim.url_sources.map((source, idx) => (
              <li key={idx}>
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                >
                  {source}
                </a>
              </li>
            ))
          ) : (
            <li className="text-amber-600 italic">No sources found — this claim could not be verified</li>
          )}
        </ul>
      </div>

      {hasFix && (
        <div className="pt-5 space-y-2">
            <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Suggested Fix</span>
            </div>
                <div className="space-y-2 pb-2">
                    <p className="text-gray-500 line-through">{claim.original_text}</p>
                    <p className="text-green-700">{claim.fixed_original_text}</p>
                </div>
                <button
                    onClick={() => onAcceptFix(claim)}
                    className="w-full mt-4 px-4 py-2 bg-brand-default text-white font-semibold rounded-none hover:ring-1 transition-colors"
                    >
                    Accept Fix
                </button>
        </div>
        )}

    </div>
  );
};