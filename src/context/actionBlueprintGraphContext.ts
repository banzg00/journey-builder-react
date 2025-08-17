import { createContext, Dispatch, useContext } from "react";
import {
  ActionBlueprintGraphActions,
  ActionBlueprintGraphState,
} from "../types/state";

export const ActionBlueprintGraphContext = createContext<
  | {
      state: ActionBlueprintGraphState;
      dispatch: Dispatch<ActionBlueprintGraphActions>;
    }
  | undefined
>(undefined);

export const useActionBlueprintGraph = () => {
  const context = useContext(ActionBlueprintGraphContext);
  if (!context) {
    throw new Error(
      "useActionBlueprintGraph must be used within ActionBlueprintGraphProvider"
    );
  }
  return context;
};
