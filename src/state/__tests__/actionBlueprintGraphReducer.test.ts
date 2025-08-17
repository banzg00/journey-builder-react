import { FieldMapping } from "@/types/internal";
import {
  ACTION_BLUEPRINT_GRAPH_ACTION,
  ActionBlueprintGraphState,
} from "@/types/state";
import { describe, expect, it } from "vitest";
import { actionBlueprintGraphReducer } from "../actionBlueprintGraphReducer";

describe("actionBlueprintGraphReducer", () => {
  const initialState: ActionBlueprintGraphState = {
    nodes: [
      {
        id: "node1",
        type: "form",
        position: { x: 0, y: 0 },
        data: {
          label: "Form A",
          formFields: ["name", "email"],
          dependencyData: {
            directDependencies: [],
            transitiveDependencies: [],
          },
          fieldMappings: {},
        },
      },
      {
        id: "node2",
        type: "form",
        position: { x: 100, y: 0 },
        data: {
          label: "Form B",
          formFields: ["address", "phone"],
          dependencyData: {
            directDependencies: [],
            transitiveDependencies: [],
          },
          fieldMappings: {
            address: {
              label: "Street Address",
              value: "user.address",
              source: "User Profile",
            },
          },
        },
      },
    ],
    edges: [
      {
        id: "edge1",
        source: "node1",
        target: "node2",
      },
    ],
    globalData: {
      actionProperties: {
        name: "Test Action",
        category: "Test Category",
        tenant_id: "1",
      },
      clientOrganizationProperties: {
        organization_name: "Test Org",
        organization_email: "test@org.com",
        primary_contact: "John Doe",
      },
    },
  };

  describe("INIT_STATE", () => {
    it("should initialize state with provided payload", () => {
      const newState = {
        nodes: [
          {
            id: "new-node",
            type: "form",
            position: { x: 50, y: 50 },
            data: {
              label: "New Form",
              formFields: ["field1"],
              dependencyData: {
                directDependencies: [],
                transitiveDependencies: [],
              },
              fieldMappings: {},
            },
          },
        ],
        edges: [],
        globalData: {
          actionProperties: {
            name: "New Action",
            category: "New Category",
            tenant_id: "2",
          },
          clientOrganizationProperties: {
            organization_name: "New Org",
            organization_email: "new@org.com",
            primary_contact: "Jane Smith",
          },
        },
      };

      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.INIT_STATE,
        payload: newState,
      });

      expect(result).toEqual({ ...initialState, ...newState });
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe("new-node");
      expect(result.globalData.actionProperties.name).toBe("New Action");
    });

    it("should preserve existing state properties not in payload", () => {
      const partialPayload = {
        nodes: [
          {
            id: "partial-node",
            type: "form",
            position: { x: 25, y: 25 },
            data: {
              label: "Partial Form",
              formFields: ["partialField"],
              dependencyData: {
                directDependencies: [],
                transitiveDependencies: [],
              },
              fieldMappings: {},
            },
          },
        ],
        edges: initialState.edges,
        globalData: initialState.globalData,
      };

      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.INIT_STATE,
        payload: partialPayload,
      });

      expect(result.nodes).toEqual(partialPayload.nodes);
      expect(result.edges).toEqual(initialState.edges); // Should preserve original edges
      expect(result.globalData).toEqual(initialState.globalData); // Should preserve original globalData
    });
  });

  describe("UPDATE_FORM_FIELD_MAPPING", () => {
    it("should add new field mapping to a node", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node1",
          fieldName: "email",
          mapping: {
            label: "Email Address",
            value: "user.email",
            source: "User Profile",
          },
        },
      });

      const updatedNode = result.nodes.find((node) => node.id === "node1");
      expect(updatedNode?.data.fieldMappings).toHaveProperty("email");
      expect(
        (updatedNode?.data.fieldMappings as Record<string, FieldMapping>)?.email
      ).toEqual({
        label: "Email Address",
        value: "user.email",
        source: "User Profile",
      });

      // Should not affect other nodes
      const otherNode = result.nodes.find((node) => node.id === "node2");
      expect(otherNode?.data.fieldMappings).toEqual(
        initialState.nodes[1].data.fieldMappings
      );
    });

    it("should update existing field mapping", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node2",
          fieldName: "address",
          mapping: {
            label: "Full Address",
            value: "user.fullAddress",
            source: "Updated Profile",
          },
        },
      });

      const updatedNode = result.nodes.find((node) => node.id === "node2");
      expect(
        (updatedNode?.data.fieldMappings as Record<string, FieldMapping>)
          ?.address
      ).toEqual({
        label: "Full Address",
        value: "user.fullAddress",
        source: "Updated Profile",
      });
    });

    it("should preserve existing field mappings when adding new one", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node2",
          fieldName: "phone",
          mapping: {
            label: "Phone Number",
            value: "user.phone",
            source: "Contact Info",
          },
        },
      });

      const updatedNode = result.nodes.find((node) => node.id === "node2");
      expect(updatedNode?.data.fieldMappings).toHaveProperty("address");
      expect(updatedNode?.data.fieldMappings).toHaveProperty("phone");
      expect(
        (updatedNode?.data.fieldMappings as Record<string, FieldMapping>)
          ?.address
      ).toEqual({
        label: "Street Address",
        value: "user.address",
        source: "User Profile",
      });
    });

    it("should handle node with no existing fieldMappings", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node1",
          fieldName: "name",
          mapping: {
            label: "Full Name",
            value: "user.fullName",
            source: "Profile",
          },
        },
      });

      const updatedNode = result.nodes.find((node) => node.id === "node1");
      expect(
        (updatedNode?.data.fieldMappings as Record<string, FieldMapping>)?.name
      ).toEqual({
        label: "Full Name",
        value: "user.fullName",
        source: "Profile",
      });
    });

    it("should not modify state if node is not found", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "nonexistent-node",
          fieldName: "field",
          mapping: {
            label: "Label",
            value: "value",
            source: "Source",
          },
        },
      });

      expect(result).toEqual(initialState);
    });

    it("should return immutable state", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node1",
          fieldName: "email",
          mapping: {
            label: "Email",
            value: "user.email",
            source: "Profile",
          },
        },
      });

      expect(result).not.toBe(initialState);
      expect(result.nodes).not.toBe(initialState.nodes);
      expect(result.nodes[0]).not.toBe(initialState.nodes[0]);
      expect(result.nodes[0].data).not.toBe(initialState.nodes[0].data);
    });
  });

  describe("REMOVE_FORM_FIELD_MAPPING", () => {
    it("should remove existing field mapping", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node2",
          fieldName: "address",
        },
      });

      const updatedNode = result.nodes.find((node) => node.id === "node2");
      expect(updatedNode?.data.fieldMappings).not.toHaveProperty("address");
      expect(Object.keys(updatedNode?.data.fieldMappings || {})).toHaveLength(
        0
      );
    });

    it("should handle removal of non-existent field mapping", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node2",
          fieldName: "nonexistent-field",
        },
      });

      const updatedNode = result.nodes.find((node) => node.id === "node2");
      expect(updatedNode?.data.fieldMappings).toEqual(
        initialState.nodes[1].data.fieldMappings
      );
    });

    it("should handle node with no fieldMappings", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node1",
          fieldName: "name",
        },
      });

      const updatedNode = result.nodes.find((node) => node.id === "node1");
      expect(updatedNode?.data.fieldMappings).toEqual({});
    });

    it("should not modify state if node is not found", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "nonexistent-node",
          fieldName: "field",
        },
      });

      expect(result).toEqual(initialState);
    });

    it("should preserve other field mappings when removing one", () => {
      // First add multiple mappings
      const stateWithMultipleMappings = actionBlueprintGraphReducer(
        initialState,
        {
          type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING,
          payload: {
            nodeId: "node2",
            fieldName: "phone",
            mapping: {
              label: "Phone",
              value: "user.phone",
              source: "Contact",
            },
          },
        }
      );

      // Then remove one mapping
      const result = actionBlueprintGraphReducer(stateWithMultipleMappings, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node2",
          fieldName: "address",
        },
      });

      const updatedNode = result.nodes.find((node) => node.id === "node2");
      expect(updatedNode?.data.fieldMappings).not.toHaveProperty("address");
      expect(updatedNode?.data.fieldMappings).toHaveProperty("phone");
      expect(
        (updatedNode?.data.fieldMappings as Record<string, FieldMapping>)?.phone
      ).toEqual({
        label: "Phone",
        value: "user.phone",
        source: "Contact",
      });
    });

    it("should return immutable state", () => {
      const result = actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node2",
          fieldName: "address",
        },
      });

      expect(result).not.toBe(initialState);
      expect(result.nodes).not.toBe(initialState.nodes);
      expect(result.nodes[1]).not.toBe(initialState.nodes[1]);
      expect(result.nodes[1].data).not.toBe(initialState.nodes[1].data);
    });
  });

  describe("default case", () => {
    it("should return unchanged state for unknown action", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unknownAction: any = {
        type: "UNKNOWN_ACTION",
        payload: {},
      };

      const result = actionBlueprintGraphReducer(initialState, unknownAction);

      expect(result).toBe(initialState);
    });
  });

  describe("state immutability", () => {
    it("should never mutate the original state", () => {
      const originalState = JSON.parse(JSON.stringify(initialState));

      // Test all action types
      actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node1",
          fieldName: "test",
          mapping: { label: "Test", value: "test", source: "Test" },
        },
      });

      actionBlueprintGraphReducer(initialState, {
        type: ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING,
        payload: {
          nodeId: "node2",
          fieldName: "address",
        },
      });

      expect(initialState).toEqual(originalState);
    });
  });
});
