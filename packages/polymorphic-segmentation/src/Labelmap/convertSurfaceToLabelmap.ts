import type { Types } from '@cornerstonejs/core';
import {
  Enums,
  cache,
  eventTarget,
  getWebWorkerManager,
  triggerEvent,
} from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import type { Types as ToolsTypes } from '@cornerstonejs/tools';

const { WorkerTypes } = cornerstoneTools.Enums;

const workerManager = getWebWorkerManager();

const triggerWorkerProgress = (eventTarget, progress) => {
  triggerEvent(eventTarget, Enums.Events.WEB_WORKER_PROGRESS, {
    progress,
    type: WorkerTypes.POLYSEG_SURFACE_TO_LABELMAP,
  });
};

export async function convertSurfaceToVolumeLabelmap(
  surfaceRepresentationData: ToolsTypes.SurfaceSegmentationData,
  segmentationVolume: Types.IImageVolume
) {
  const { geometryIds } = surfaceRepresentationData;
  if (!geometryIds?.size) {
    throw new Error('No geometry IDs found for surface representation');
  }

  const segmentsInfo = new Map() as Map<
    number,
    {
      points: number[];
      polys: number[];
    }
  >;

  geometryIds.forEach((geometryId, segmentIndex) => {
    const geometry = cache.getGeometry(geometryId);
    const geometryData = geometry.data as Types.ISurface;
    const points = geometryData.points;
    const polys = geometryData.polys;

    segmentsInfo.set(segmentIndex, {
      points,
      polys,
    });
  });

  const { dimensions, direction, origin, spacing, voxelManager } =
    segmentationVolume;

  triggerWorkerProgress(eventTarget, 0);

  const newScalarData = await workerManager.executeTask(
    'polySeg',
    'convertSurfacesToVolumeLabelmap',
    {
      segmentsInfo,
      dimensions,
      spacing,
      direction,
      origin,
    },
    {
      callbacks: [
        (progress) => {
          triggerWorkerProgress(eventTarget, progress);
        },
      ],
    }
  );

  triggerWorkerProgress(eventTarget, 100);

  voxelManager.setCompleteScalarDataArray(newScalarData);

  // update the scalarData in the volume as well
  segmentationVolume.modified();

  return {
    volumeId: segmentationVolume.volumeId,
  };
}

export async function convertSurfaceToStackLabelmap() {
  // TODO
}
