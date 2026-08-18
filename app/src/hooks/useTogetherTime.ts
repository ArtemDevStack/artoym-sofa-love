"use client";

import { useEffect, useState } from "react";
import { computeTogether, type TogetherTime } from "@/lib/time";
import { relationship } from "@/data/relationship";

const START = new Date(relationship.startDate);

/** Живой счётчик «мы вместе уже» — пересчитывается каждую секунду. */
export function useTogetherTime(): TogetherTime | null {
  const [time, setTime] = useState<TogetherTime | null>(null);

  useEffect(() => {
    const tick = () => setTime(computeTogether(START, new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}
