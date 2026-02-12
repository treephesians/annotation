import { useEffect, useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, PointsMaterial } from "three";
import { usePointCloudData } from "@/hooks/usePointCloudData";
import { SCENE } from "@/constants/scene";

interface PointCloudProps {
  filePath: string;
  pointSize?: number;
  color?: string;
  position?: [number, number, number];
}

export function PointCloud({
  filePath,
  pointSize = SCENE.POINT_CLOUD.DEFAULT_POINT_SIZE,
  color,
  position = [0, 0, 0],
}: PointCloudProps) {
  const { positions, colors: vertexColors, load } = usePointCloudData();
  const geometry = useMemo(() => new BufferGeometry(), []);

  const material = useMemo(() => {
    return new PointsMaterial({
      size: pointSize,
      vertexColors: !color,
      color: color || "#ffffff",
      sizeAttenuation: true,
    });
  }, [pointSize, color]);

  useEffect(() => {
    load(filePath);
  }, [filePath, load]);

  useEffect(() => {
    if (!positions) return;

    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(positions, 3)
    );
    if (!color && vertexColors) {
      geometry.setAttribute(
        "color",
        new Float32BufferAttribute(vertexColors, 3)
      );
    }

    geometry.computeBoundingSphere();
  }, [positions, vertexColors, color, geometry]);

  return (
    <points
      geometry={geometry}
      material={material}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
}
