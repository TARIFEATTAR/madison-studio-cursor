import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logger } from "./lib/logger";

logger.debug("[main.tsx] Starting app initialization...");

const rootElement = document.getElementById("root");
logger.debug("[main.tsx] Root element:", rootElement);

if (!rootElement) {
  logger.error("[main.tsx] CRITICAL: Root element not found!");
  document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: Root element not found. Check index.html</div>';
} else {
  logger.debug("[main.tsx] Rendering App...");
  try {
    createRoot(rootElement).render(<App />);
    logger.debug("[main.tsx] App render called successfully");
  } catch (error) {
    logger.error("[main.tsx] CRITICAL ERROR during render:", error);
    document.body.innerHTML = `<div style="color: red; padding: 20px;">RENDER ERROR: ${error}</div>`;
  }
}
