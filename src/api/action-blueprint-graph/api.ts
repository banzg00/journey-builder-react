import apiClient from "../client";
import type { ActionBlueprintGraphDto } from "./dto";

export const getActionBlueprintGraph =
  async (): Promise<ActionBlueprintGraphDto> => {
    try {
      const response = await apiClient.get(
        "/api/v1/123/actions/blueprints/123/graph"
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch action blueprint graph");
      }

      return response.data;
    } catch (error) {
      console.error(`Failed to fetch action blueprint graph: ${error}`);
      throw error;
    }
  };
