import React from 'react';
import { ChevronRight } from 'lucide-react';

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
  const getStatusBadge = (assessment: string) => {
    const lower = assessment.toLowerCase();
    const isTrue = lower.includes('true');
    const isUnverified = lower.includes('insufficient') || lower.includes('unverified');
    
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
      <span 
        className={`inline-flex items-center px-3 py-1 rounded-none text-sm font-medium ${bgColor} ${textColor} border ${borderColor}`}
      >
        <span className="mr-2">{icon}</span>
        {label}
      </span>
    );
  };

  return (
    <div className="mt-6 w-full bg-white p-6 border rounded-none shadow-sm space-y-16">
      {results
      .filter((result) => {
        const lower = result.assessment.toLowerCase();
        return !lower.includes('insufficient') && !lower.includes('unverified');
      })
      .map((result, index) => (
        <div key={index} className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900">{result.claim}</h3>
          
          <div className="flex items-center space-x-3">
            {getStatusBadge(result.assessment)}
            <span className="text-gray-600 text-sm">
              {result.confidence_score}% Confident
            </span>
          </div>
          
          <p className="text-gray-700 mt-2">{result.summary}</p>
          
          <div className="mt-4">
            <div className="flex items-center space-x-2 text-gray-700 mb-2">
              <ChevronRight size={20} />
              <span className="font-medium">Sources</span>
            </div>
            
            <ul className="space-y-2 pl-6">
              {result.url_sources && result.url_sources.length > 0 ? (
                result.url_sources.map((source, idx) => (
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
        </div>
      ))}
    </div>
  );
};

export default ClaimsListResults;