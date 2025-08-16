export interface ActionBlueprintGraphDto {
  $schema: string;
  category: string;
  description: string;
  edges: Edge[];
  forms: Form[];
  id: string;
  name: string;
  nodes: Node[];
  tenant_id: string;
}

export interface Edge {
  source: string;
  target: string;
}

interface Form {
  description: string;
  dynamic_field_config: Record<string, DynamicFieldConfig>;
  field_schema: FieldSchema;
  id: string;
  is_reusable: boolean;
  name: string;
  ui_schema: UiSchema;
}

interface DynamicFieldConfig {
  endpoint_id: string;
  payload_fields: Record<string, PayloadField>;
  selector_filed: string;
}

interface PayloadField {
  type: string;
  value: string;
}

interface FieldSchema {
  properties: Record<string, FieldSchemaProperty>;
  required: string[];
  type: string;
}

export interface FieldSchemaProperty {
  avantos_type: string;
  title?: string;
  type: string;
  format?: string;
  items?: {
    enum: string[];
    type: string;
  };
  enum?: string[] | null;
  uniqueItems?: boolean;
}

interface UiSchema {
  elements: UiSchemaElement[];
  type: string;
}

interface UiSchemaElement {
  label: string;
  scope: string;
  type: string;
  options?: Record<string, unknown>;
}

interface Node {
  id: string;
  data: NodeData;
  position: Position;
  type: string;
}

interface Position {
  x: number;
  y: number;
}

interface NodeData {
  approval_required: boolean;
  component_id: string;
  component_key: string;
  component_type: string;
  id: string;
  name: string;
  prerequisites: string[];
  sla_duration: SlaDuration;
}

interface SlaDuration {
  number: number;
  unit: string;
}
