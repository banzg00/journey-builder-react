import "@testing-library/jest-dom";

// Mock ResizeObserver for ReactFlow
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver for ReactFlow
global.IntersectionObserver = class IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = "0px";
  thresholds: ReadonlyArray<number> = [];

  constructor(
    _callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    // Mock implementation - store options if needed
    if (options?.root) this.root = options.root;
    if (options?.rootMargin) this.rootMargin = options.rootMargin;
    if (options?.threshold) {
      this.thresholds = Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold];
    }
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock window.matchMedia for ReactFlow
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
