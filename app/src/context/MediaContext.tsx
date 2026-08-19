"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  loadAllMediaOverrides,
  removeMediaOverride,
  saveMediaOverride,
} from "@/lib/mediaStorage";

export interface MediaItem {
  src: string;
  type: "image" | "video";
  isOverridden?: boolean;
}

interface MediaContextType {
  getMedia: (originalSrc: string, defaultType?: "image" | "video") => MediaItem;
  openEditor: (originalSrc: string, defaultType?: "image" | "video") => void;
  closeEditor: () => void;
  replaceMedia: (
    originalSrc: string,
    fileOrUrl: File | string,
    type: "image" | "video"
  ) => Promise<void>;
  resetMedia: (originalSrc: string) => Promise<void>;
  editingTarget: { originalSrc: string; defaultType: "image" | "video" } | null;
  isEditMode: boolean;
  toggleEditMode: () => void;
  isPinModalOpen: boolean;
  closePinModal: () => void;
  authorizeEdit: (pin: string) => boolean;
  isEditAuthorized: boolean;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<
    Record<string, { src: string; type: "image" | "video" }>
  >({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isEditAuthorized, setIsEditAuthorized] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [editingTarget, setEditingTarget] = useState<{
    originalSrc: string;
    defaultType: "image" | "video";
  } | null>(null);

  useEffect(() => {
    loadAllMediaOverrides().then((data) => {
      if (data) setOverrides(data);
    });
    const savedAuth = localStorage.getItem("love_landing_edit_authorized");
    if (savedAuth === "true") {
      setIsEditAuthorized(true);
      const savedMode = localStorage.getItem("love_landing_edit_mode");
      if (savedMode === "true") {
        setIsEditMode(true);
      }
    }
  }, []);

  const toggleEditMode = useCallback(() => {
    if (!isEditAuthorized) {
      setIsPinModalOpen(true);
      return;
    }
    setIsEditMode((prev) => {
      const next = !prev;
      localStorage.setItem("love_landing_edit_mode", String(next));
      return next;
    });
  }, [isEditAuthorized]);

  const authorizeEdit = useCallback((pin: string): boolean => {
    if (pin.trim() === "237") {
      setIsEditAuthorized(true);
      setIsEditMode(true);
      setIsPinModalOpen(false);
      localStorage.setItem("love_landing_edit_authorized", "true");
      localStorage.setItem("love_landing_edit_mode", "true");
      return true;
    }
    return false;
  }, []);

  const closePinModal = useCallback(() => {
    setIsPinModalOpen(false);
  }, []);

  const getMedia = useCallback(
    (originalSrc: string, defaultType: "image" | "video" = "image"): MediaItem => {
      if (!originalSrc) return { src: "", type: defaultType, isOverridden: false };
      const custom = overrides[originalSrc];
      if (custom) {
        return { src: custom.src, type: custom.type, isOverridden: true };
      }
      return { src: originalSrc, type: defaultType, isOverridden: false };
    },
    [overrides]
  );

  const openEditor = useCallback(
    (originalSrc: string, defaultType: "image" | "video" = "image") => {
      setEditingTarget({ originalSrc, defaultType });
    },
    []
  );

  const closeEditor = useCallback(() => {
    setEditingTarget(null);
  }, []);

  const replaceMedia = useCallback(
    async (
      originalSrc: string,
      fileOrUrl: File | string,
      type: "image" | "video"
    ) => {
      let finalSrc = "";
      if (typeof fileOrUrl === "string") {
        finalSrc = fileOrUrl;
      } else {
        // Read file as Data URL
        finalSrc = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(fileOrUrl);
        });
      }

      await saveMediaOverride(originalSrc, finalSrc, type);
      setOverrides((prev) => ({
        ...prev,
        [originalSrc]: { src: finalSrc, type },
      }));
      setEditingTarget(null);
    },
    []
  );

  const resetMedia = useCallback(async (originalSrc: string) => {
    await removeMediaOverride(originalSrc);
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[originalSrc];
      return next;
    });
    setEditingTarget(null);
  }, []);

  return (
    <MediaContext.Provider
      value={{
        getMedia,
        openEditor,
        closeEditor,
        replaceMedia,
        resetMedia,
        editingTarget,
        isEditMode,
        toggleEditMode,
        isPinModalOpen,
        closePinModal,
        authorizeEdit,
        isEditAuthorized,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia(): MediaContextType {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error("useMedia должен использоваться внутри MediaProvider");
  }
  return ctx;
}
