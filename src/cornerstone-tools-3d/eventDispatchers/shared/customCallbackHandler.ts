import { state, ToolGroupManager } from './../../store/index';

/**
 * The customCallbackHandler is used as a generic event handler for tool events
 * on viewports. It:
 *
 * - Finds an "active" tool with:
 *    - A matching `handlerType`
 *    - A matching `customFunction` on its tool instance
 *
 * Then calls that custom function with raised event.
 *
 * @param handlerType - 'Mouse' | 'Touch' | 'MouseWheel'
 * @param customFunction - Function name that's expected to live on implementing
 *   (and event handling) active tool ex. 'doubleClickCallback'
 * @param evt
 */
export default function(handlerType: string, customFunction: string, evt) {
  if (state.isToolLocked) {
    return false;
  }

  const { renderingEngineUID, sceneUID, viewportUID } = evt.detail;
  const toolGroups = ToolGroupManager.getToolGroups(
    renderingEngineUID,
    sceneUID,
    viewportUID
  );

  // TODO: Filter tools by interaction type?
  /**
   * Iterate tool group tools until we find a tool that is:
   * - active
   * - has the custom callback function
   */
  let foundTool;
  for (let i = 0; i < toolGroups.length; i++) {
    const toolGroup = toolGroups[i];
    const toolGroupToolNames = Object.keys(toolGroup.tools);

    for (let j = 0; j < toolGroupToolNames.length; j++) {
      const toolName = toolGroupToolNames[j];
      const tool = toolGroup.tools[toolName];
      // TODO: Should be getter
      const toolInstance = toolGroup._tools[toolName];

      if (
        // TODO: Should be enum?
        tool.mode === 'active' &&
        // TODO: Should be implements interface?
        // Weird that we need concrete instance. Other options to filter / get callback?
        typeof toolInstance[customFunction] === 'function'
      ) {
        // This should be behind some API. Too much knowledge of ToolGroup
        // inner workings leaking out
        foundTool = toolGroup._tools[toolName];
        break;
      }
    }

    if (foundTool) {
      break;
    }
  }

  if (!foundTool) {
    return;
  }

  foundTool[0][customFunction](evt);
}
