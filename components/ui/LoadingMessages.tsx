import { useEffect, useState } from "react";
import { Skeleton } from "./skeleton";

type LoadingMessagesProps = {
  isGenerating: boolean;
};

const loadingMessages = [
  "🔍\u00A0\u00A0Analyzing Your Content...",
  "📝\u00A0\u00A0Extracting Key Claims...",
  "📚\u00A0\u00A0Searching for Reliable Sources...",
  "🔍\u00A0\u00A0Verifying Each Claim for Accuracy...",
  "📊\u00A0\u00A0Generating Your Results...",
  "Almost there...\u00A0\u00A0🎉",
];

const LoadingMessages: React.FC<LoadingMessagesProps> = ({ isGenerating }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isGenerating) {
      setCurrentMessageIndex(0);

      // Set interval to change the message every 1-3 seconds
      intervalId = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;

          if (nextIndex < loadingMessages.length) {
            return nextIndex;
          } else {
            clearInterval(intervalId);
            return prevIndex;
          }
        });
      }, Math.floor(Math.random() * 9000) + 3000);
    } else {
      setCurrentMessageIndex(0);
    }

    return () => clearInterval(intervalId);
  }, [isGenerating]);

  return (
    <div className="w-full mt-10 mb-20">
      <div className="flex items-center gap-4 text-gray-400 font-medium text-sm md:text-base opacity-0 animate-fade-up [animation-delay:200ms] mb-6">
        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="animate-pulse font-mono tracking-tight">{isGenerating ? loadingMessages[currentMessageIndex] : ""}</span>
      </div>

      <div className="flex flex-col space-y-5">
        <Skeleton className="h-32 w-full rounded-xl bg-gray-800/50 opacity-0 animate-fade-up [animation-delay:400ms]" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-4/5 rounded-md bg-gray-800/50 opacity-0 animate-fade-up [animation-delay:500ms]" />
          <Skeleton className="h-5 w-2/3 rounded-md bg-gray-800/50 opacity-0 animate-fade-up [animation-delay:600ms]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingMessages;