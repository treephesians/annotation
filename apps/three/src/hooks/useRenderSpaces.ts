import { create } from "zustand";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { SCENE } from "@/constants/scene";
import { useAnnotations } from "./useAnnotations";

export type CreatePhase = "idle" | "placing";

export interface RenderSpace {
  id: string;
  center: THREE.Vector3;
  radius: number;
  visible: boolean;
  enabled: boolean;
}

interface RenderSpaceState {
  renderSpace: RenderSpace | null;

  // Create flow
  createPhase: CreatePhase;
  createAnchorPosition: THREE.Vector3 | null;
  createRadius: number;

  // Editing existing render space
  editingId: string | null;

  // Create flow actions
  startPlacing: (position: THREE.Vector3) => void;
  adjustCreateRadius: (delta: number) => void;
  confirmCreate: () => void;
  cancelCreate: () => void;

  // Render space actions
  deleteRenderSpace: () => void;
  toggleEnabled: () => void;
  startEditing: () => void;
  stopEditing: () => void;
  adjustRadius: (delta: number) => void;
}

const { DEFAULT_RADIUS, MIN_RADIUS, MAX_RADIUS, RADIUS_STEP } =
  SCENE.RENDER_SPACE;

export const useRenderSpaces = create<RenderSpaceState>((set, get) => ({
  renderSpace: null,
  createPhase: "idle",
  createAnchorPosition: null,
  createRadius: DEFAULT_RADIUS,
  editingId: null,

  startPlacing: (position) => {
    useAnnotations.getState().setMode("create");
    set({
      createPhase: "placing",
      createAnchorPosition: position.clone(),
      createRadius: DEFAULT_RADIUS,
    });
  },

  adjustCreateRadius: (delta) =>
    set((state) => ({
      createRadius: Math.max(
        MIN_RADIUS,
        Math.min(MAX_RADIUS, state.createRadius + delta * RADIUS_STEP)
      ),
    })),

  confirmCreate: () => {
    const { createAnchorPosition, createRadius } = get();
    if (!createAnchorPosition) return;

    const newSpace: RenderSpace = {
      id: uuidv4(),
      center: createAnchorPosition.clone(),
      radius: createRadius,
      visible: false,
      enabled: true,
    };

    set({
      renderSpace: newSpace,
      createPhase: "idle",
      createAnchorPosition: null,
      createRadius: DEFAULT_RADIUS,
      editingId: null,
    });
    useAnnotations.getState().setMode("annotation");
  },

  cancelCreate: () => {
    set({
      createPhase: "idle",
      createAnchorPosition: null,
      createRadius: DEFAULT_RADIUS,
    });
    useAnnotations.getState().setMode("annotation");
  },

  deleteRenderSpace: () =>
    set({ renderSpace: null, editingId: null }),

  toggleEnabled: () =>
    set((state) => {
      if (!state.renderSpace) return {};
      return {
        renderSpace: {
          ...state.renderSpace,
          enabled: !state.renderSpace.enabled,
        },
      };
    }),

  startEditing: () =>
    set((state) => {
      if (!state.renderSpace) return {};
      return {
        editingId: state.renderSpace.id,
        renderSpace: { ...state.renderSpace, visible: true },
      };
    }),

  stopEditing: () =>
    set((state) => {
      if (!state.renderSpace) return {};
      return {
        editingId: null,
        renderSpace: { ...state.renderSpace, visible: false },
      };
    }),

  adjustRadius: (delta) =>
    set((state) => {
      if (!state.renderSpace) return {};
      return {
        renderSpace: {
          ...state.renderSpace,
          radius: Math.max(
            MIN_RADIUS,
            Math.min(MAX_RADIUS, state.renderSpace.radius + delta * RADIUS_STEP)
          ),
        },
      };
    }),
}));
