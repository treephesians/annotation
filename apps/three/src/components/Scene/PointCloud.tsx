import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Vector3,
} from "three";
import { useFrame } from "@react-three/fiber";
import { usePointCloudData } from "@/hooks/usePointCloudData";
import { useRenderSpaces } from "@/hooks/useRenderSpaces";
import { SCENE } from "@/constants/scene";

const MAX_RENDER_SPACES = SCENE.RENDER_SPACE.MAX_COUNT;

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
  const shaderRef = useRef<any>(null);

  const material = useMemo(() => {
    const mat = new PointsMaterial({
      size: pointSize,
      vertexColors: !color,
      color: color || "#ffffff",
      sizeAttenuation: true,
    });

    mat.onBeforeCompile = (shader) => {
      // Add uniforms
      shader.uniforms.renderSpaceCount = { value: 0 };
      shader.uniforms.renderSpaceCenters = {
        value: Array.from({ length: MAX_RENDER_SPACES }, () => new Vector3()),
      };
      shader.uniforms.renderSpaceRadii = {
        value: new Float32Array(MAX_RENDER_SPACES),
      };

      // Vertex shader: add varying for world position
      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `varying vec3 vWorldPosition;
         void main() {`
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
         vec4 worldPos = modelMatrix * vec4(position, 1.0);
         vWorldPosition = worldPos.xyz;`
      );

      // Fragment shader: add uniforms and clipping logic
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `uniform int renderSpaceCount;
         uniform vec3 renderSpaceCenters[${MAX_RENDER_SPACES}];
         uniform float renderSpaceRadii[${MAX_RENDER_SPACES}];
         varying vec3 vWorldPosition;
        void main() {`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
          if (renderSpaceCount > 0) {
            bool insideAny = false;
            for (int i = 0; i < ${MAX_RENDER_SPACES}; i++) {
              if (i >= renderSpaceCount) break;
              float dist = distance(vWorldPosition, renderSpaceCenters[i]);
              if (dist <= renderSpaceRadii[i]) {
                insideAny = true;
                break;
              }
            }
            if (!insideAny) discard;
          }`
      );
      shaderRef.current = shader;
    };

    mat.needsUpdate = true;
    return mat;
  }, [pointSize, color]);

  // Update shader uniforms from store each frame
  useFrame(() => {
    const shader = shaderRef.current;
    if (!shader) return;

    const { renderSpace, createPhase, createAnchorPosition, createRadius } =
      useRenderSpaces.getState();

    const centersUniform = shader.uniforms.renderSpaceCenters;
    const radiiUniform = shader.uniforms.renderSpaceRadii;
    const countUniform = shader.uniforms.renderSpaceCount;
    if (!centersUniform || !radiiUniform || !countUniform) return;

    const centers = centersUniform.value as Vector3[];
    const radii = radiiUniform.value as Float32Array;

    let count = 0;

    // Only include confirmed render space if enabled
    if (renderSpace && renderSpace.enabled) {
      centers[0]!.copy(renderSpace.center);
      radii[0] = renderSpace.radius;
      count = 1;
    }

    // Include placing preview as an additional render space
    if (createPhase === "placing" && createAnchorPosition && count < MAX_RENDER_SPACES) {
      centers[count]!.copy(createAnchorPosition);
      radii[count] = createRadius;
      count++;
    }

    countUniform.value = count;
  });

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
