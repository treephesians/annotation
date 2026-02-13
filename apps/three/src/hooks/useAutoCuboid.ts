import { create } from "zustand";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { regionGrow } from "../utils/regionGrowing";
import { findNearestPoint } from "../utils/kdTree";
import { computeOBB, type OBB } from "../utils/computeOBB";
import { usePointCloudData } from "./usePointCloudData";
import { SCENE } from "@/constants/scene";

export type AutoCuboidPhase = "idle" | "picking" | "preview";

export interface Cuboid {
  id: string;
  /** OBB center in raw point cloud coords */
  obb: OBB;
  timestamp: number;
}

interface AutoCuboidState {
  phase: AutoCuboidPhase;
  selectedIndices: number[] | null;
  /** OBB preview computed from selected region */
  previewOBB: OBB | null;

  /** Confirmed cuboids */
  cuboids: Cuboid[];

  // Region growing params
  normalThreshold: number;
  maxDistance: number;
  maxRegionSize: number;

  startPicking: () => void;
  processClick: (worldPos: THREE.Vector3) => void;
  confirmCuboid: () => void;
  cancelCreate: () => void;
  deleteCuboid: (id: string) => void;
}

export const useAutoCuboid = create<AutoCuboidState>((set, get) => ({
  phase: "idle",
  selectedIndices: null,
  previewOBB: null,
  cuboids: [],
  normalThreshold: SCENE.AUTO_CUBOID.DEFAULT_NORMAL_THRESHOLD,
  maxDistance: SCENE.AUTO_CUBOID.DEFAULT_MAX_DISTANCE,
  maxRegionSize: SCENE.AUTO_CUBOID.DEFAULT_MAX_REGION_SIZE,

  startPicking: () => {
    set({ phase: "picking", selectedIndices: null, previewOBB: null });
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

    // Compute OBB from selected points
    console.time("computeOBB");
    const previewOBB = computeOBB(selectedIndices, positions);
    console.timeEnd("computeOBB");

    set({ phase: "preview", selectedIndices, previewOBB });
  },

  confirmCuboid: () => {
    const { previewOBB } = get();
    if (!previewOBB) return;

    const newCuboid: Cuboid = {
      id: uuidv4(),
      obb: previewOBB,
      timestamp: Date.now(),
    };

    set((state) => ({
      cuboids: [...state.cuboids, newCuboid],
      phase: "idle",
      selectedIndices: null,
      previewOBB: null,
    }));
  },

  cancelCreate: () => {
    set({ phase: "idle", selectedIndices: null, previewOBB: null });
  },

  deleteCuboid: (id) => {
    set((state) => ({
      cuboids: state.cuboids.filter((c) => c.id !== id),
    }));
  },
}));
