import { DependencyData } from "@/types/internal";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrefillForm } from "../prefill-form";

// Mock the context
const mockDispatch = vi.fn();
vi.mock("@/context/actionBlueprintGraphContext", () => ({
  useActionBlueprintGraph: () => ({
    dispatch: mockDispatch,
    state: {
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
    },
  }),
}));

// Mock the FieldSelectionModal
vi.mock("../field-selection-modal", () => ({
  FieldSelectionModal: ({
    isOpen,
    onClose,
    onOptionSelect,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onOptionSelect: (option: {
      label: string;
      value: string;
      source: string;
    }) => void;
  }) =>
    isOpen ? (
      <div
        data-testid="field-selection-modal"
        style={{ pointerEvents: "auto" }}
      >
        <button
          onClick={() =>
            onOptionSelect({
              label: "Test Field",
              value: "test.field",
              source: "Test Source",
            })
          }
          style={{ pointerEvents: "auto" }}
        >
          Select Test Option
        </button>
        <button onClick={onClose} style={{ pointerEvents: "auto" }}>
          Close Modal
        </button>
      </div>
    ) : null,
}));

// Mock assets
vi.mock("@/assets/database-icon.svg", () => ({
  default: "mocked-database-icon.svg",
}));

describe("PrefillForm", () => {
  const mockDependencyData: DependencyData = {
    directDependencies: [
      {
        nodeId: "node1",
        nodeName: "Form A",
        formId: "form1",
        formFields: ["field1", "field2"],
      },
    ],
    transitiveDependencies: [
      {
        nodeId: "node2",
        nodeName: "Form B",
        formId: "form2",
        formFields: ["field3", "field4"],
      },
    ],
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    data: {
      formFields: ["name", "email", "phone"],
      dependencyData: mockDependencyData,
    },
    nodeId: "test-node-1",
    initialFieldMappings: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dialog when open", () => {
    render(<PrefillForm {...defaultProps} />);

    expect(screen.getByText("Prefill Form")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders all form fields as buttons when no mappings exist", () => {
    render(<PrefillForm {...defaultProps} />);

    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("phone")).toBeInTheDocument();
  });

  it("renders mapped fields as populated divs with remove buttons", () => {
    const mappedProps = {
      ...defaultProps,
      initialFieldMappings: {
        name: {
          label: "Full Name",
          value: "user.fullName",
          source: "User Profile",
        },
      },
    };

    render(<PrefillForm {...mappedProps} />);

    expect(screen.getByText("User Profile.Full Name")).toBeInTheDocument();
    expect(screen.getByTitle("Remove mapping")).toBeInTheDocument();
  });

  it("opens field selection modal when clicking on unmapped field", async () => {
    const user = userEvent.setup();
    render(<PrefillForm {...defaultProps} />);

    const nameField = screen.getByText("name");
    await user.click(nameField);

    expect(screen.getByTestId("field-selection-modal")).toBeInTheDocument();
  });

  it("does not open modal when clicking on mapped field container", async () => {
    const user = userEvent.setup();
    const mappedProps = {
      ...defaultProps,
      initialFieldMappings: {
        name: {
          label: "Full Name",
          value: "user.fullName",
          source: "User Profile",
        },
      },
    };

    render(<PrefillForm {...mappedProps} />);

    // Click on the mapped field container (the div, not the remove button)
    const mappedFieldContainer = screen
      .getByText("User Profile.Full Name")
      .closest("div");
    await user.click(mappedFieldContainer!);

    expect(
      screen.queryByTestId("field-selection-modal")
    ).not.toBeInTheDocument();
  });

  it("dispatches UPDATE_FORM_FIELD_MAPPING when selecting an option", async () => {
    const user = userEvent.setup();
    render(<PrefillForm {...defaultProps} />);

    // Click on a field to open modal
    await user.click(screen.getByText("name"));

    // Click on the select option in the mock modal
    await user.click(screen.getByText("Select Test Option"));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "UPDATE_FORM_FIELD_MAPPING",
      payload: {
        nodeId: "test-node-1",
        fieldName: "name",
        mapping: {
          label: "Test Field",
          value: "test.field",
          source: "Test Source",
        },
      },
    });
  });

  it("dispatches REMOVE_FORM_FIELD_MAPPING when removing a mapping", async () => {
    const user = userEvent.setup();
    const mappedProps = {
      ...defaultProps,
      initialFieldMappings: {
        name: {
          label: "Full Name",
          value: "user.fullName",
          source: "User Profile",
        },
      },
    };

    render(<PrefillForm {...mappedProps} />);

    const removeButton = screen.getByTitle("Remove mapping");
    await user.click(removeButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "REMOVE_FORM_FIELD_MAPPING",
      payload: {
        nodeId: "test-node-1",
        fieldName: "name",
      },
    });
  });

  it("syncs local state when initialFieldMappings change", () => {
    const { rerender } = render(<PrefillForm {...defaultProps} />);

    // Initially no mappings
    expect(screen.getByText("name")).toBeInTheDocument();

    // Update with mappings
    const newMappings = {
      name: {
        label: "Full Name",
        value: "user.fullName",
        source: "User Profile",
      },
    };

    rerender(
      <PrefillForm {...defaultProps} initialFieldMappings={newMappings} />
    );

    expect(screen.getByText("User Profile.Full Name")).toBeInTheDocument();
  });

  it("closes field selection modal when onClose is called", async () => {
    const user = userEvent.setup();
    render(<PrefillForm {...defaultProps} />);

    // Open modal
    await user.click(screen.getByText("name"));
    expect(screen.getByTestId("field-selection-modal")).toBeInTheDocument();

    // Close modal
    await user.click(screen.getByText("Close Modal"));
    expect(
      screen.queryByTestId("field-selection-modal")
    ).not.toBeInTheDocument();
  });

  it("renders database icon for each unmapped field", () => {
    render(<PrefillForm {...defaultProps} />);

    const databaseIcons = screen.getAllByAltText("database");
    expect(databaseIcons).toHaveLength(3); // name, email, phone
    databaseIcons.forEach((icon) => {
      expect(icon).toHaveAttribute("src", "mocked-database-icon.svg");
    });
  });
});
