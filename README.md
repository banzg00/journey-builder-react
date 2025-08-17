# Journey Builder React

A visual workflow builder application for creating and managing action blueprints with interactive graph-based forms. Built with React, TypeScript, and React Flow for creating dynamic, interconnected form workflows.

## Overview

Journey Builder is a React application that allows users to:

- **Visualize workflows** as interactive node graphs using React Flow
- **Configure form fields** with dynamic prefill capabilities from multiple data sources
- **Manage dependencies** between workflow nodes (direct and transitive)
- **Map field values** from global data, action properties, and dependent form outputs

The application fetches workflow definitions via REST API and renders them as an interactive graph where users can click on nodes to configure field mappings through a modal interface.

## Features

- 🎯 **Interactive Graph Visualization** - Drag, zoom, and interact with workflow nodes
- 📋 **Dynamic Form Configuration** - Configure field mappings with intelligent data source suggestions
- 🔗 **Dependency Management** - Automatic detection of direct and transitive dependencies
- 🌐 **Multiple Data Sources** - Support for global data, action properties, and form dependencies
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- ✅ **Comprehensive Testing** - Full test coverage with Vitest and Testing Library
- 🔧 **Type Safety** - Full TypeScript implementation with strict type checking

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Backend API** running on `http://localhost:3000` (see API Requirements below)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd journey-builder-react
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### API Requirements

The application expects a backend API running on `http://localhost:3000` with the following endpoints:

- `GET /api/v1/123/actions/blueprints/123/graph` - Returns action blueprint graph data
- Additional global data endpoints (currently mocked)

**Mock Data**: The application includes mock data for development. Check `src/api/global-data/api.ts` for the current mock implementation.

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Generate test coverage
npm run test:coverage

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Key Patterns & Structure

The application follows these architectural patterns:

#### 1. **Context + Reducer Pattern**

- **Global State Management**: Uses React Context with useReducer for application state
- **Location**: `src/context/actionBlueprintGraphContext.ts`
- **Provider**: `src/context/actionBlueprintGraphContextProvider.tsx`
- **Reducer**: `src/state/actionBlueprintGraphReducer.ts`

```typescript
// State structure
interface ActionBlueprintGraphState {
  nodes: Node[];
  edges: Edge[];
  globalData: GlobalData;
}
```

#### 2. **API Layer Pattern**

- **Centralized HTTP Client**: `src/api/client.ts`
- **Domain-Specific APIs**: Organized by feature (e.g., `src/api/action-blueprint-graph/`)
- **DTO Pattern**: Separate Data Transfer Objects from internal types

#### 3. **Mapper Pattern**

- **Data Transformation**: `src/mappers/graphMapper.ts`
- **Purpose**: Converts API DTOs to internal application types
- **Dependency Resolution**: Automatically calculates direct and transitive dependencies

#### 4. **Component Composition**

- **Reusable UI Components**: `src/components/ui/` (based on Radix UI)
- **Feature Components**: Domain-specific components like `GraphNode` and `PrefillForm`
- **Custom Node Types**: React Flow integration with custom node rendering

### Directory Structure

```
src/
├── api/                    # API layer and HTTP client
│   ├── client.ts          # Axios configuration
│   ├── action-blueprint-graph/  # Blueprint API
│   └── global-data/       # Global data API
├── components/            # React components
│   ├── graph/            # Graph-specific components
│   ├── prefill-form/     # Form configuration components
│   └── ui/               # Reusable UI components
├── context/              # React Context and providers
├── mappers/              # Data transformation utilities
├── state/                # State management (reducers)
├── types/                # TypeScript type definitions
│   ├── internal.ts       # Internal application types
│   └── state.ts          # State-related types
└── utils/                # Utility functions
```

## Extending with New Data Sources

### Adding a New Data Source

To add a new data source (e.g., "User Preferences"), follow these steps:

#### 1. **Define the Data Structure**

Add your data interface to `src/types/state.ts`:

```typescript
export interface GlobalData {
  actionProperties: {
    /* existing */
  };
  clientOrganizationProperties: {
    /* existing */
  };
  userPreferences: {
    // Add new data source
    theme: string;
    language: string;
    notifications: boolean;
  };
}
```

#### 2. **Create API Integration**

Create a new API module in `src/api/user-preferences/`:

```typescript
// src/api/user-preferences/api.ts
export const getUserPreferences = async (): Promise<UserPreferencesDto> => {
  const response = await apiClient.get("/api/v1/user/preferences");
  return response.data;
};

// src/api/user-preferences/dto.ts
export interface UserPreferencesDto {
  theme: string;
  language: string;
  notifications: boolean;
}
```

#### 3. **Update Context Provider**

Modify `src/context/actionBlueprintGraphContextProvider.tsx`:

```typescript
import { getUserPreferences } from "../api/user-preferences/api";

// Add to fetchData function
const fetchData = async () => {
  const [actionBlueprintGraph, globalData, userPreferences] = await Promise.all(
    [
      getActionBlueprintGraph(),
      getGlobalData(),
      getUserPreferences(), // Add new API call
    ]
  );

  // Include in dispatch payload
  dispatch({
    type: ACTION_BLUEPRINT_GRAPH_ACTION.INIT_STATE,
    payload: {
      nodes: graphNodes,
      edges: graphEdges,
      globalData: { ...globalData, userPreferences },
    },
  });
};
```

#### 4. **Update Data Sections Builder**

Modify `src/utils/util.ts` to include your new data source:

```typescript
export const buildDataSections = (
  dependencyData: DependencyData,
  globalData: GlobalData
): DataSection[] => {
  const sections: DataSection[] = [];

  // Add your new section
  sections.push({
    title: "User Preferences",
    type: "global",
    options: Object.keys(globalData.userPreferences).map((key) => ({
      label: formatFieldLabel(key),
      value: `user.${key}`,
      source: "User Preferences",
    })),
  });

  // ... existing sections
};
```

#### 5. **Update Initial State**

Add default values in the context provider's `initialState`:

```typescript
const initialState: ActionBlueprintGraphState = {
  // ... existing state
  globalData: {
    // ... existing properties
    userPreferences: {
      theme: "",
      language: "",
      notifications: false,
    },
  },
};
```

### Data Source Types

The application supports three types of data sources:

1. **Global Data** (`type: "global"`)

   - Available to all nodes
   - Examples: Action properties, organization data
   - Prefix pattern: `action.*`, `organization.*`

2. **Direct Dependencies** (`type: "direct"`)

   - From immediate prerequisite nodes
   - Based on `prerequisites` array in node data
   - Prefix pattern: `{nodeId}.*`

3. **Transitive Dependencies** (`type: "transitive"`)
   - From indirect dependencies (dependencies of dependencies)
   - Calculated automatically via graph traversal
   - Prefix pattern: `{nodeId}.*`

## Development Guidelines

### Code Patterns to Follow

#### 1. **Type Safety**

- Always define TypeScript interfaces for new data structures
- Use strict type checking (`typescript-eslint` rules)
- Separate DTOs from internal types

#### 2. **State Management**

- Use the reducer pattern for complex state updates
- Keep actions immutable
- Define clear action types in `src/types/state.ts`

#### 3. **API Integration**

- Centralize HTTP configuration in `src/api/client.ts`
- Use async/await with proper error handling
- Implement proper loading states

#### 4. **Component Design**

- Keep components focused and single-purpose
- Use composition over inheritance
- Implement proper prop interfaces

#### 5. **Testing**

- Write tests for all new features
- Use Testing Library best practices
- Maintain test coverage above 80%

### Testing Patterns

```typescript
// Component testing example
import { render, screen } from "@testing-library/react";
import { ActionBlueprintGraphProvider } from "../context/actionBlueprintGraphContextProvider";

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ActionBlueprintGraphProvider>{component}</ActionBlueprintGraphProvider>
  );
};
```

### Common Gotchas

1. **Node Data Structure**: React Flow nodes have a specific `data` property structure
2. **Dependency Calculation**: Transitive dependencies are calculated recursively
3. **Field Mapping Updates**: Always use the reducer for state updates
4. **API Mocking**: Current global data API is mocked - replace with real endpoints

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Flow** - Interactive graph visualization
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - Component library built on Radix UI and Tailwind CSS
- **Radix UI** - Accessible component primitives
- **Axios** - HTTP client
- **Vitest** - Testing framework
- **Testing Library** - Component testing utilities
