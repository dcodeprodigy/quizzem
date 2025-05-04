import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.jsx";
import { ToastBar } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <StrictMode>
      {/* <ToastBar/> */}
      <App />
    </StrictMode>
  </HelmetProvider>
);