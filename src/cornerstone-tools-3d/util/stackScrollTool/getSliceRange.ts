import getVolumeActorCorners from '../vtkjs/getVolumeActorCorners';
import vtkMatrixBuilder from 'vtk.js/Sources/Common/Core/MatrixBuilder';

export default function getSliceRange(
  volumeActor,
  viewPlaneNormal,
  focalPoint
) {
  const corners = getVolumeActorCorners(volumeActor);

  // Get rotation matrix from normal to +X (since bounds is aligned to XYZ)
  const transform = vtkMatrixBuilder
    .buildFromDegree()
    .identity()
    .rotateFromDirections(viewPlaneNormal, [1, 0, 0]);

  corners.forEach((pt) => transform.apply(pt));

  let transformedFocalPoint = [...focalPoint];

  transform.apply(transformedFocalPoint);

  const currentSlice = transformedFocalPoint[0];

  // range is now maximum X distance
  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < 8; i++) {
    const x = corners[i][0];
    if (x > maxX) {
      maxX = x;
    }
    if (x < minX) {
      minX = x;
    }
  }

  return { min: minX, max: maxX, current: currentSlice };
}
