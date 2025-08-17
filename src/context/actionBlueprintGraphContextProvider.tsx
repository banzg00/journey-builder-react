import {
  mapDtoEdgesToGraphEdges,
  mapDtoNodesToGraphNodes,
} from "@/mappers/graphMapper";
import React, { useEffect, useReducer } from "react";
import { getActionBlueprintGraph } from "../api/action-blueprint-graph/api";
import { getGlobalData } from "../api/global-data/api";
import { actionBlueprintGraphReducer } from "../state/actionBlueprintGraphReducer";
import {
  ACTION_BLUEPRINT_GRAPH_ACTION,
  ActionBlueprintGraphState,
} from "../types/state";
import { ActionBlueprintGraphContext } from "./actionBlueprintGraphContext";

const initialState: ActionBlueprintGraphState = {
  nodes: [],
  edges: [],
  globalData: {
    actionProperties: {
      name: "",
      category: "",
      tenant_id: "",
    },
    clientOrganizationProperties: {
      organization_name: "",
      organization_email: "",
      primary_contact: "",
    },
  },
};

export function ActionBlueprintGraphProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(
    actionBlueprintGraphReducer,
    initialState
  );

  useEffect(() => {
    const fetchData = async () => {
      const [actionBlueprintGraph, globalData] = await Promise.all([
        getActionBlueprintGraph(),
        getGlobalData(),
      ]);

      const graphNodes = mapDtoNodesToGraphNodes(
        actionBlueprintGraph.forms,
        actionBlueprintGraph.nodes
      );
      const graphEdges = mapDtoEdgesToGraphEdges(actionBlueprintGraph.edges);

      dispatch({
        type: ACTION_BLUEPRINT_GRAPH_ACTION.INIT_STATE,
        payload: { nodes: graphNodes, edges: graphEdges, globalData },
      });
    };
    fetchData();
  }, []);

  return (
    <ActionBlueprintGraphContext.Provider value={{ state, dispatch }}>
      {children}
    </ActionBlueprintGraphContext.Provider>
  );
}
