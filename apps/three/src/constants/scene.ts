export const SCENE = {
  ANNOTATION: {
    POINT_RADIUS: 0.02,
    SEGMENTS: 16,
    COLOR: "#ffffff",
    SELECTED_COLOR: "#ffff00",
    SELECTED_SCALE: 1.3,
    EMISSIVE_INTENSITY: 2,
    SELECTED_EMISSIVE_INTENSITY: 3,
  },
  RAY: {
    LENGTH: 50,
    COLOR: "#ffff00",
    LINE_WIDTH: 2,
    OPACITY: 0.4,
  },
  MARKER: {
    OUTER_RADIUS: 0.15,
    OUTER_SEGMENTS: 16,
    OUTER_COLOR: "#ffff00",
    OUTER_OPACITY: 0.4,
    OUTER_EMISSIVE_INTENSITY: 0.5,
    INNER_RADIUS: 0.02,
    INNER_SEGMENTS: 8,
    INNER_COLOR: "#ffffff",
  },
  POINT_CLOUD: {
    DEFAULT_POINT_SIZE: 0.02,
    DEFAULT_FILE_PATH:
      "/data/2011_09_26_drive_0018_sync/velodyne_points/data/0000000000.bin",
  },
  CAMERA: {
    ORTHO_ZOOM_FACTOR: 300,
  },
  BACKGROUND: {
    perspective: "#252530",
    side: "#303035",
    topDown: "#352530",
  },
} as const;
