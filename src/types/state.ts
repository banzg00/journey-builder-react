import { type Edge, type Node } from "@xyflow/react";

export interface GlobalData {
  actionProperties: {
    name: string;
    category: string;
    tenant_id: string;
  };
  clientOrganizationProperties: {
    organization_name: string;
    organization_email: string;
    primary_contact: string;
  };
}

export type ActionBlueprintGraphState = {
  nodes: Node[];
  edges: Edge[];
  globalData: GlobalData;
};

export enum ACTION_BLUEPRINT_GRAPH_ACTION {
  INIT_STATE = "INIT_STATE",
  UPDATE_FORM_FIELD_MAPPING = "UPDATE_FORM_FIELD_MAPPING",
  REMOVE_FORM_FIELD_MAPPING = "REMOVE_FORM_FIELD_MAPPING",
}

interface FieldMapping {
  label: string;
  value: string;
  source: string;
}

export type ActionBlueprintGraphActions =
  | {
      type: ACTION_BLUEPRINT_GRAPH_ACTION.INIT_STATE;
      payload: { nodes: Node[]; edges: Edge[]; globalData: GlobalData };
    }
  | {
      type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING;
      payload: {
        nodeId: string;
        fieldName: string;
        mapping: FieldMapping;
      };
    }
  | {
      type: ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING;
      payload: {
        nodeId: string;
        fieldName: string;
      };
    };
