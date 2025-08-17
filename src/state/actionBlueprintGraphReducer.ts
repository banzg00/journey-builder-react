import {
  ACTION_BLUEPRINT_GRAPH_ACTION,
  ActionBlueprintGraphActions,
  ActionBlueprintGraphState,
} from "@/types/state";

const handleUpdateFormFieldMapping = (
  state: ActionBlueprintGraphState,
  action: Extract<
    ActionBlueprintGraphActions,
    { type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING }
  >
): ActionBlueprintGraphState => {
  const { nodeId, fieldName, mapping } = action.payload;

  return {
    ...state,
    nodes: state.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            fieldMappings: {
              ...(node.data.fieldMappings || {}),
              [fieldName]: mapping,
            },
          },
        };
      }
      return node;
    }),
  };
};

const handleRemoveFormFieldMapping = (
  state: ActionBlueprintGraphState,
  action: Extract<
    ActionBlueprintGraphActions,
    { type: ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING }
  >
): ActionBlueprintGraphState => {
  const { nodeId, fieldName } = action.payload;

  return {
    ...state,
    nodes: state.nodes.map((node) => {
      if (node.id === nodeId) {
        const currentMappings = node.data.fieldMappings || {};
        const newFieldMappings = { ...currentMappings };
        delete newFieldMappings[fieldName as keyof typeof newFieldMappings];

        return {
          ...node,
          data: {
            ...node.data,
            fieldMappings: newFieldMappings,
          },
        };
      }
      return node;
    }),
  };
};

export const actionBlueprintGraphReducer = (
  state: ActionBlueprintGraphState,
  action: ActionBlueprintGraphActions
): ActionBlueprintGraphState => {
  switch (action.type) {
    case ACTION_BLUEPRINT_GRAPH_ACTION.INIT_STATE:
      return { ...state, ...action.payload };

    case ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING:
      return handleUpdateFormFieldMapping(state, action);

    case ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING:
      return handleRemoveFormFieldMapping(state, action);

    default:
      return state;
  }
};
