import type { AxiosResponse } from "axios";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from "vitest";
import apiClient from "../../client";
import { getActionBlueprintGraph } from "../api";

// Mock the API client
vi.mock("../../client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("Action Blueprint Graph API", () => {
  const mockGet = apiClient.get as MockedFunction<typeof apiClient.get>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getActionBlueprintGraph", () => {
    const mockResponse = {
      status: 200,
      data: {
        $schema: "https://example.com/schema",
        category: "Test Category",
        description: "Test Description",
        edges: [
          {
            source: "node1",
            target: "node2",
          },
        ],
        forms: [
          {
            description: "Test Form",
            dynamic_field_config: {},
            field_schema: {
              properties: {
                name: {
                  avantos_type: "text",
                  type: "string",
                  title: "Name",
                },
                email: {
                  avantos_type: "email",
                  type: "string",
                  format: "email",
                  title: "Email",
                },
              },
              required: ["name"],
              type: "object",
            },
            id: "form1",
            is_reusable: true,
            name: "Test Form",
            ui_schema: {
              elements: [
                {
                  label: "Name",
                  scope: "#/properties/name",
                  type: "Control",
                },
              ],
              type: "VerticalLayout",
            },
          },
        ],
        id: "blueprint123",
        name: "Test Blueprint",
        nodes: [
          {
            id: "node1",
            data: {
              approval_required: false,
              component_id: "form1",
              component_key: "test-key",
              component_type: "form",
              id: "node1",
              name: "Test Node",
              prerequisites: [],
              sla_duration: {
                number: 24,
                unit: "hours",
              },
            },
            position: {
              x: 100,
              y: 100,
            },
            type: "form",
          },
        ],
        tenant_id: "tenant123",
      },
    };

    it("should successfully fetch action blueprint graph", async () => {
      mockGet.mockResolvedValueOnce(mockResponse as AxiosResponse);

      const result = await getActionBlueprintGraph();

      expect(mockGet).toHaveBeenCalledWith(
        "/api/v1/123/actions/blueprints/123/graph"
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle successful response with status 200", async () => {
      mockGet.mockResolvedValueOnce(mockResponse as AxiosResponse);

      const result = await getActionBlueprintGraph();

      expect(result).toBeDefined();
      expect(result.$schema).toBe("https://example.com/schema");
      expect(result.category).toBe("Test Category");
      expect(result.nodes).toHaveLength(1);
      expect(result.forms).toHaveLength(1);
      expect(result.edges).toHaveLength(1);
    });

    it("should throw error when response status is not 200", async () => {
      const errorResponse = {
        status: 404,
        data: null,
      };

      mockGet.mockResolvedValueOnce(errorResponse as AxiosResponse);

      await expect(getActionBlueprintGraph()).rejects.toThrow(
        "Failed to fetch action blueprint graph"
      );
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network Error");
      mockGet.mockRejectedValueOnce(networkError);

      // Mock console.error to suppress error output
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(getActionBlueprintGraph()).rejects.toThrow("Network Error");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch action blueprint graph: Error: Network Error"
      );

      consoleSpy.mockRestore();
    });

    it("should handle API client errors", async () => {
      const apiError = {
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
        },
      };

      mockGet.mockRejectedValueOnce(apiError);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(getActionBlueprintGraph()).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should handle malformed response data", async () => {
      const malformedResponse = {
        status: 200,
        data: null,
      };

      mockGet.mockResolvedValueOnce(malformedResponse as AxiosResponse);

      const result = await getActionBlueprintGraph();

      expect(result).toBeNull();
    });

    it("should handle response with missing required fields", async () => {
      const incompleteResponse = {
        status: 200,
        data: {
          id: "blueprint123",
          name: "Test Blueprint",
          // Missing other required fields
        },
      };

      mockGet.mockResolvedValueOnce(incompleteResponse as AxiosResponse);

      const result = await getActionBlueprintGraph();

      expect(result.id).toBe("blueprint123");
      expect(result.name).toBe("Test Blueprint");
      // Should still return the data even if some fields are missing
    });

    it("should handle empty arrays in response", async () => {
      const emptyResponse = {
        status: 200,
        data: {
          $schema: "https://example.com/schema",
          category: "Empty Category",
          description: "Empty Description",
          edges: [],
          forms: [],
          id: "empty-blueprint",
          name: "Empty Blueprint",
          nodes: [],
          tenant_id: "tenant123",
        },
      };

      mockGet.mockResolvedValueOnce(emptyResponse as AxiosResponse);

      const result = await getActionBlueprintGraph();

      expect(result.nodes).toEqual([]);
      expect(result.forms).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it("should handle large response data", async () => {
      const largeNodes = Array.from({ length: 100 }, (_, i) => ({
        id: `node${i}`,
        data: {
          approval_required: false,
          component_id: `form${i}`,
          component_key: `key${i}`,
          component_type: "form",
          id: `node${i}`,
          name: `Node ${i}`,
          prerequisites: [],
          sla_duration: { number: 24, unit: "hours" },
        },
        position: { x: i * 100, y: i * 100 },
        type: "form",
      }));

      const largeResponse = {
        status: 200,
        data: {
          ...mockResponse.data,
          nodes: largeNodes,
        },
      };

      mockGet.mockResolvedValueOnce(largeResponse as AxiosResponse);

      const result = await getActionBlueprintGraph();

      expect(result.nodes).toHaveLength(100);
      expect(result.nodes[0].id).toBe("node0");
      expect(result.nodes[99].id).toBe("node99");
    });

    it("should make only one API call per invocation", async () => {
      mockGet.mockResolvedValueOnce(mockResponse as AxiosResponse);

      await getActionBlueprintGraph();

      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });
});
