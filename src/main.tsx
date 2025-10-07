import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("[main.tsx] Starting app initialization...");

const rootElement = document.getElementById("root");
console.log("[main.tsx] Root element:", rootElement);

if (!rootElement) {
  console.error("[main.tsx] CRITICAL: Root element not found!");
  document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: Root element not found. Check index.html</div>';
} else {
  console.log("[main.tsx] Rendering App...");
  try {
    createRoot(rootElement).render(<App />);
    console.log("[main.tsx] App render called successfully");
  } catch (error) {
    console.error("[main.tsx] CRITICAL ERROR during render:", error);
    document.body.innerHTML = `<div style="color: red; padding: 20px;">RENDER ERROR: ${error}</div>`;
  }
}
