import { PointCloud } from "../Scene/PointCloud";
import { CenterPoint } from "../Scene/CenterPoint";
import { Annotations } from "../Scene/Annotations";
import { RayVisualization } from "../Scene/RayVisualization";
import { ViewClickHandler } from "../Controls/ViewClickHandler";
import { SCENE } from "@/constants/scene";
import type { ViewType } from "@/types/view";

interface SceneContentProps {
  viewType: ViewType;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function SceneContent({ viewType, containerRef }: SceneContentProps) {
  return (
    <>
      <ViewClickHandler viewType={viewType} containerRef={containerRef} />
      <PointCloud
        filePath={SCENE.POINT_CLOUD.DEFAULT_FILE_PATH}
        pointSize={SCENE.POINT_CLOUD.DEFAULT_POINT_SIZE}
      />
      <CenterPoint />
      <Annotations viewType={viewType} />
      <RayVisualization />
    </>
  );
}
