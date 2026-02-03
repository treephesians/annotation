import { create } from "zustand";
import * as THREE from "three";
import {
  DEFAULT_CAMERA_STATE,
  SPEED,
  clampDistance,
  clampElevation,
  normalizeAzimuth,
} from "../utils/sphericalCoordinates";

interface CameraControlState {
  target: THREE.Vector3;
  distance: number;
  azimuth: number;
  elevation: number;

  // Actions
  zoomIn: () => void;
  zoomOut: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  rotateUp: () => void;
  rotateDown: () => void;
  reset: () => void;
}

export const useCameraControl = create<CameraControlState>((set) => ({
  target: DEFAULT_CAMERA_STATE.target.clone(),
  distance: DEFAULT_CAMERA_STATE.distance,
  azimuth: DEFAULT_CAMERA_STATE.azimuth,
  elevation: DEFAULT_CAMERA_STATE.elevation,

  zoomIn: () =>
    set((state) => ({
      distance: clampDistance(state.distance * (1 - SPEED.distance)),
    })),

  zoomOut: () =>
    set((state) => ({
      distance: clampDistance(state.distance * (1 + SPEED.distance)),
    })),

  rotateLeft: () =>
    set((state) => ({
      azimuth: normalizeAzimuth(state.azimuth + SPEED.azimuth),
    })),

  rotateRight: () =>
    set((state) => ({
      azimuth: normalizeAzimuth(state.azimuth - SPEED.azimuth),
    })),

  rotateUp: () =>
    set((state) => ({
      elevation: clampElevation(state.elevation - SPEED.elevation),
    })),

  rotateDown: () =>
    set((state) => ({
      elevation: clampElevation(state.elevation + SPEED.elevation),
    })),

  reset: () =>
    set({
      target: DEFAULT_CAMERA_STATE.target.clone(),
      distance: DEFAULT_CAMERA_STATE.distance,
      azimuth: DEFAULT_CAMERA_STATE.azimuth,
      elevation: DEFAULT_CAMERA_STATE.elevation,
    }),
}));
