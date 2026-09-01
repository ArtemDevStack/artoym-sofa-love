"use client";

import { useCallback, useEffect, useState } from "react";
import { MotionProvider } from "@/lib/motion";
import { SecretsProvider } from "@/hooks/useSecrets";
import { ScrollTrigger } from "@/lib/gsap";

import Preloader from "@/components/Preloader";
import PrivateEntry from "@/components/PrivateEntry";
import CustomCursor from "@/components/CustomCursor";
import MusicPlayer from "@/components/MusicPlayer";
import ScrollProgress from "@/components/ScrollProgress";

import Intro from "@/sections/Intro";
import Timeline from "@/sections/Timeline";
import PhotoStack from "@/sections/PhotoStack";
import FilmStrip from "@/sections/FilmStrip";
import MemoryCollage from "@/sections/MemoryCollage";
import Counter from "@/sections/Counter";
import FirstMonth from "@/sections/FirstMonth";
import MonthLetter from "@/sections/MonthLetter";
import NextMeeting from "@/sections/NextMeeting";
import HugCounter from "@/sections/HugCounter";
import OurNumbers from "@/sections/OurNumbers";
import OurPlaces from "@/sections/OurPlaces";
import OnlyWeUnderstand from "@/sections/OnlyWeUnderstand";
import AiKnowledge from "@/sections/AiKnowledge";
import Reasons from "@/sections/Reasons";
import Letters from "@/sections/Letters";
import LoveLetter from "@/sections/LoveLetter";
import Future from "@/sections/Future";
import FinalScene from "@/sections/FinalScene";
import SecretFinal from "@/sections/SecretFinal";

import { MediaProvider } from "@/context/MediaContext";
import MediaModal from "@/components/MediaModal";
import EditModeToggle from "@/components/EditModeToggle";
import EditPinModal from "@/components/EditPinModal";

type Phase = "loading" | "entry" | "story";

export default function Page() {
  return (
    <MotionProvider>
      <SecretsProvider>
        <MediaProvider>
          <Experience />
        </MediaProvider>
      </SecretsProvider>
    </MotionProvider>
  );
}

function Experience() {
  const [phase, setPhase] = useState<Phase>("loading");

  // Скролл заблокирован, пока не пройден вход
  useEffect(() => {
    document.body.style.overflow = phase === "story" ? "" : "hidden";
    if (phase === "story") {
      // Размеры стабилизировались после ухода оверлея — пересчитываем триггеры
      const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
      return () => window.clearTimeout(id);
    }
  }, [phase]);

  const handleLoaded = useCallback(() => setPhase("entry"), []);
  const handleUnlock = useCallback(() => setPhase("story"), []);

  const entered = phase !== "loading";

  return (
    <>
      {phase === "loading" && <Preloader onDone={handleLoaded} />}

      {entered && (
        <main>
          <Intro />
          <Timeline />
          <PhotoStack />
          <FilmStrip />
          <MemoryCollage />
          <Counter />
          <FirstMonth />
          <MonthLetter />
          <NextMeeting />
          <OurNumbers />
          <OurPlaces />
          <OnlyWeUnderstand />
          <AiKnowledge />
          <Reasons />
          <Letters />
          <LoveLetter />
          <Future />
          <HugCounter />
          <SecretFinal />
          <FinalScene />
        </main>
      )}

      {phase === "entry" && <PrivateEntry onUnlock={handleUnlock} />}

      {phase === "story" && (
        <>
          <CustomCursor />
          <ScrollProgress />
          <MusicPlayer />
          <MediaModal />
          <EditModeToggle />
          <EditPinModal />
        </>
      )}
    </>
  );
}
