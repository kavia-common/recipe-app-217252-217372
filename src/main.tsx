import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

/**
 * PUBLIC_INTERFACE
 * Bootstraps the React application by rendering the root App component.
 * This is the primary client entrypoint loaded by index.html.
 */
function bootstrap(): void {
  const container = document.getElementById("root");
  if (!container) {
    // Fail fast and visibly if the root container is missing to prevent silent blank pages.
    // eslint-disable-next-line no-console
    console.error("Root container #root not found");
    const body = document.querySelector("body");
    if (body) {
      const msg = document.createElement("pre");
      msg.textContent = "Critical error: Root container #root not found.";
      body.appendChild(msg);
    }
    return;
  }
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

bootstrap();
