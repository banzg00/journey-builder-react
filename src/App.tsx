import { getActionBlueprintGraph } from "./api/action-blueprint-graph/api";
import { type Form, type NodeDto } from "./api/action-blueprint-graph/dto";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import { GraphNode } from "./components/graph-node";
import { PrefillForm } from "./components/prefill-form";

const nodeTypes = {
  form: GraphNode,
};

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getData = async () => {
    const data = await getActionBlueprintGraph();
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData();
      setNodes(
        data.nodes.map((node) => ({
          id: node.id,
          position: node.position,
          data: {
            label: node.data.name,
            formFields: getFormFields(data.forms, node),
          },
          type: node.type,
        }))
      );
      setEdges(
        data.edges.map((edge, index) => ({
          id: `${edge.source}-${edge.target}-${index}`,
          source: edge.source,
          target: edge.target,
        }))
      );
    };

    fetchData();
  }, []);

  const getFormFields = (forms: Form[], node: NodeDto) => {
    const form = forms.find((form) => form.id === node.data.component_id);
    return Object.keys(form?.field_schema.properties || {});
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node);
    setIsDialogOpen(true);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
      </ReactFlow>
      {selectedNode && (
        <PrefillForm
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          data={selectedNode.data as { formFields: string[] }}
        />
      )}
    </div>
  );
}

export default App;
