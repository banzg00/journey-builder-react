import {
  DataSection,
  DataSectionType,
  DependencyData,
  GlobalData,
} from "@/types/internal";

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

  sections.push({
    title: "Action Properties",
    type: DataSectionType.GLOBAL,
    options: Object.keys(globalData.actionProperties).map((key) => ({
      label: formatFieldLabel(key),
      value: `action.${key}`,
      source: "Action Properties",
    })),
  });

  sections.push({
    title: "Client Organization Properties",
    type: DataSectionType.GLOBAL,
    options: Object.keys(globalData.clientOrganizationProperties).map(
      (key) => ({
        label: formatFieldLabel(key),
        value: `organization.${key}`,
        source: "Client Organization Properties",
      })
    ),
  });

  if (dependencyData.directDependencies.length > 0) {
    dependencyData.directDependencies.forEach((form) => {
      sections.push({
        title: form.nodeName,
        type: DataSectionType.DIRECT,
        options: form.formFields.map((field) => ({
          label: field,
          value: `${form.nodeId}.${field}`,
          source: form.nodeName,
        })),
      });
    });
  }

  if (dependencyData.transitiveDependencies.length > 0) {
    dependencyData.transitiveDependencies.forEach((form) => {
      sections.push({
        title: form.nodeName,
        type: DataSectionType.TRANSITIVE,
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
