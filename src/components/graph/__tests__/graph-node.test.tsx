import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { describe, expect, it, vi } from "vitest";
import { GraphNode } from "../graph-node";

// Mock the form icon since it's an image import
vi.mock("@/assets/form.png", () => ({
  default: "mocked-form-icon.png",
}));

// Wrapper component to provide React Flow context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
);

describe("GraphNode", () => {
  const mockData = {
    label: "Test Form Node",
  };

  it("renders the node with correct label", () => {
    render(<GraphNode data={mockData} />, { wrapper: TestWrapper });

    expect(screen.getByText("Test Form Node")).toBeInTheDocument();
    expect(screen.getByText("Form")).toBeInTheDocument();
  });

  it("renders the form icon with correct attributes", () => {
    render(<GraphNode data={mockData} />, { wrapper: TestWrapper });

    const icon = screen.getByAltText("icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src", "mocked-form-icon.png");
    expect(icon).toHaveClass("w-full", "h-full", "object-cover", "rounded-md");
  });

  it("has the correct CSS classes for styling", () => {
    const { container } = render(<GraphNode data={mockData} />, {
      wrapper: TestWrapper,
    });

    const nodeContainer = container.firstChild;
    expect(nodeContainer).toHaveClass(
      "flex",
      "items-center",
      "justify-start",
      "gap-3",
      "bg-white",
      "rounded-md",
      "p-2",
      "border",
      "w-64"
    );
  });

  it("renders with different label text", () => {
    const differentData = {
      label: "Another Form Node",
    };

    render(<GraphNode data={differentData} />, { wrapper: TestWrapper });

    expect(screen.getByText("Another Form Node")).toBeInTheDocument();
    expect(screen.getByText("Form")).toBeInTheDocument();
  });

  it("has proper structure with icon and text sections", () => {
    render(<GraphNode data={mockData} />, { wrapper: TestWrapper });

    // Check icon container
    const iconContainer = screen.getByAltText("icon").parentElement;
    expect(iconContainer).toHaveClass("w-10", "h-10");

    // Check text container
    expect(screen.getByText("Form")).toHaveClass("text-sm", "text-gray-500");
    expect(screen.getByText("Test Form Node")).toHaveClass("text-lg");
  });
});
