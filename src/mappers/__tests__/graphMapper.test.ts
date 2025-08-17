import type { Edge, Form, NodeDto } from "@/api/action-blueprint-graph/dto";
import { describe, expect, it } from "vitest";
import {
  mapDtoEdgesToGraphEdges,
  mapDtoNodesToGraphNodes,
} from "../graphMapper";

describe("GraphMapper", () => {
  // Mock data for testing
  const mockForms: Form[] = [
    {
      id: "form1",
      name: "User Profile Form",
      description: "User profile information",
      is_reusable: true,
      dynamic_field_config: {},
      field_schema: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: {
            type: "string",
            avantos_type: "text",
            title: "Full Name",
          },
          email: {
            type: "string",
            avantos_type: "email",
            format: "email",
            title: "Email Address",
          },
          phone: {
            type: "string",
            avantos_type: "text",
            title: "Phone Number",
          },
        },
      },
      ui_schema: {
        type: "VerticalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/name",
            label: "Full Name",
          },
        ],
      },
    },
    {
      id: "form2",
      name: "Address Form",
      description: "Address information",
      is_reusable: false,
      dynamic_field_config: {},
      field_schema: {
        type: "object",
        required: ["street", "city"],
        properties: {
          street: {
            type: "string",
            avantos_type: "text",
            title: "Street Address",
          },
          city: {
            type: "string",
            avantos_type: "text",
            title: "City",
          },
          zipCode: {
            type: "string",
            avantos_type: "text",
            title: "ZIP Code",
          },
        },
      },
      ui_schema: {
        type: "VerticalLayout",
        elements: [],
      },
    },
    {
      id: "form3",
      name: "Empty Form",
      description: "Form with no fields",
      is_reusable: true,
      dynamic_field_config: {},
      field_schema: {
        type: "object",
        required: [],
        properties: {},
      },
      ui_schema: {
        type: "VerticalLayout",
        elements: [],
      },
    },
  ];

  const mockNodes: NodeDto[] = [
    {
      id: "node1",
      type: "form",
      position: { x: 100, y: 200 },
      data: {
        id: "node1",
        name: "User Registration",
        component_id: "form1",
        component_key: "user-reg",
        component_type: "form",
        approval_required: false,
        prerequisites: [],
        sla_duration: {
          number: 24,
          unit: "hours",
        },
      },
    },
    {
      id: "node2",
      type: "form",
      position: { x: 300, y: 400 },
      data: {
        id: "node2",
        name: "Address Collection",
        component_id: "form2",
        component_key: "address-form",
        component_type: "form",
        approval_required: true,
        prerequisites: ["node1"],
        sla_duration: {
          number: 48,
          unit: "hours",
        },
      },
    },
    {
      id: "node3",
      type: "form",
      position: { x: 500, y: 600 },
      data: {
        id: "node3",
        name: "Final Step",
        component_id: "form3",
        component_key: "final-step",
        component_type: "form",
        approval_required: false,
        prerequisites: ["node1", "node2"],
        sla_duration: {
          number: 12,
          unit: "hours",
        },
      },
    },
  ];

  const mockEdges: Edge[] = [
    { source: "node1", target: "node2" },
    { source: "node2", target: "node3" },
    { source: "node1", target: "node3" },
  ];

  describe("mapDtoNodesToGraphNodes", () => {
    it("should map DTO nodes to React Flow nodes correctly", () => {
      const result = mapDtoNodesToGraphNodes(mockForms, mockNodes);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: "node1",
        position: { x: 100, y: 200 },
        type: "form",
        data: {
          label: "User Registration",
          formFields: ["name", "email", "phone"],
          formId: "form1",
          dependencyData: {
            directDependencies: [],
            transitiveDependencies: [],
          },
        },
      });
    });

    it("should handle nodes with direct dependencies", () => {
      const result = mapDtoNodesToGraphNodes(mockForms, mockNodes);
      const node2 = result.find((node) => node.id === "node2");

      expect(node2?.data.dependencyData.directDependencies).toHaveLength(1);
      expect(node2?.data.dependencyData.directDependencies[0]).toEqual({
        nodeId: "node1",
        nodeName: "User Registration",
        formId: "form1",
        formFields: ["name", "email", "phone"],
      });
    });

    it("should handle nodes with transitive dependencies", () => {
      const result = mapDtoNodesToGraphNodes(mockForms, mockNodes);
      const node3 = result.find((node) => node.id === "node3");

      expect(node3?.data.dependencyData.directDependencies).toHaveLength(2);
      expect(node3?.data.dependencyData.transitiveDependencies).toHaveLength(0);

      // Create a more complex dependency chain for transitive testing
      const complexNodes: NodeDto[] = [
        ...mockNodes,
        {
          id: "node4",
          type: "form",
          position: { x: 700, y: 800 },
          data: {
            id: "node4",
            name: "Deep Dependency",
            component_id: "form1",
            component_key: "deep-dep",
            component_type: "form",
            approval_required: false,
            prerequisites: ["node3"],
            sla_duration: { number: 6, unit: "hours" },
          },
        },
      ];

      const complexResult = mapDtoNodesToGraphNodes(mockForms, complexNodes);
      const node4 = complexResult.find((node) => node.id === "node4");

      expect(node4?.data.dependencyData.directDependencies).toHaveLength(1);
      expect(node4?.data.dependencyData.transitiveDependencies).toHaveLength(2);
    });

    it("should handle empty forms array", () => {
      const result = mapDtoNodesToGraphNodes([], mockNodes);

      expect(result).toHaveLength(3);
      result.forEach((node) => {
        expect(node.data.formFields).toEqual([]);
      });
    });

    it("should handle empty nodes array", () => {
      const result = mapDtoNodesToGraphNodes(mockForms, []);

      expect(result).toEqual([]);
    });

    it("should handle nodes with missing form references", () => {
      const nodesWithMissingForms: NodeDto[] = [
        {
          id: "node-missing",
          type: "form",
          position: { x: 0, y: 0 },
          data: {
            id: "node-missing",
            name: "Missing Form Node",
            component_id: "non-existent-form",
            component_key: "missing",
            component_type: "form",
            approval_required: false,
            prerequisites: [],
            sla_duration: { number: 1, unit: "hours" },
          },
        },
      ];

      const result = mapDtoNodesToGraphNodes(mockForms, nodesWithMissingForms);

      expect(result).toHaveLength(1);
      expect(result[0].data.formFields).toEqual([]);
    });

    it("should handle forms with empty properties", () => {
      const result = mapDtoNodesToGraphNodes(mockForms, [mockNodes[2]]);
      const node = result[0];

      expect(node.data.formFields).toEqual([]);
    });

    it("should preserve all node properties", () => {
      const result = mapDtoNodesToGraphNodes(mockForms, [mockNodes[0]]);
      const node = result[0];

      expect(node.id).toBe("node1");
      expect(node.position).toEqual({ x: 100, y: 200 });
      expect(node.type).toBe("form");
      expect(node.data.label).toBe("User Registration");
      expect(node.data.formId).toBe("form1");
    });

    it("should handle circular dependencies gracefully", () => {
      const circularNodes: NodeDto[] = [
        {
          id: "nodeA",
          type: "form",
          position: { x: 0, y: 0 },
          data: {
            id: "nodeA",
            name: "Node A",
            component_id: "form1",
            component_key: "a",
            component_type: "form",
            approval_required: false,
            prerequisites: ["nodeB"],
            sla_duration: { number: 1, unit: "hours" },
          },
        },
        {
          id: "nodeB",
          type: "form",
          position: { x: 100, y: 0 },
          data: {
            id: "nodeB",
            name: "Node B",
            component_id: "form2",
            component_key: "b",
            component_type: "form",
            approval_required: false,
            prerequisites: ["nodeA"],
            sla_duration: { number: 1, unit: "hours" },
          },
        },
      ];

      const result = mapDtoNodesToGraphNodes(mockForms, circularNodes);

      expect(result).toHaveLength(2);
      // Should not cause infinite loops
      expect(result[0].data.dependencyData).toBeDefined();
      expect(result[1].data.dependencyData).toBeDefined();
    });

    it("should handle large datasets efficiently", () => {
      const largeNodes = Array.from({ length: 50 }, (_, i) => ({
        id: `node${i}`,
        type: "form",
        position: { x: i * 100, y: i * 100 },
        data: {
          id: `node${i}`,
          name: `Node ${i}`,
          component_id: "form1",
          component_key: `key${i}`,
          component_type: "form",
          approval_required: false,
          prerequisites: i > 0 ? [`node${i - 1}`] : [],
          sla_duration: { number: 1, unit: "hours" },
        },
      }));

      const result = mapDtoNodesToGraphNodes(mockForms, largeNodes);

      expect(result).toHaveLength(50);
      expect(
        result[49].data.dependencyData.transitiveDependencies
      ).toHaveLength(48);
    });
  });

  describe("mapDtoEdgesToGraphEdges", () => {
    it("should map DTO edges to React Flow edges correctly", () => {
      const result = mapDtoEdgesToGraphEdges(mockEdges);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {
          id: "node1-node2-0",
          source: "node1",
          target: "node2",
        },
        {
          id: "node2-node3-1",
          source: "node2",
          target: "node3",
        },
        {
          id: "node1-node3-2",
          source: "node1",
          target: "node3",
        },
      ]);
    });

    it("should generate unique IDs for edges", () => {
      const duplicateEdges: Edge[] = [
        { source: "node1", target: "node2" },
        { source: "node1", target: "node2" },
        { source: "node1", target: "node2" },
      ];

      const result = mapDtoEdgesToGraphEdges(duplicateEdges);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("node1-node2-0");
      expect(result[1].id).toBe("node1-node2-1");
      expect(result[2].id).toBe("node1-node2-2");
    });

    it("should handle empty edges array", () => {
      const result = mapDtoEdgesToGraphEdges([]);

      expect(result).toEqual([]);
    });

    it("should handle single edge", () => {
      const singleEdge: Edge[] = [{ source: "A", target: "B" }];
      const result = mapDtoEdgesToGraphEdges(singleEdge);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "A-B-0",
        source: "A",
        target: "B",
      });
    });

    it("should handle edges with special characters in node IDs", () => {
      const specialEdges: Edge[] = [
        { source: "node-1_test", target: "node@2#special" },
        { source: "node.with.dots", target: "node with spaces" },
      ];

      const result = mapDtoEdgesToGraphEdges(specialEdges);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("node-1_test-node@2#special-0");
      expect(result[1].id).toBe("node.with.dots-node with spaces-1");
    });

    it("should preserve source and target properties", () => {
      const result = mapDtoEdgesToGraphEdges(mockEdges);

      result.forEach((edge, index) => {
        expect(edge.source).toBe(mockEdges[index].source);
        expect(edge.target).toBe(mockEdges[index].target);
      });
    });

    it("should handle large number of edges", () => {
      const manyEdges = Array.from({ length: 100 }, (_, i) => ({
        source: `source${i}`,
        target: `target${i}`,
      }));

      const result = mapDtoEdgesToGraphEdges(manyEdges);

      expect(result).toHaveLength(100);
      expect(result[0].id).toBe("source0-target0-0");
      expect(result[99].id).toBe("source99-target99-99");
    });

    it("should handle self-referencing edges", () => {
      const selfEdges: Edge[] = [
        { source: "node1", target: "node1" },
        { source: "node2", target: "node2" },
      ];

      const result = mapDtoEdgesToGraphEdges(selfEdges);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "node1-node1-0",
        source: "node1",
        target: "node1",
      });
      expect(result[1]).toEqual({
        id: "node2-node2-1",
        source: "node2",
        target: "node2",
      });
    });
  });

  describe("Integration tests", () => {
    it("should work together to create a complete graph structure", () => {
      const nodes = mapDtoNodesToGraphNodes(mockForms, mockNodes);
      const edges = mapDtoEdgesToGraphEdges(mockEdges);

      // Verify nodes reference existing forms
      nodes.forEach((node) => {
        if (node.data.formId) {
          const form = mockForms.find((f) => f.id === node.data.formId);
          expect(form).toBeDefined();
        }
      });

      // Verify edges reference existing nodes
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        expect(sourceNode).toBeDefined();
        expect(targetNode).toBeDefined();
      });
    });

    it("should maintain referential integrity", () => {
      const nodes = mapDtoNodesToGraphNodes(mockForms, mockNodes);

      // Check that dependency references point to valid nodes
      nodes.forEach((node) => {
        node.data.dependencyData.directDependencies.forEach((dep) => {
          const referencedNode = mockNodes.find((n) => n.id === dep.nodeId);
          expect(referencedNode).toBeDefined();
          expect(referencedNode?.data.name).toBe(dep.nodeName);
        });

        node.data.dependencyData.transitiveDependencies.forEach((dep) => {
          const referencedNode = mockNodes.find((n) => n.id === dep.nodeId);
          expect(referencedNode).toBeDefined();
          expect(referencedNode?.data.name).toBe(dep.nodeName);
        });
      });
    });
  });
});
