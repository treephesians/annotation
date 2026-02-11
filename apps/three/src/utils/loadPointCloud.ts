export interface Point {
  x: number;
  y: number;
  z: number;
  intensity: number;
}

/**
 * KITTI .bin 파일을 로드하고 파싱합니다
 * @param filePath 파일 경로 (public 폴더 기준)
 * @returns 포인트 배열
 */
export async function loadKittiPointCloud(filePath: string): Promise<Point[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load point cloud: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Float32Array(arrayBuffer);

    // KITTI 형식: 각 포인트마다 4개의 float32 (x, y, z, intensity)
    const pointCount = buffer.length / 4;
    const points: Point[] = [];

    for (let i = 0; i < pointCount; i++) {
      const offset = i * 4;
      points.push({
        x: buffer[offset] ?? 0,
        y: buffer[offset + 1] ?? 0,
        z: buffer[offset + 2] ?? 0,
        intensity: buffer[offset + 3] ?? 0,
      });
    }

    return points;
  } catch (error) {
    console.error("Error loading point cloud:", error);
    throw error;
  }
}

/**
 * 포인트 배열을 three.js BufferGeometry에 사용할 수 있는 형식으로 변환합니다
 * @param points 포인트 배열
 * @returns positions와 colors 배열
 */
export function pointsToBufferData(points: Point[]): {
  positions: Float32Array;
  colors: Float32Array;
} {
  const positions = new Float32Array(points.length * 3);
  const colors = new Float32Array(points.length * 3);

  points.forEach((point, index) => {
    const i = index * 3;
    
    // 위치 데이터
    positions[i] = point.x;
    positions[i + 1] = point.y;
    positions[i + 2] = point.z;

    // 색상 데이터 (intensity를 기반으로 색상 생성)
    // intensity를 0-1 범위로 정규화하고 색상으로 매핑
    const normalizedIntensity = Math.min(Math.max(point.intensity / 255, 0), 1);
    const color = intensityToColor(normalizedIntensity);
    
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  });

  return { positions, colors };
}

/**
 * intensity 값을 RGB 색상으로 변환합니다
 * @param intensity 0-1 범위의 intensity 값
 * @returns RGB 색상
 */
function intensityToColor(intensity: number): { r: number; g: number; b: number } {
  // 색상 그라데이션: 파란색 -> 청록색 -> 노란색 -> 빨간색
  if (intensity < 0.25) {
    // 파란색 -> 청록색
    const t = intensity / 0.25;
    return { r: 0, g: t, b: 1 };
  } else if (intensity < 0.5) {
    // 청록색 -> 노란색
    const t = (intensity - 0.25) / 0.25;
    return { r: 0, g: 1, b: 1 - t };
  } else if (intensity < 0.75) {
    // 노란색 -> 주황색
    const t = (intensity - 0.5) / 0.25;
    return { r: t, g: 1, b: 0 };
  } else {
    // 주황색 -> 빨간색
    const t = (intensity - 0.75) / 0.25;
    return { r: 1, g: 1 - t, b: 0 };
  }
}
