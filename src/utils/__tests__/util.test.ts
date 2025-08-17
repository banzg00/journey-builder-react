import type { DependencyData, GlobalData } from "@/types/internal";
import { describe, expect, it } from "vitest";
import { buildDataSections, formatFieldLabel, type DataSection } from "../util";

describe("Util Functions", () => {
  // Mock data for testing
  const mockGlobalData: GlobalData = {
    actionProperties: {
      name: "Test Action",
      category: "Test Category",
      tenant_id: "tenant_123",
    },
    clientOrganizationProperties: {
      organization_name: "Test Organization",
      organization_email: "test@org.com",
      primary_contact: "John Doe",
    },
  };

  const mockDependencyData: DependencyData = {
    directDependencies: [
      {
        nodeId: "node1",
        nodeName: "User Profile",
        formId: "form1",
        formFields: ["firstName", "lastName", "email", "phone"],
      },
      {
        nodeId: "node2",
        nodeName: "Address Form",
        formId: "form2",
        formFields: ["street", "city", "zipCode", "country"],
      },
    ],
    transitiveDependencies: [
      {
        nodeId: "node3",
        nodeName: "Previous Step",
        formId: "form3",
        formFields: ["previousData", "timestamp"],
      },
      {
        nodeId: "node4",
        nodeName: "Initial Setup",
        formId: "form4",
        formFields: ["setupConfig", "userPreferences"],
      },
    ],
  };

  describe("formatFieldLabel", () => {
    it("should format snake_case to Title Case", () => {
      expect(formatFieldLabel("first_name")).toBe("First Name");
      expect(formatFieldLabel("last_name")).toBe("Last Name");
      expect(formatFieldLabel("email_address")).toBe("Email Address");
      expect(formatFieldLabel("organization_name")).toBe("Organization Name");
    });

    it("should handle single words", () => {
      expect(formatFieldLabel("name")).toBe("Name");
      expect(formatFieldLabel("email")).toBe("Email");
      expect(formatFieldLabel("category")).toBe("Category");
    });

    it("should handle multiple underscores", () => {
      expect(formatFieldLabel("user_profile_data")).toBe("User Profile Data");
      expect(formatFieldLabel("client_organization_properties")).toBe(
        "Client Organization Properties"
      );
      expect(formatFieldLabel("very_long_field_name_here")).toBe(
        "Very Long Field Name Here"
      );
    });

    it("should handle empty strings", () => {
      expect(formatFieldLabel("")).toBe("");
    });

    it("should handle strings without underscores", () => {
      expect(formatFieldLabel("alreadyformatted")).toBe("Alreadyformatted");
      expect(formatFieldLabel("UPPERCASE")).toBe("UPPERCASE");
      expect(formatFieldLabel("MixedCase")).toBe("MixedCase");
    });

    it("should handle edge cases", () => {
      expect(formatFieldLabel("_")).toBe(" ");
      expect(formatFieldLabel("__")).toBe("  ");
      expect(formatFieldLabel("_field_")).toBe(" Field ");
      expect(formatFieldLabel("field__name")).toBe("Field  Name");
    });

    it("should handle numeric and special characters", () => {
      expect(formatFieldLabel("field_1_name")).toBe("Field 1 Name");
      expect(formatFieldLabel("user_123_data")).toBe("User 123 Data");
      expect(formatFieldLabel("test_field_v2")).toBe("Test Field V2");
    });

    it("should be case sensitive for first letters only", () => {
      expect(formatFieldLabel("firstName")).toBe("FirstName");
      expect(formatFieldLabel("first_name")).toBe("First Name");
      expect(formatFieldLabel("FIRST_NAME")).toBe("FIRST NAME");
    });
  });

  describe("buildDataSections", () => {
    it("should build complete data sections with all types", () => {
      const result = buildDataSections(mockDependencyData, mockGlobalData);

      expect(result).toHaveLength(6); // 2 global + 2 direct + 2 transitive
      expect(result[0].title).toBe("Action Properties");
      expect(result[1].title).toBe("Client Organization Properties");
      expect(result[2].title).toBe("User Profile");
      expect(result[3].title).toBe("Address Form");
      expect(result[4].title).toBe("Previous Step");
      expect(result[5].title).toBe("Initial Setup");
    });

    it("should create correct action properties section", () => {
      const result = buildDataSections(mockDependencyData, mockGlobalData);
      const actionSection = result.find((s) => s.title === "Action Properties");

      expect(actionSection).toBeDefined();
      expect(actionSection?.type).toBe("global");
      expect(actionSection?.options).toHaveLength(3);
      expect(actionSection?.options).toEqual([
        {
          label: "Name",
          value: "action.name",
          source: "Action Properties",
        },
        {
          label: "Category",
          value: "action.category",
          source: "Action Properties",
        },
        {
          label: "Tenant Id",
          value: "action.tenant_id",
          source: "Action Properties",
        },
      ]);
    });

    it("should create correct client organization properties section", () => {
      const result = buildDataSections(mockDependencyData, mockGlobalData);
      const orgSection = result.find(
        (s) => s.title === "Client Organization Properties"
      );

      expect(orgSection).toBeDefined();
      expect(orgSection?.type).toBe("global");
      expect(orgSection?.options).toHaveLength(3);
      expect(orgSection?.options).toEqual([
        {
          label: "Organization Name",
          value: "organization.organization_name",
          source: "Client Organization Properties",
        },
        {
          label: "Organization Email",
          value: "organization.organization_email",
          source: "Client Organization Properties",
        },
        {
          label: "Primary Contact",
          value: "organization.primary_contact",
          source: "Client Organization Properties",
        },
      ]);
    });

    it("should create correct direct dependencies sections", () => {
      const result = buildDataSections(mockDependencyData, mockGlobalData);
      const directSections = result.filter((s) => s.type === "direct");

      expect(directSections).toHaveLength(2);

      const userProfileSection = directSections.find(
        (s) => s.title === "User Profile"
      );
      expect(userProfileSection?.options).toEqual([
        {
          label: "firstName",
          value: "node1.firstName",
          source: "User Profile",
        },
        {
          label: "lastName",
          value: "node1.lastName",
          source: "User Profile",
        },
        {
          label: "email",
          value: "node1.email",
          source: "User Profile",
        },
        {
          label: "phone",
          value: "node1.phone",
          source: "User Profile",
        },
      ]);
    });

    it("should create correct transitive dependencies sections", () => {
      const result = buildDataSections(mockDependencyData, mockGlobalData);
      const transitiveSections = result.filter((s) => s.type === "transitive");

      expect(transitiveSections).toHaveLength(2);

      const previousStepSection = transitiveSections.find(
        (s) => s.title === "Previous Step"
      );
      expect(previousStepSection?.options).toEqual([
        {
          label: "previousData",
          value: "node3.previousData",
          source: "Previous Step",
        },
        {
          label: "timestamp",
          value: "node3.timestamp",
          source: "Previous Step",
        },
      ]);
    });

    it("should handle empty dependency data", () => {
      const emptyDependencyData: DependencyData = {
        directDependencies: [],
        transitiveDependencies: [],
      };

      const result = buildDataSections(emptyDependencyData, mockGlobalData);

      expect(result).toHaveLength(2); // Only global sections
      expect(result[0].title).toBe("Action Properties");
      expect(result[1].title).toBe("Client Organization Properties");
    });

    it("should handle empty global data", () => {
      const emptyGlobalData: GlobalData = {
        actionProperties: {
          name: "",
          category: "",
          tenant_id: "",
        },
        clientOrganizationProperties: {
          organization_name: "",
          organization_email: "",
          primary_contact: "",
        },
      };

      const result = buildDataSections(mockDependencyData, emptyGlobalData);

      // Should still create global sections but with empty options
      const globalSections = result.filter((s) => s.type === "global");
      expect(globalSections).toHaveLength(2);
      expect(globalSections[0].options).toHaveLength(3);
      expect(globalSections[1].options).toHaveLength(3);
    });

    it("should handle mixed empty and populated data", () => {
      const mixedDependencyData: DependencyData = {
        directDependencies: [mockDependencyData.directDependencies[0]],
        transitiveDependencies: [],
      };

      const result = buildDataSections(mixedDependencyData, mockGlobalData);

      expect(result).toHaveLength(3); // 2 global + 1 direct
      expect(result.filter((s) => s.type === "global")).toHaveLength(2);
      expect(result.filter((s) => s.type === "direct")).toHaveLength(1);
      expect(result.filter((s) => s.type === "transitive")).toHaveLength(0);
    });

    it("should maintain correct section order", () => {
      const result = buildDataSections(mockDependencyData, mockGlobalData);

      // Global sections should come first
      expect(result[0].type).toBe("global");
      expect(result[1].type).toBe("global");

      // Then direct dependencies
      const firstDirectIndex = result.findIndex((s) => s.type === "direct");
      const firstTransitiveIndex = result.findIndex(
        (s) => s.type === "transitive"
      );

      expect(firstDirectIndex).toBeGreaterThan(1);
      expect(firstTransitiveIndex).toBeGreaterThan(firstDirectIndex);
    });

    it("should handle forms with no fields", () => {
      const emptyFieldsDependencyData: DependencyData = {
        directDependencies: [
          {
            nodeId: "empty-node",
            nodeName: "Empty Form",
            formId: "empty-form",
            formFields: [],
          },
        ],
        transitiveDependencies: [],
      };

      const result = buildDataSections(
        emptyFieldsDependencyData,
        mockGlobalData
      );

      const directSection = result.find((s) => s.title === "Empty Form");
      expect(directSection?.options).toHaveLength(0);
    });

    it("should handle special characters in field names", () => {
      const specialCharsDependencyData: DependencyData = {
        directDependencies: [
          {
            nodeId: "special-node",
            nodeName: "Special Form",
            formId: "special-form",
            formFields: [
              "field-with-dashes",
              "field_with_underscores",
              "field.with.dots",
            ],
          },
        ],
        transitiveDependencies: [],
      };

      const result = buildDataSections(
        specialCharsDependencyData,
        mockGlobalData
      );

      const specialSection = result.find((s) => s.title === "Special Form");
      expect(specialSection?.options).toEqual([
        {
          label: "field-with-dashes",
          value: "special-node.field-with-dashes",
          source: "Special Form",
        },
        {
          label: "field_with_underscores",
          value: "special-node.field_with_underscores",
          source: "Special Form",
        },
        {
          label: "field.with.dots",
          value: "special-node.field.with.dots",
          source: "Special Form",
        },
      ]);
    });

    it("should handle large datasets efficiently", () => {
      const largeDependencyData: DependencyData = {
        directDependencies: Array.from({ length: 20 }, (_, i) => ({
          nodeId: `node${i}`,
          nodeName: `Form ${i}`,
          formId: `form${i}`,
          formFields: Array.from({ length: 10 }, (_, j) => `field${j}`),
        })),
        transitiveDependencies: Array.from({ length: 30 }, (_, i) => ({
          nodeId: `trans-node${i}`,
          nodeName: `Transitive Form ${i}`,
          formId: `trans-form${i}`,
          formFields: Array.from({ length: 5 }, (_, j) => `transField${j}`),
        })),
      };

      const result = buildDataSections(largeDependencyData, mockGlobalData);

      expect(result).toHaveLength(52); // 2 global + 20 direct + 30 transitive
      expect(result.filter((s) => s.type === "global")).toHaveLength(2);
      expect(result.filter((s) => s.type === "direct")).toHaveLength(20);
      expect(result.filter((s) => s.type === "transitive")).toHaveLength(30);
    });

    it("should create immutable data structures", () => {
      const result = buildDataSections(mockDependencyData, mockGlobalData);

      // Modifying the result should not affect subsequent calls
      result[0].title = "Modified Title";
      result[0].options[0].label = "Modified Label";

      const result2 = buildDataSections(mockDependencyData, mockGlobalData);

      expect(result2[0].title).toBe("Action Properties");
      expect(result2[0].options[0].label).toBe("Name");
    });

    it("should handle unicode and international characters", () => {
      const unicodeGlobalData: GlobalData = {
        actionProperties: {
          name: "Test Name",
          category: "Test Category",
          tenant_id: "123",
        },
        clientOrganizationProperties: {
          organization_name: "Организация",
          organization_email: "test@example.com",
          primary_contact: "José María",
        },
      };

      const result = buildDataSections(mockDependencyData, unicodeGlobalData);

      const actionSection = result.find((s) => s.title === "Action Properties");
      expect(actionSection?.options).toContainEqual({
        label: "Name",
        value: "action.name",
        source: "Action Properties",
      });

      const orgSection = result.find(
        (s) => s.title === "Client Organization Properties"
      );
      expect(orgSection?.options).toContainEqual({
        label: "Organization Name",
        value: "organization.organization_name",
        source: "Client Organization Properties",
      });
    });

    it("should return correct DataSection interface structure", () => {
      const result = buildDataSections(mockDependencyData, mockGlobalData);

      result.forEach((section: DataSection) => {
        expect(section).toHaveProperty("title");
        expect(section).toHaveProperty("type");
        expect(section).toHaveProperty("options");
        expect(typeof section.title).toBe("string");
        expect(["direct", "transitive", "global"]).toContain(section.type);
        expect(Array.isArray(section.options)).toBe(true);

        section.options.forEach((option) => {
          expect(option).toHaveProperty("label");
          expect(option).toHaveProperty("value");
          expect(option).toHaveProperty("source");
          expect(typeof option.label).toBe("string");
          expect(typeof option.value).toBe("string");
          expect(typeof option.source).toBe("string");
        });
      });
    });
  });

  describe("Integration tests", () => {
    it("should work together to format labels in data sections", () => {
      const globalDataWithSnakeCase: GlobalData = {
        actionProperties: {
          name: "Test Action",
          category: "Test Category",
          tenant_id: "123",
        },
        clientOrganizationProperties: {
          organization_name: "Test Org",
          organization_email: "test@org.com",
          primary_contact: "John Doe",
        },
      };

      const result = buildDataSections(
        mockDependencyData,
        globalDataWithSnakeCase
      );

      const actionSection = result.find((s) => s.title === "Action Properties");
      expect(actionSection?.options).toContainEqual({
        label: "Name",
        value: "action.name",
        source: "Action Properties",
      });

      const orgSection = result.find(
        (s) => s.title === "Client Organization Properties"
      );
      expect(orgSection?.options).toContainEqual({
        label: "Primary Contact",
        value: "organization.primary_contact",
        source: "Client Organization Properties",
      });
    });

    it("should maintain data integrity across multiple calls", () => {
      const result1 = buildDataSections(mockDependencyData, mockGlobalData);
      const result2 = buildDataSections(mockDependencyData, mockGlobalData);

      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // Should be different objects
    });
  });
});
