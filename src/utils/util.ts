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
  globalData: GlobalData,
  activeFilters?: DataSectionType[]
): DataSection[] => {
  const sections = [];

  if (!activeFilters || activeFilters.length === 0) {
    for (const key in DataSectionType) {
      const dataSections = getSections(
        dependencyData,
        globalData,
        key as DataSectionType
      );
      sections.push(...dataSections);
    }
    return sections;
  }

  for (const activeFilter of activeFilters!) {
    const dataSections = getSections(dependencyData, globalData, activeFilter);
    sections.push(...dataSections);
  }

  return sections;
};

const getSections = (
  dependencyData: DependencyData,
  globalData: GlobalData,
  sectionType: DataSectionType
): DataSection[] => {
  const sectionData: DataSection[] = [];

  const sectionHandler = {
    [DataSectionType.GLOBAL]: () => {
      sectionData.push({
        title: "Action Properties",
        type: DataSectionType.GLOBAL,
        options: Object.keys(globalData.actionProperties).map((key) => ({
          label: formatFieldLabel(key),
          value: `action.${key}`,
          source: "Action Properties",
        })),
      });

      sectionData.push({
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
    },
    [DataSectionType.DIRECT]: () => {
      dependencyData.directDependencies.forEach((form) => {
        sectionData.push({
          title: form.nodeName,
          type: DataSectionType.DIRECT,
          options: form.formFields.map((field) => ({
            label: field,
            value: `${form.nodeId}.${field}`,
            source: form.nodeName,
          })),
        });
      });
    },
    [DataSectionType.TRANSITIVE]: () => {
      dependencyData.transitiveDependencies.forEach((form) => {
        sectionData.push({
          title: form.nodeName,
          type: DataSectionType.TRANSITIVE,
          options: form.formFields.map((field) => ({
            label: field,
            value: `${form.nodeId}.${field}`,
            source: form.nodeName,
          })),
        });
      });
    },
  };

  sectionHandler[sectionType]();
  return sectionData;
};
