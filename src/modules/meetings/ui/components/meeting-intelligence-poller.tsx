"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function IntelligencePoller({ meetingId }: { meetingId: string }) {
  const router = useRouter();
  const [dots, setDots] = useState(".");

  useEffect(() => {
    // Animate the dots
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 600);

    // Poll every 5 seconds for the report
    const pollInterval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(pollInterval);
    };
  }, [router]);

  return (
    <div className="intel-processing">
      <div className="intel-processing-spinner" />
      <p className="intel-processing-text">Generating intelligence report{dots}</p>
      <p className="intel-processing-sub">
        AI is analyzing your meeting transcript. This usually takes 30–60 seconds.
      </p>
    </div>
  );
}