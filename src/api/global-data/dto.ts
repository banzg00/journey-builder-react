export interface GlobalDataDto {
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
