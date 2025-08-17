import { DataOption, DependencyData, GlobalData } from "@/types/internal";

export interface DataSection {
  title: string;
  type: "direct" | "transitive" | "global";
  options: DataOption[];
}

/**
 * Helper function to format field labels from snake_case to Title Case
 */
export const formatFieldLabel = (key: string): string => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Builds data sections from dependency data and global data for the prefill modal
 */
export const buildDataSections = (
  dependencyData: DependencyData,
  globalData: GlobalData
): DataSection[] => {
  const sections: DataSection[] = [];

  // Global Data - Action Properties Section (AT THE TOP)
  sections.push({
    title: "Action Properties",
    type: "global",
    options: Object.keys(globalData.actionProperties).map((key) => ({
      label: formatFieldLabel(key),
      value: `action.${key}`,
      source: "Action Properties",
    })),
  });

  // Global Data - Client Organization Properties Section (SECOND)
  sections.push({
    title: "Client Organization Properties",
    type: "global",
    options: Object.keys(globalData.clientOrganizationProperties).map(
      (key) => ({
        label: formatFieldLabel(key),
        value: `organization.${key}`,
        source: "Client Organization Properties",
      })
    ),
  });

  // Direct Dependencies Section
  if (dependencyData.directDependencies.length > 0) {
    dependencyData.directDependencies.forEach((form) => {
      sections.push({
        title: form.nodeName,
        type: "direct",
        options: form.formFields.map((field) => ({
          label: field,
          value: `${form.nodeId}.${field}`,
          source: form.nodeName,
        })),
      });
    });
  }

  // Transitive Dependencies Section
  if (dependencyData.transitiveDependencies.length > 0) {
    dependencyData.transitiveDependencies.forEach((form) => {
      sections.push({
        title: form.nodeName,
        type: "transitive",
        options: form.formFields.map((field) => ({
          label: field,
          value: `${form.nodeId}.${field}`,
          source: form.nodeName,
        })),
      });
    });
  }

  return sections;
};
