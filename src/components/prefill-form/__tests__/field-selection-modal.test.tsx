import { DependencyData } from "@/types/internal";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FieldSelectionModal } from "../field-selection-modal";

// Mock the context
const mockState = {
  globalData: {
    actionProperties: {
      name: "Test Action",
      category: "Test Category",
      tenant_id: "1",
    },
    clientOrganizationProperties: {
      organization_name: "Acme Corp",
      organization_email: "contact@acme.com",
      primary_contact: "John Smith",
    },
  },
};

vi.mock("@/context/actionBlueprintGraphContext", () => ({
  useActionBlueprintGraph: () => ({
    state: mockState,
  }),
}));

// Mock the utils function
vi.mock("@/utils/util", () => ({
  buildDataSections: vi.fn(() => [
    {
      title: "Action Properties",
      type: "global",
      options: [
        { label: "Name", value: "action.name", source: "Action Properties" },
        {
          label: "Category",
          value: "action.category",
          source: "Action Properties",
        },
      ],
    },
    {
      title: "Client Organization Properties",
      type: "global",
      options: [
        {
          label: "Organization Name",
          value: "organization.organization_name",
          source: "Client Organization Properties",
        },
      ],
    },
    {
      title: "Form A",
      type: "direct",
      options: [
        { label: "field1", value: "node1.field1", source: "Form A" },
        { label: "field2", value: "node1.field2", source: "Form A" },
      ],
    },
  ]),
}));

describe("FieldSelectionModal", () => {
  const mockDependencyData: DependencyData = {
    directDependencies: [
      {
        nodeId: "node1",
        nodeName: "Form A",
        formId: "form1",
        formFields: ["field1", "field2"],
      },
    ],
    transitiveDependencies: [],
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onOptionSelect: vi.fn(),
    dependencyData: mockDependencyData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal when open", () => {
    render(<FieldSelectionModal {...defaultProps} />);

    expect(screen.getByText("Select data element to map")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<FieldSelectionModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByText("Select data element to map")
    ).not.toBeInTheDocument();
  });

  it("renders all data sections from buildDataSections", () => {
    render(<FieldSelectionModal {...defaultProps} />);

    expect(screen.getByText("Action Properties")).toBeInTheDocument();
    expect(
      screen.getByText("Client Organization Properties")
    ).toBeInTheDocument();
    expect(screen.getByText("Form A")).toBeInTheDocument();
  });

  it("renders options within each section when expanded", async () => {
    const user = userEvent.setup();
    render(<FieldSelectionModal {...defaultProps} />);

    // Expand the Action Properties accordion
    const actionPropertiesButton = screen.getByText("Action Properties");
    await user.click(actionPropertiesButton);

    // Now the options should be visible
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("calls onOptionSelect when clicking on an option", async () => {
    const user = userEvent.setup();
    render(<FieldSelectionModal {...defaultProps} />);

    // First expand the accordion
    const actionPropertiesButton = screen.getByText("Action Properties");
    await user.click(actionPropertiesButton);

    // Then click on the option
    const nameOption = screen.getByText("Name");
    await user.click(nameOption);

    expect(defaultProps.onOptionSelect).toHaveBeenCalledWith({
      label: "Name",
      value: "action.name",
      source: "Action Properties",
    });
  });

  it("calls onClose when clicking Cancel button", async () => {
    const user = userEvent.setup();
    render(<FieldSelectionModal {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("has proper styling classes for modal content", () => {
    render(<FieldSelectionModal {...defaultProps} />);

    const modalContent = screen
      .getByText("Select data element to map")
      .closest('[role="dialog"]');
    expect(modalContent).toHaveClass(
      "max-w-[700px]",
      "max-h-[80vh]",
      "overflow-hidden",
      "flex",
      "flex-col"
    );
  });

  it("has scrollable content area", () => {
    render(<FieldSelectionModal {...defaultProps} />);

    // Find the scrollable div by its class combination
    const scrollableArea = document.querySelector(
      ".flex-1.overflow-y-auto.pr-2"
    );
    expect(scrollableArea).toBeInTheDocument();
    expect(scrollableArea).toHaveClass("flex-1", "overflow-y-auto", "pr-2");
  });

  it("renders accordion with multiple type", () => {
    render(<FieldSelectionModal {...defaultProps} />);

    // Check if accordion exists by looking for accordion triggers
    const triggers = screen.getAllByRole("button", { expanded: false });
    expect(triggers.length).toBeGreaterThan(0);
  });

  it("handles empty dependency data gracefully", () => {
    const emptyDependencyData: DependencyData = {
      directDependencies: [],
      transitiveDependencies: [],
    };

    render(
      <FieldSelectionModal
        {...defaultProps}
        dependencyData={emptyDependencyData}
      />
    );

    // Should still render global sections
    expect(screen.getByText("Action Properties")).toBeInTheDocument();
    expect(
      screen.getByText("Client Organization Properties")
    ).toBeInTheDocument();
  });

  it("applies correct hover styles to option buttons", async () => {
    const user = userEvent.setup();
    render(<FieldSelectionModal {...defaultProps} />);

    // First expand the accordion to make the option visible
    const actionPropertiesButton = screen.getByText("Action Properties");
    await user.click(actionPropertiesButton);

    // Get the button element, not the text span
    const optionButton = screen.getByText("Name").closest("button");
    expect(optionButton).toHaveClass(
      "flex",
      "items-center",
      "justify-start",
      "w-full",
      "p-3",
      "text-left",
      "hover:bg-gray-50",
      "rounded-md",
      "border",
      "border-gray-200",
      "hover:border-gray-200",
      "transition-all",
      "duration-150"
    );
  });
});
