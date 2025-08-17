import { GlobalDataDto } from "./dto";

export const getGlobalData = async (): Promise<GlobalDataDto> => {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Mock global data - simplified
    const globalData: GlobalDataDto = {
      actionProperties: {
        name: "Onboard Customer 0",
        category: "Category 4",
        tenant_id: "1",
      },
      clientOrganizationProperties: {
        organization_name: "Acme Corporation",
        organization_email: "contact@acme.com",
        primary_contact: "John Smith",
      },
    };

    return globalData;
  } catch (error) {
    console.error(`Failed to fetch global data: ${error}`);
    throw error;
  }
};
