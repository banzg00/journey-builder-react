import { getActionBlueprintGraph } from "./api/action-blueprint-graph/api";

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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import { GraphNode } from "./components/graph-node";

const nodeTypes = {
  graphNode: GraphNode,
};

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

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
          position: { x: node.position.x, y: node.position.y },
          data: { label: node.data.name },
          type: "graphNode",
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

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default App;
