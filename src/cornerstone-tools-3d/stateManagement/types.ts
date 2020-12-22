type ToolSpecificToolData = {
  metadata: {
    viewPlaneNormal: Array<number>; // The normal on which the tool was drawn
    viewUp: Array<number>; // The viewUp on which the tool was drawn.
    toolUID: string; // A unique identifier for this tool data.
    FrameOfReferenceUID: string; // The FrameOfReferenceUID
    toolName: string; // The registered name of the tool.
  };
  data: any; // Data specific to the toolType
};

type ToolSpecificToolState = Array<ToolSpecificToolData>;

type FrameOfReferenceSpecificToolState = {
  // Any string key must have type of Array<ToolSpecificToolData>
  [key: string]: ToolSpecificToolState;
};

type ToolState = {
  // Any string key must have type of FrameOfReferenceSpecificToolState
  [key: string]: FrameOfReferenceSpecificToolState;
};

type ToolAndToolStateArray = Array<{
  tool: any;
  toolState: ToolSpecificToolState;
}>;

export {
  ToolSpecificToolData,
  ToolSpecificToolState,
  FrameOfReferenceSpecificToolState,
  ToolAndToolStateArray,
  ToolState,
};
