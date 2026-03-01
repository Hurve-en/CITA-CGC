import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const ensureRoot = () => {
  let root = document.getElementById("root");
  if (!root) {
    root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
    // ensure body has basic styles so layout appears
    document.body.style.minHeight = document.body.style.minHeight || "100vh";
  }
  return root;
};

const rootEl = ensureRoot();
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
