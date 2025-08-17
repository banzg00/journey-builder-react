import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ActionBlueprintGraphProvider } from "./context/actionBlueprintGraphContextProvider.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ActionBlueprintGraphProvider>
      <App />
    </ActionBlueprintGraphProvider>
  </StrictMode>
);
