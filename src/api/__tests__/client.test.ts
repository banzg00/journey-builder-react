import { describe, expect, it } from "vitest";
import apiClient from "../client";

describe("API Client", () => {
  it("should be configured with correct base URL", () => {
    expect(apiClient.defaults.baseURL).toBe("http://localhost:3000");
  });

  it("should have correct default headers", () => {
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("should be an axios instance", () => {
    expect(apiClient.get).toBeDefined();
    expect(apiClient.post).toBeDefined();
    expect(apiClient.put).toBeDefined();
    expect(apiClient.delete).toBeDefined();
    expect(apiClient.patch).toBeDefined();
  });

  it("should have interceptors available", () => {
    expect(apiClient.interceptors).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });

  it("should allow configuration override", () => {
    const customConfig = {
      timeout: 5000,
      headers: {
        "Custom-Header": "test-value",
      },
    };

    // Test that we can create requests with custom config (without actually making the request)
    expect(() => {
      const request = apiClient.getUri({
        url: "/test",
        ...customConfig,
      });
      expect(request).toContain("/test");
    }).not.toThrow();
  });
});
