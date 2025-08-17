import { Edge, Form, NodeDto } from "@/api/action-blueprint-graph/dto";
import { DependencyData, DependencyForm } from "@/types/internal";
import { type Node } from "@xyflow/react";

export const mapDtoNodesToGraphNodes = (
  forms: Form[],
  nodes: NodeDto[]
): Node[] => {
  return nodes.map((node) => ({
    id: node.id,
    position: node.position,
    type: node.type,
    data: {
      label: node.data.name,
      formFields: getFormFields(forms, node),
      formId: node.data.component_id,
      dependencyData: getAllDependencyForms(node, nodes, forms),
    },
  }));
};

export const mapDtoEdgesToGraphEdges = (edges: Edge[]) => {
  return edges.map((edge, index) => ({
    id: `${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
  }));
};

const getFormFields = (forms: Form[], node: NodeDto) => {
  const form = forms.find((form) => form.id === node.data.component_id);
  return Object.keys(form?.field_schema.properties || {});
};

// Get direct dependencies (prerequisites)
const getDirectDependencies = (
  node: NodeDto,
  allNodes: NodeDto[],
  forms: Form[]
) => {
  const directDeps = node.data.prerequisites || [];
  return directDeps.map((depId) => {
    const depNode = allNodes.find((n) => n.id === depId);
    const form = forms.find((f) => f.id === depNode?.data.component_id);
    return {
      nodeId: depId,
      nodeName: depNode?.data.name || "",
      formId: depNode?.data.component_id || "",
      formFields: Object.keys(form?.field_schema.properties || {}),
    };
  });
};

// Get transitive dependencies (excluding direct ones)
const getTransitiveDependencies = (
  node: NodeDto,
  allNodes: NodeDto[],
  forms: Form[]
) => {
  const visited = new Set<string>();
  const directDeps = new Set(node.data.prerequisites || []);
  const queue: string[] = [...directDeps];
  const transitiveDeps: DependencyForm[] = [];

  directDeps.forEach((depId) => visited.add(depId));

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;

    const currentNode = allNodes.find((n) => n.id === currentNodeId);
    if (!currentNode) continue;

    const prerequisites = currentNode.data.prerequisites || [];
    prerequisites.forEach((prereqId) => {
      if (!visited.has(prereqId)) {
        visited.add(prereqId);

        const prereqNode = allNodes.find((n) => n.id === prereqId);
        const form = forms.find((f) => f.id === prereqNode?.data.component_id);

        if (prereqNode && form) {
          transitiveDeps.push({
            nodeId: prereqId,
            nodeName: prereqNode.data.name,
            formId: prereqNode.data.component_id,
            formFields: Object.keys(form.field_schema.properties || {}),
          });
        }

        queue.push(prereqId);
      }
    });
  }

  return transitiveDeps;
};

// Get all dependency data structured by type
const getAllDependencyForms = (
  node: NodeDto,
  allNodes: NodeDto[],
  forms: Form[]
): DependencyData => {
  return {
    directDependencies: getDirectDependencies(node, allNodes, forms),
    transitiveDependencies: getTransitiveDependencies(node, allNodes, forms),
  };
};
