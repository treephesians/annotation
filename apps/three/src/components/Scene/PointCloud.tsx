import { useEffect, useMemo, useRef } from "react";
import { BufferGeometry, Float32BufferAttribute, PointsMaterial } from "three";
import { loadKittiPointCloud, pointsToBufferData } from "@/utils/loadPointCloud";

interface PointCloudProps {
  filePath: string;
  pointSize?: number;
  color?: string;
  position?: [number, number, number];
}

export function PointCloud({
  filePath,
  pointSize = 0.01,
  color,
  position = [0, 0, 0],
}: PointCloudProps) {
  const geometry = useMemo(() => new BufferGeometry(), []);
  const pointsRef = useRef<any>(null);

  const material = useMemo(() => {
    return new PointsMaterial({
      size: pointSize,
      vertexColors: !color,
      color: color || "#ffffff",
      sizeAttenuation: true,
    });
  }, [pointSize, color]);

  // 포인트 클라우드 데이터 로드
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const points = await loadKittiPointCloud(filePath);
        if (!isMounted) return;

        const { positions, colors } = pointsToBufferData(points);

        geometry.setAttribute(
          "position",
          new Float32BufferAttribute(positions, 3)
        );
        if (!color) {
          geometry.setAttribute(
            "color",
            new Float32BufferAttribute(colors, 3)
          );
        }

        geometry.computeBoundingSphere();
      } catch (error) {
        console.error("Failed to load point cloud:", error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filePath, color, geometry]);

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
}
