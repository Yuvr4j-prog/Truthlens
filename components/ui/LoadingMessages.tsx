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
    <div className="w-full mt-20 mb-40">
      <div className="text-secondary-accent/50 text-lg opacity-0 animate-fade-up [animation-delay:200ms]">
        {isGenerating ? loadingMessages[currentMessageIndex] : ""}
      </div>

      <div className="flex flex-col space-y-3 mt-6">
        <Skeleton className="h-[100px] rounded-none bg-secondary-accent opacity-0 animate-fade-up [animation-delay:400ms]" />
        <div className="space-y-2">
          <Skeleton className="h-4 rounded-none bg-secondary-accent opacity-0 animate-fade-up [animation-delay:500ms]" />
          <Skeleton className="h-4 rounded-none bg-secondary-accent opacity-0 animate-fade-up [animation-delay:600ms]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingMessages;