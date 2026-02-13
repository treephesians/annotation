import { create } from "zustand";
import * as THREE from "three";
import { regionGrow } from "../utils/regionGrowing";
import { findNearestPoint } from "../utils/kdTree";
import { usePointCloudData } from "./usePointCloudData";
import { SCENE } from "@/constants/scene";

export type AutoCuboidPhase = "idle" | "picking" | "preview";

interface AutoCuboidState {
  phase: AutoCuboidPhase;
  selectedIndices: number[] | null;

  // Region growing params
  normalThreshold: number;
  maxDistance: number;
  maxRegionSize: number;

  startPicking: () => void;
  processClick: (worldPos: THREE.Vector3) => void;
  confirmCuboid: () => void;
  cancelCreate: () => void;
}

export const useAutoCuboid = create<AutoCuboidState>((set, get) => ({
  phase: "idle",
  selectedIndices: null,
  normalThreshold: SCENE.AUTO_CUBOID.DEFAULT_NORMAL_THRESHOLD,
  maxDistance: SCENE.AUTO_CUBOID.DEFAULT_MAX_DISTANCE,
  maxRegionSize: SCENE.AUTO_CUBOID.DEFAULT_MAX_REGION_SIZE,

  startPicking: () => {
    set({ phase: "picking", selectedIndices: null });
  },

  processClick: (worldPos: THREE.Vector3) => {
    const { positions, normals, kdTree } = usePointCloudData.getState();
    if (!positions || !normals || !kdTree) return;

    const { normalThreshold, maxDistance, maxRegionSize } = get();

    // Transform world coords → raw point cloud coords.
    // PointCloud applies rotation [-PI/2, 0, 0] (R_x(-90°)):
    //   world = R * raw  →  raw_x = world_x, raw_y = -world_z, raw_z = world_y
    const rawX = worldPos.x;
    const rawY = -worldPos.z;
    const rawZ = worldPos.y;

    const seedIndex = findNearestPoint(kdTree, rawX, rawY, rawZ);
    if (seedIndex < 0) return;

    console.time("regionGrow");
    const selectedIndices = regionGrow(seedIndex, positions, normals, kdTree, {
      normalThreshold,
      maxDistance,
      maxRegionSize,
    });
    console.timeEnd("regionGrow");
    console.log(`Region growing selected ${selectedIndices.length} points`);

    set({ phase: "preview", selectedIndices });
  },

  confirmCuboid: () => {
    // PCA → cuboid generation comes in a later step.
    // For now, go back to picking so we can test region growing repeatedly.
    set({ phase: "picking", selectedIndices: null });
  },

  cancelCreate: () => {
    set({ phase: "idle", selectedIndices: null });
  },
}));
