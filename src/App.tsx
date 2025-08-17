import { FieldMapping, GraphNodeData } from "@/types/internal";
import {
  Background,
  ReactFlow,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import { GraphNode } from "./components/graph/graph-node";
import { PrefillForm } from "./components/prefill-form/prefill-form";
import { useActionBlueprintGraph } from "./context/actionBlueprintGraphContext";

const nodeTypes = {
  form: GraphNode,
};

function App() {
  const { state } = useActionBlueprintGraph();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node);
    setIsDialogOpen(true);
  }, []);

  const getNodeFormState = useCallback(
    (nodeId: string): Record<string, FieldMapping> => {
      const node = state.nodes.find((n) => n.id === nodeId);
      return (node?.data.fieldMappings as Record<string, FieldMapping>) || {};
    },
    [state.nodes]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={state.nodes}
        edges={state.edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
      </ReactFlow>
      {selectedNode && (
        <PrefillForm
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          data={selectedNode.data as unknown as GraphNodeData}
          nodeId={selectedNode.id}
          initialFieldMappings={getNodeFormState(selectedNode.id)}
        />
      )}
    </div>
  );
}

export default App;
