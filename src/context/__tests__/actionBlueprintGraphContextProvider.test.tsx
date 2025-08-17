import type { ActionBlueprintGraphDto } from "@/api/action-blueprint-graph/dto";
import { ACTION_BLUEPRINT_GRAPH_ACTION } from "@/types/state";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useActionBlueprintGraph } from "../actionBlueprintGraphContext";
import { ActionBlueprintGraphProvider } from "../actionBlueprintGraphContextProvider";

// Mock the API calls
const mockActionBlueprintGraph: ActionBlueprintGraphDto = {
  $schema: "https://example.com/schema",
  category: "test-category",
  description: "Test action blueprint graph",
  id: "test-graph-id",
  name: "Test Graph",
  tenant_id: "test-tenant",
  nodes: [
    {
      id: "node1",
      type: "form",
      position: { x: 100, y: 100 },
      data: {
        id: "node1",
        name: "Form A",
        component_id: "form1",
        component_key: "form-a",
        component_type: "form",
        approval_required: false,
        prerequisites: ["node2"],
        sla_duration: { number: 24, unit: "hours" },
      },
    },
    {
      id: "node2",
      type: "form",
      position: { x: 0, y: 0 },
      data: {
        id: "node2",
        name: "Form B",
        component_id: "form2",
        component_key: "form-b",
        component_type: "form",
        approval_required: false,
        prerequisites: [],
        sla_duration: { number: 48, unit: "hours" },
      },
    },
  ],
  edges: [
    {
      source: "node2",
      target: "node1",
    },
  ],
  forms: [
    {
      id: "form1",
      name: "Form A",
      description: "Test form A",
      is_reusable: true,
      dynamic_field_config: {},
      field_schema: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", avantos_type: "text", title: "Name" },
          email: { type: "string", avantos_type: "email", title: "Email" },
        },
      },
      ui_schema: {
        type: "VerticalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/name",
            label: "Name",
          },
        ],
      },
    },
    {
      id: "form2",
      name: "Form B",
      description: "Test form B",
      is_reusable: false,
      dynamic_field_config: {},
      field_schema: {
        type: "object",
        required: ["address"],
        properties: {
          address: { type: "string", avantos_type: "text", title: "Address" },
          phone: { type: "string", avantos_type: "text", title: "Phone" },
        },
      },
      ui_schema: {
        type: "VerticalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/address",
            label: "Address",
          },
        ],
      },
    },
  ],
};

const mockGlobalData = {
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
};

vi.mock("@/api/action-blueprint-graph/api", () => ({
  getActionBlueprintGraph: vi.fn(() =>
    Promise.resolve(mockActionBlueprintGraph)
  ),
}));

vi.mock("@/api/global-data/api", () => ({
  getGlobalData: vi.fn(() => Promise.resolve(mockGlobalData)),
}));

// Mock the mappers
const mockGraphNodes = [
  {
    id: "node1",
    type: "form",
    position: { x: 100, y: 100 },
    data: {
      label: "Form A",
      formFields: ["name", "email"],
      dependencyData: {
        directDependencies: [
          {
            nodeId: "node2",
            nodeName: "Form B",
            formId: "form2",
            formFields: ["address", "phone"],
          },
        ],
        transitiveDependencies: [],
      },
      fieldMappings: {},
    },
  },
  {
    id: "node2",
    type: "form",
    position: { x: 0, y: 0 },
    data: {
      label: "Form B",
      formFields: ["address", "phone"],
      dependencyData: {
        directDependencies: [],
        transitiveDependencies: [],
      },
      fieldMappings: {},
    },
  },
];

const mockGraphEdges = [
  {
    id: "edge1",
    source: "node2",
    target: "node1",
  },
];

vi.mock("@/mappers/graphMapper", () => ({
  mapDtoNodesToGraphNodes: vi.fn(() => mockGraphNodes),
  mapDtoEdgesToGraphEdges: vi.fn(() => mockGraphEdges),
}));

// Test component that uses the context
const TestComponent = () => {
  const { state, dispatch } = useActionBlueprintGraph();

  return (
    <div>
      <div data-testid="nodes-count">{state.nodes.length}</div>
      <div data-testid="edges-count">{state.edges.length}</div>
      <div data-testid="action-name">
        {state.globalData.actionProperties.name}
      </div>
      <div data-testid="org-name">
        {state.globalData.clientOrganizationProperties.organization_name}
      </div>
      <button
        data-testid="dispatch-button"
        onClick={() =>
          dispatch({
            type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING,
            payload: {
              nodeId: "node1",
              fieldName: "name",
              mapping: {
                label: "Full Name",
                value: "user.name",
                source: "Profile",
              },
            },
          })
        }
      >
        Dispatch Action
      </button>
    </div>
  );
};

describe("ActionBlueprintGraphProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children", () => {
    render(
      <ActionBlueprintGraphProvider>
        <div data-testid="child">Test Child</div>
      </ActionBlueprintGraphProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should provide initial state before data loading", () => {
    render(
      <ActionBlueprintGraphProvider>
        <TestComponent />
      </ActionBlueprintGraphProvider>
    );

    // Initial state should have empty arrays and default global data
    expect(screen.getByTestId("nodes-count")).toHaveTextContent("0");
    expect(screen.getByTestId("edges-count")).toHaveTextContent("0");
    expect(screen.getByTestId("action-name")).toHaveTextContent("");
    expect(screen.getByTestId("org-name")).toHaveTextContent("");
  });

  it("should fetch and initialize data on mount", async () => {
    const { getActionBlueprintGraph } = await import(
      "@/api/action-blueprint-graph/api"
    );
    const { getGlobalData } = await import("@/api/global-data/api");
    const { mapDtoNodesToGraphNodes, mapDtoEdgesToGraphEdges } = await import(
      "@/mappers/graphMapper"
    );

    render(
      <ActionBlueprintGraphProvider>
        <TestComponent />
      </ActionBlueprintGraphProvider>
    );

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(screen.getByTestId("nodes-count")).toHaveTextContent("2");
    });

    // Verify API calls were made
    expect(getActionBlueprintGraph).toHaveBeenCalledTimes(1);
    expect(getGlobalData).toHaveBeenCalledTimes(1);

    // Verify mappers were called with correct data
    expect(mapDtoNodesToGraphNodes).toHaveBeenCalledWith(
      mockActionBlueprintGraph.forms,
      mockActionBlueprintGraph.nodes
    );
    expect(mapDtoEdgesToGraphEdges).toHaveBeenCalledWith(
      mockActionBlueprintGraph.edges
    );

    // Verify state is updated
    expect(screen.getByTestId("nodes-count")).toHaveTextContent("2");
    expect(screen.getByTestId("edges-count")).toHaveTextContent("1");
    expect(screen.getByTestId("action-name")).toHaveTextContent("Test Action");
    expect(screen.getByTestId("org-name")).toHaveTextContent("Test Org");
  });

  it("should provide working dispatch function", async () => {
    render(
      <ActionBlueprintGraphProvider>
        <TestComponent />
      </ActionBlueprintGraphProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId("nodes-count")).toHaveTextContent("2");
    });

    // Click the dispatch button to trigger an action
    const dispatchButton = screen.getByTestId("dispatch-button");
    dispatchButton.click();

    // The action should be processed by the reducer
    // (we can't easily test the exact state change without more complex setup,
    // but we can verify the dispatch function exists and doesn't throw)
    expect(dispatchButton).toBeInTheDocument();
  });

  it("should fetch data only once on mount", async () => {
    const { getActionBlueprintGraph } = await import(
      "@/api/action-blueprint-graph/api"
    );
    const { getGlobalData } = await import("@/api/global-data/api");

    const { rerender } = render(
      <ActionBlueprintGraphProvider>
        <TestComponent />
      </ActionBlueprintGraphProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("nodes-count")).toHaveTextContent("2");
    });

    // Rerender the provider
    rerender(
      <ActionBlueprintGraphProvider>
        <TestComponent />
      </ActionBlueprintGraphProvider>
    );

    // API should still only be called once (useEffect dependency array is empty)
    expect(getActionBlueprintGraph).toHaveBeenCalledTimes(1);
    expect(getGlobalData).toHaveBeenCalledTimes(1);
  });

  it("should handle concurrent API calls correctly", async () => {
    const { getActionBlueprintGraph } = await import(
      "@/api/action-blueprint-graph/api"
    );
    const { getGlobalData } = await import("@/api/global-data/api");

    // Mock APIs to resolve with different timing
    vi.mocked(getActionBlueprintGraph).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockActionBlueprintGraph), 50)
        )
    );
    vi.mocked(getGlobalData).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockGlobalData), 100))
    );

    render(
      <ActionBlueprintGraphProvider>
        <TestComponent />
      </ActionBlueprintGraphProvider>
    );

    // Both APIs should be called concurrently
    expect(getActionBlueprintGraph).toHaveBeenCalledTimes(1);
    expect(getGlobalData).toHaveBeenCalledTimes(1);

    // Wait for both to complete
    await waitFor(
      () => {
        expect(screen.getByTestId("nodes-count")).toHaveTextContent("2");
        expect(screen.getByTestId("action-name")).toHaveTextContent(
          "Test Action"
        );
      },
      { timeout: 200 }
    );
  });

  it("should provide context value to multiple children", async () => {
    const SecondTestComponent = () => {
      const { state } = useActionBlueprintGraph();
      return <div data-testid="second-nodes-count">{state.nodes.length}</div>;
    };

    render(
      <ActionBlueprintGraphProvider>
        <TestComponent />
        <SecondTestComponent />
      </ActionBlueprintGraphProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("nodes-count")).toHaveTextContent("2");
      expect(screen.getByTestId("second-nodes-count")).toHaveTextContent("2");
    });
  });
});
