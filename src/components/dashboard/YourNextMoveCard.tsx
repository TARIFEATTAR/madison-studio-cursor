import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function YourNextMoveCard() {
  const navigate = useNavigate();
  const [nextMoveIndex, setNextMoveIndex] = useState(0);

  const nextMoveMessages = [
    "Refine 2 drafts in review & schedule 1 post for tomorrow.",
    "Your brand voice is strong today. Time to amplify.",
    "Schedule content for the week ahead to stay consistent.",
    "Review your pending drafts and polish before publishing.",
  ];

  // Rotate next move messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNextMoveIndex((prev) => (prev + 1) % nextMoveMessages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full p-4 md:p-6 bg-white border border-[#E0E0E0] rounded-xl min-h-[190px] md:min-h-[210px]">
      <div className="flex flex-col h-full justify-between">
        <div>
          <h3 className="text-sm font-medium text-[#1C150D]/60 mb-3">Your Next Move</h3>
          <p className="text-sm md:text-base text-[#1C150D] leading-relaxed">
            {nextMoveMessages[nextMoveIndex]}
          </p>
        </div>
        <Button
          size="default"
          className="bg-brand-brass hover:bg-[#A3865A] text-white mt-4 w-full md:w-fit min-h-[44px] touch-manipulation"
          onClick={() => navigate("/create")}
        >
          Take Action
        </Button>
      </div>
    </Card>
  );
}

