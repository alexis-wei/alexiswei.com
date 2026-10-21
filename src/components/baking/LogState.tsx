"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { setMediaStep } from "@/app/baking/actions";
import type { Media, TimelineStep } from "@/lib/baking/types";
import { track } from "./autosave";

/**
 * The log page's steps and photos, shared by the timeline and the gallery so
 * attaching a photo to a step (from either side) shows up in both at once.
 */
type LogState = {
  steps: TimelineStep[];
  setSteps: Dispatch<SetStateAction<TimelineStep[]>>;
  media: Media[];
  setMedia: Dispatch<SetStateAction<Media[]>>;
  /** Attaches a photo to a step (or detaches it with null), saving it. */
  linkMedia: (mediaId: string, stepId: string | null) => Promise<void>;
  /** The timeline's "edit" mode: shows drag handles and delete buttons. */
  arranging: boolean;
  setArranging: Dispatch<SetStateAction<boolean>>;
};

const Context = createContext<LogState | null>(null);

export function LogStateProvider({
  initialSteps,
  initialMedia,
  children,
}: {
  initialSteps: TimelineStep[];
  initialMedia: Media[];
  children: React.ReactNode;
}) {
  const [steps, setSteps] = useState(initialSteps);
  const [media, setMedia] = useState(initialMedia);
  const [arranging, setArranging] = useState(false);

  async function linkMedia(mediaId: string, stepId: string | null) {
    const previous = media.find((m) => m.id === mediaId)?.stepId ?? null;
    const set = (value: string | null) =>
      setMedia((list) =>
        list.map((m) => (m.id === mediaId ? { ...m, stepId: value } : m)),
      );
    set(stepId);
    try {
      await track(setMediaStep(mediaId, stepId));
    } catch {
      set(previous);
    }
  }

  return (
    <Context.Provider
      value={{
        steps,
        setSteps,
        media,
        setMedia,
        linkMedia,
        arranging,
        setArranging,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useLogState() {
  const state = useContext(Context);
  if (!state) throw new Error("useLogState needs a LogStateProvider");
  return state;
}

/** "Step 3 · bake 11 min": how a step is named in pickers and on photos. */
export function stepLabel(steps: TimelineStep[], stepId: string | null) {
  const index = steps.findIndex((s) => s.id === stepId);
  if (index < 0) return null;
  const text = steps[index].text.trim();
  return `step ${index + 1}${text ? ` · ${text}` : ""}`;
}
