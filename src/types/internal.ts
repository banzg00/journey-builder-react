export interface DependencyForm {
  nodeId: string;
  nodeName: string;
  formId: string;
  formFields: string[];
}

export interface DependencyData {
  directDependencies: DependencyForm[];
  transitiveDependencies: DependencyForm[];
}

export interface GlobalData {
  actionProperties: {
    name: string;
    category: string;
    tenant_id: string;
  };
  clientOrganizationProperties: {
    organization_name: string;
    organization_email: string;
    primary_contact: string;
  };
}

export interface FieldMapping {
  label: string;
  value: string;
  source: string;
}

// Type alias for clarity - DataOption is conceptually the same as FieldMapping
export type DataOption = FieldMapping;

export interface GraphNodeData {
  label: string;
  formFields: string[];
  dependencyData: DependencyData;
  fieldMappings: Record<string, FieldMapping>;
}
