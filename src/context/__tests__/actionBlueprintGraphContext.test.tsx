import { ActionBlueprintGraphState } from "@/types/state";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ActionBlueprintGraphContext,
  useActionBlueprintGraph,
} from "../actionBlueprintGraphContext";

describe("useActionBlueprintGraph", () => {
  const mockState: ActionBlueprintGraphState = {
    nodes: [],
    edges: [],
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

  const mockDispatch = vi.fn();

  const MockProvider = ({ children }: { children: React.ReactNode }) => (
    <ActionBlueprintGraphContext.Provider
      value={{ state: mockState, dispatch: mockDispatch }}
    >
      {children}
    </ActionBlueprintGraphContext.Provider>
  );

  it("should return context value when used within provider", () => {
    const { result } = renderHook(() => useActionBlueprintGraph(), {
      wrapper: MockProvider,
    });

    expect(result.current.state).toBe(mockState);
    expect(result.current.dispatch).toBe(mockDispatch);
  });

  it("should throw error when used outside provider", () => {
    // Suppress console.error for this test since we expect an error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useActionBlueprintGraph());
    }).toThrow(
      "useActionBlueprintGraph must be used within ActionBlueprintGraphProvider"
    );

    consoleSpy.mockRestore();
  });

  it("should throw error when context value is undefined", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const UndefinedProvider = ({ children }: { children: React.ReactNode }) => (
      <ActionBlueprintGraphContext.Provider value={undefined}>
        {children}
      </ActionBlueprintGraphContext.Provider>
    );

    expect(() => {
      renderHook(() => useActionBlueprintGraph(), {
        wrapper: UndefinedProvider,
      });
    }).toThrow(
      "useActionBlueprintGraph must be used within ActionBlueprintGraphProvider"
    );

    consoleSpy.mockRestore();
  });

  it("should return the exact context value provided", () => {
    const customState: ActionBlueprintGraphState = {
      nodes: [
        {
          id: "test-node",
          type: "form",
          position: { x: 0, y: 0 },
          data: {
            label: "Test Form",
            formFields: ["field1"],
            dependencyData: {
              directDependencies: [],
              transitiveDependencies: [],
            },
            fieldMappings: {},
          },
        },
      ],
      edges: [
        {
          id: "test-edge",
          source: "node1",
          target: "node2",
        },
      ],
      globalData: {
        actionProperties: {
          name: "Custom Action",
          category: "Custom Category",
          tenant_id: "123",
        },
        clientOrganizationProperties: {
          organization_name: "Custom Org",
          organization_email: "custom@org.com",
          primary_contact: "Custom Contact",
        },
      },
    };

    const customDispatch = vi.fn();

    const CustomProvider = ({ children }: { children: React.ReactNode }) => (
      <ActionBlueprintGraphContext.Provider
        value={{ state: customState, dispatch: customDispatch }}
      >
        {children}
      </ActionBlueprintGraphContext.Provider>
    );

    const { result } = renderHook(() => useActionBlueprintGraph(), {
      wrapper: CustomProvider,
    });

    expect(result.current.state).toBe(customState);
    expect(result.current.dispatch).toBe(customDispatch);
    expect(result.current.state.nodes).toHaveLength(1);
    expect(result.current.state.edges).toHaveLength(1);
    expect(result.current.state.globalData.actionProperties.name).toBe(
      "Custom Action"
    );
  });
});
