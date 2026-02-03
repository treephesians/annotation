import { create } from "zustand";
import * as THREE from "three";

export type InteractionMode = "mouse" | "annotation";

export interface RayState {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  viewType: "perspective" | "side" | "topDown";
}

export interface Annotation {
  id: string;
  position: THREE.Vector3;
  size: number;
  label: string;
  timestamp: number;
}

interface AnnotationState {
  // Interaction mode (mouse vs annotation)
  interactionMode: InteractionMode;

  // Current ray (when in annotation mode)
  currentRay: RayState | null;
  currentDepth: number;
  rayFixed: boolean; // When true, ray doesn't follow mouse

  // Confirmed annotations
  annotations: Annotation[];

  // Actions
  toggleMode: () => void;
  setRay: (ray: RayState | null) => void;
  setDepth: (depth: number) => void;
  adjustDepth: (delta: number) => void;
  toggleRayFixed: () => void;
  confirmAnnotation: () => void;
  cancelAnnotation: () => void;
  deleteAnnotation: (id: string) => void;
  clearAll: () => void;
}

const DEFAULT_DEPTH = 10;
const MIN_DEPTH = 0.5;
const MAX_DEPTH = 50;
const DEPTH_STEP = 0.1;

export const useAnnotations = create<AnnotationState>((set, get) => ({
  interactionMode: "mouse",
  currentRay: null,
  currentDepth: DEFAULT_DEPTH,
  rayFixed: false,
  annotations: [],

  toggleMode: () =>
    set((state) => ({
      interactionMode: state.interactionMode === "mouse" ? "annotation" : "mouse",
      currentRay: null, // Clear ray when switching modes
      rayFixed: false,
    })),

  setRay: (ray) => {
    const { rayFixed } = get();
    if (rayFixed) return; // Don't update ray when fixed
    set({ currentRay: ray });
  },

  toggleRayFixed: () =>
    set((state) => ({
      rayFixed: state.currentRay ? !state.rayFixed : false,
    })),

  setDepth: (depth) =>
    set({
      currentDepth: Math.max(MIN_DEPTH, Math.min(MAX_DEPTH, depth)),
    }),

  adjustDepth: (delta) =>
    set((state) => ({
      currentDepth: Math.max(
        MIN_DEPTH,
        Math.min(MAX_DEPTH, state.currentDepth + delta * DEPTH_STEP)
      ),
    })),

  confirmAnnotation: () => {
    const { currentRay, currentDepth, annotations } = get();
    if (!currentRay) return;

    const position = new THREE.Vector3()
      .copy(currentRay.origin)
      .add(currentRay.direction.clone().multiplyScalar(currentDepth));

    const newAnnotation: Annotation = {
      id: crypto.randomUUID(),
      position,
      size: 0.2,
      label: `Point ${annotations.length + 1}`,
      timestamp: Date.now(),
    };

    set({
      annotations: [...annotations, newAnnotation],
      currentDepth: DEFAULT_DEPTH,
      // Keep ray active in annotation mode (don't clear it)
    });
  },

  cancelAnnotation: () =>
    set({
      currentRay: null,
      currentDepth: DEFAULT_DEPTH,
      rayFixed: false,
    }),

  deleteAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
    })),

  clearAll: () =>
    set({
      annotations: [],
      currentRay: null,
      currentDepth: DEFAULT_DEPTH,
      rayFixed: false,
      interactionMode: "mouse",
    }),
}));
