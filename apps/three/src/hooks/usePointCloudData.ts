import { create } from "zustand";
import {
  loadKittiPointCloud,
  pointsToBufferData,
} from "../utils/loadPointCloud";
import { buildKDTree, type KDTree } from "../utils/kdTree";
import { computeNormals } from "../utils/normalEstimation";

interface PointCloudDataState {
  positions: Float32Array | null;
  colors: Float32Array | null;
  normals: Float32Array | null;
  kdTree: KDTree | null;
  loading: boolean;
  error: string | null;
  loadedPath: string | null;
  load: (filePath: string) => Promise<void>;
}

export const usePointCloudData = create<PointCloudDataState>((set, get) => ({
  positions: null,
  colors: null,
  normals: null,
  kdTree: null,
  loading: false,
  error: null,
  loadedPath: null,

  load: async (filePath: string) => {
    const { loadedPath, loading } = get();
    if (loadedPath === filePath || loading) return;

    set({ loading: true, error: null });
    try {
      const points = await loadKittiPointCloud(filePath);
      const { positions, colors } = pointsToBufferData(points);

      // Build spatial index
      console.time("buildKDTree");
      const kdTree = buildKDTree(positions);
      console.timeEnd("buildKDTree");

      // Compute normals
      console.time("computeNormals");
      const normals = computeNormals(positions, kdTree, 15);
      console.timeEnd("computeNormals");

      set({ positions, colors, normals, kdTree, loading: false, loadedPath: filePath });
    } catch (error) {
      console.error("Failed to load point cloud:", error);
      set({ error: String(error), loading: false });
    }
  },
}));
