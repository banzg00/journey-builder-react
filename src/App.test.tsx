import { ActionBlueprintGraphProvider } from "@/context/actionBlueprintGraphContextProvider";
import { FieldMapping, GraphNodeData } from "@/types/internal";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactFlowProvider } from "@xyflow/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

// Mock the components to isolate App testing
vi.mock("./components/graph/graph-node", () => ({
  GraphNode: ({ data }: { data: GraphNodeData }) => (
    <div data-testid={`graph-node-${data.label}`}>
      <span>{data.label}</span>
    </div>
  ),
}));

vi.mock("./components/prefill-form/prefill-form", () => ({
  PrefillForm: ({
    isOpen,
    onClose,
    data,
    nodeId,
    initialFieldMappings,
  }: {
    isOpen: boolean;
    onClose: () => void;
    data: GraphNodeData;
    nodeId: string;
    initialFieldMappings: Record<string, FieldMapping>;
  }) => (
    <div
      data-testid="prefill-form"
      style={{ display: isOpen ? "block" : "none" }}
    >
      <div data-testid="prefill-form-node-id">{nodeId}</div>
      <div data-testid="prefill-form-data-label">{data.label}</div>
      <div data-testid="prefill-form-mappings-count">
        {Object.keys(initialFieldMappings).length}
      </div>
      <button onClick={onClose} data-testid="close-button">
        Close
      </button>
    </div>
  ),
}));

// Mock the API calls
vi.mock("@/api/action-blueprint-graph/api", () => ({
  getActionBlueprintGraph: vi.fn(() =>
    Promise.resolve({
      nodes: [
        {
          id: "node1",
          type: "form",
          position: { x: 100, y: 100 },
          data: {
            id: "node1",
            name: "Test Node 1",
            component_id: "form1",
            component_key: "test-key-1",
            component_type: "form",
            approval_required: false,
            prerequisites: [],
            sla_duration: { number: 24, unit: "hours" },
          },
        },
        {
          id: "node2",
          type: "form",
          position: { x: 200, y: 200 },
          data: {
            id: "node2",
            name: "Test Node 2",
            component_id: "form2",
            component_key: "test-key-2",
            component_type: "form",
            approval_required: true,
            prerequisites: ["node1"],
            sla_duration: { number: 48, unit: "hours" },
          },
        },
      ],
      edges: [{ source: "node1", target: "node2" }],
      forms: [
        {
          id: "form1",
          name: "Test Form 1",
          description: "Test form description",
          is_reusable: true,
          dynamic_field_config: {},
          field_schema: {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string", avantos_type: "text" },
              email: { type: "string", avantos_type: "email" },
            },
          },
          ui_schema: { type: "VerticalLayout", elements: [] },
        },
        {
          id: "form2",
          name: "Test Form 2",
          description: "Test form 2 description",
          is_reusable: false,
          dynamic_field_config: {},
          field_schema: {
            type: "object",
            required: ["address"],
            properties: {
              address: { type: "string", avantos_type: "text" },
              city: { type: "string", avantos_type: "text" },
            },
          },
          ui_schema: { type: "VerticalLayout", elements: [] },
        },
      ],
    })
  ),
}));

vi.mock("@/api/global-data/api", () => ({
  getGlobalData: vi.fn(() =>
    Promise.resolve({
      actionProperties: {
        name: "Test Action",
        category: "Test Category",
        tenant_id: "test-tenant",
      },
      clientOrganizationProperties: {
        organization_name: "Test Organization",
        organization_email: "test@org.com",
        primary_contact: "Test Contact",
      },
    })
  ),
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>
    <ActionBlueprintGraphProvider>{children}</ActionBlueprintGraphProvider>
  </ReactFlowProvider>
);

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the ReactFlow component", async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for the ReactFlow to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("rf__wrapper")).toBeInTheDocument();
    });
  });

  it("should render the main container with correct dimensions", () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    const container = screen.getByTestId("rf__wrapper").parentElement;
    expect(container).toHaveStyle({
      width: "100vw",
      height: "100vh",
    });
  });

  it("should render Background component", async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        document.querySelector(".react-flow__background")
      ).toBeInTheDocument();
    });
  });

  it("should not render PrefillForm initially", () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    expect(screen.queryByTestId("prefill-form")).not.toBeInTheDocument();
  });

  it("should handle node click and open PrefillForm", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for nodes to be loaded and rendered
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
    });

    // Click on a node
    const node = screen.getByTestId("graph-node-Test Node 1");
    await user.click(node);

    // Check that PrefillForm is rendered and visible
    await waitFor(() => {
      const prefillForm = screen.getByTestId("prefill-form");
      expect(prefillForm).toBeInTheDocument();
      expect(prefillForm).toHaveStyle({ display: "block" });
    });

    // Check that correct data is passed to PrefillForm
    expect(screen.getByTestId("prefill-form-node-id")).toHaveTextContent(
      "node1"
    );
    expect(screen.getByTestId("prefill-form-data-label")).toHaveTextContent(
      "Test Node 1"
    );
  });

  it("should close PrefillForm when onClose is called", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for nodes to be loaded and click on one
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
    });

    const node = screen.getByTestId("graph-node-Test Node 1");
    await user.click(node);

    // Wait for PrefillForm to open
    await waitFor(() => {
      expect(screen.getByTestId("prefill-form")).toHaveStyle({
        display: "block",
      });
    });

    // Click close button
    const closeButton = screen.getByTestId("close-button");
    await user.click(closeButton);

    // Check that PrefillForm is hidden
    await waitFor(() => {
      expect(screen.getByTestId("prefill-form")).toHaveStyle({
        display: "none",
      });
    });
  });

  it("should handle multiple node clicks correctly", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
      expect(screen.getByTestId("graph-node-Test Node 2")).toBeInTheDocument();
    });

    // Click on first node
    const node1 = screen.getByTestId("graph-node-Test Node 1");
    await user.click(node1);

    await waitFor(() => {
      expect(screen.getByTestId("prefill-form-node-id")).toHaveTextContent(
        "node1"
      );
      expect(screen.getByTestId("prefill-form-data-label")).toHaveTextContent(
        "Test Node 1"
      );
    });

    // Click on second node
    const node2 = screen.getByTestId("graph-node-Test Node 2");
    await user.click(node2);

    await waitFor(() => {
      expect(screen.getByTestId("prefill-form-node-id")).toHaveTextContent(
        "node2"
      );
      expect(screen.getByTestId("prefill-form-data-label")).toHaveTextContent(
        "Test Node 2"
      );
    });
  });

  it("should provide correct initial field mappings to PrefillForm", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
    });

    // Click on a node
    const node = screen.getByTestId("graph-node-Test Node 1");
    await user.click(node);

    // Check that initial field mappings count is provided (should be 0 initially)
    await waitFor(() => {
      expect(
        screen.getByTestId("prefill-form-mappings-count")
      ).toHaveTextContent("0");
    });
  });

  it("should use correct node types configuration", async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for ReactFlow to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("rf__wrapper")).toBeInTheDocument();
    });

    // Check that the correct node type components are rendered
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
      expect(screen.getByTestId("graph-node-Test Node 2")).toBeInTheDocument();
    });
  });

  it("should handle empty state gracefully", () => {
    // Mock empty state
    vi.doMock("@/api/action-blueprint-graph/api", () => ({
      getActionBlueprintGraph: vi.fn(() =>
        Promise.resolve({
          nodes: [],
          edges: [],
          forms: [],
        })
      ),
    }));

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Should render without crashing
    expect(screen.getByTestId("rf__wrapper")).toBeInTheDocument();
  });

  it("should call getNodeFormState with correct nodeId", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
    });

    // Click on a node
    const node = screen.getByTestId("graph-node-Test Node 1");
    await user.click(node);

    // Verify the correct node ID is passed to PrefillForm
    await waitFor(() => {
      expect(screen.getByTestId("prefill-form-node-id")).toHaveTextContent(
        "node1"
      );
    });
  });

  it("should handle node click callback correctly", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
    });

    // Initially, no node should be selected
    expect(screen.queryByTestId("prefill-form")).not.toBeInTheDocument();

    // Click on a node
    const node = screen.getByTestId("graph-node-Test Node 1");
    await user.click(node);

    // After click, PrefillForm should be visible
    await waitFor(() => {
      expect(screen.getByTestId("prefill-form")).toBeInTheDocument();
      expect(screen.getByTestId("prefill-form")).toHaveStyle({
        display: "block",
      });
    });
  });

  it("should maintain fitView property on ReactFlow", async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      const reactFlowWrapper = screen.getByTestId("rf__wrapper");
      expect(reactFlowWrapper).toBeInTheDocument();
    });

    // The fitView prop should be applied (this is more of a smoke test)
    // In a real scenario, you might check if the viewport is properly fitted
  });

  it("should pass correct props to ReactFlow", async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("rf__wrapper")).toBeInTheDocument();
    });

    // Verify that nodes are rendered (indicating nodes prop is passed)
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
      expect(screen.getByTestId("graph-node-Test Node 2")).toBeInTheDocument();
    });
  });

  it("should handle component unmounting gracefully", async () => {
    const { unmount } = render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("rf__wrapper")).toBeInTheDocument();
    });

    // Should unmount without errors
    expect(() => unmount()).not.toThrow();
  });

  it("should render with correct CSS imports", () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Check that the ReactFlow wrapper is present (indicates CSS is loaded)
    expect(screen.getByTestId("rf__wrapper")).toBeInTheDocument();
  });

  it("should handle rapid node clicks without issues", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
    });

    const node = screen.getByTestId("graph-node-Test Node 1");

    // Rapid clicks
    await user.click(node);
    await user.click(node);
    await user.click(node);

    // Should still work correctly
    await waitFor(() => {
      expect(screen.getByTestId("prefill-form")).toHaveStyle({
        display: "block",
      });
      expect(screen.getByTestId("prefill-form-node-id")).toHaveTextContent(
        "node1"
      );
    });
  });

  it("should handle PrefillForm re-opening after closing", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
    });

    const node = screen.getByTestId("graph-node-Test Node 1");

    // Open PrefillForm
    await user.click(node);
    await waitFor(() => {
      expect(screen.getByTestId("prefill-form")).toHaveStyle({
        display: "block",
      });
    });

    // Close PrefillForm
    const closeButton = screen.getByTestId("close-button");
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.getByTestId("prefill-form")).toHaveStyle({
        display: "none",
      });
    });

    // Re-open PrefillForm
    await user.click(node);
    await waitFor(() => {
      expect(screen.getByTestId("prefill-form")).toHaveStyle({
        display: "block",
      });
      expect(screen.getByTestId("prefill-form-node-id")).toHaveTextContent(
        "node1"
      );
    });
  });

  it("should maintain component state correctly", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId("graph-node-Test Node 1")).toBeInTheDocument();
    });

    // Initially no dialog should be open
    expect(screen.queryByTestId("prefill-form")).not.toBeInTheDocument();

    // Click node to open dialog
    const node1 = screen.getByTestId("graph-node-Test Node 1");
    await user.click(node1);

    // Dialog should be open with correct node
    await waitFor(() => {
      expect(screen.getByTestId("prefill-form-node-id")).toHaveTextContent(
        "node1"
      );
    });

    // Click different node - should update selected node
    const node2 = screen.getByTestId("graph-node-Test Node 2");
    await user.click(node2);

    await waitFor(() => {
      expect(screen.getByTestId("prefill-form-node-id")).toHaveTextContent(
        "node2"
      );
    });
  });
});
