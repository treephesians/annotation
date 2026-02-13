import { create } from "zustand";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import type { ViewType, InteractionMode, AnnotationTool } from "../types/view";

export type { InteractionMode, AnnotationTool };

export interface RayState {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  viewType: ViewType;
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

  // Current annotation tool (what clicking does in annotation mode)
  annotationTool: AnnotationTool;

  // Current ray (when in annotation mode)
  currentRay: RayState | null;
  currentDepth: number;
  rayFixed: boolean; // When true, ray doesn't follow mouse

  // Confirmed annotations
  annotations: Annotation[];

  // Selection state
  selectedAnnotationId: string | null;

  // Actions
  toggleMode: () => void;
  setMode: (mode: InteractionMode) => void;
  setAnnotationTool: (tool: AnnotationTool) => void;
  setRay: (ray: RayState | null) => void;
  setDepth: (depth: number) => void;
  adjustDepth: (delta: number) => void;
  toggleRayFixed: () => void;
  confirmAnnotation: () => void;
  cancelAnnotation: () => void;
  selectAnnotation: (id: string | null) => void;
  deleteAnnotation: (id: string) => void;
  clearAll: () => void;
}

const DEFAULT_DEPTH = 10;
const MIN_DEPTH = 0.5;
const MAX_DEPTH = 50;
const DEPTH_STEP = 0.1;

export const useAnnotations = create<AnnotationState>((set, get) => ({
  interactionMode: "mouse",
  annotationTool: "point",
  currentRay: null,
  currentDepth: DEFAULT_DEPTH,
  rayFixed: false,
  annotations: [],
  selectedAnnotationId: null,

  toggleMode: () =>
    set((state) => {
      // Tab only toggles between mouse and annotation
      const next = state.interactionMode === "annotation" ? "mouse" : "annotation";
      return {
        interactionMode: next,
        currentRay: null,
        rayFixed: false,
      };
    }),

  setMode: (mode) =>
    set({
      interactionMode: mode,
      currentRay: null,
      rayFixed: false,
    }),

  setAnnotationTool: (tool) => set({ annotationTool: tool }),

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
      id: uuidv4(),
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

  selectAnnotation: (id) =>
    set({ selectedAnnotationId: id }),

  deleteAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
      selectedAnnotationId:
        state.selectedAnnotationId === id ? null : state.selectedAnnotationId,
    })),

  clearAll: () =>
    set({
      annotations: [],
      currentRay: null,
      currentDepth: DEFAULT_DEPTH,
      rayFixed: false,
      interactionMode: "mouse",
      annotationTool: "point",
      selectedAnnotationId: null,
    }),
}));
