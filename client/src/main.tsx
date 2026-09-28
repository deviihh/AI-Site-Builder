import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
          <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-bp-deep)",
              color: "var(--color-chalk)",
              border: "1px solid var(--color-line)",
              borderRadius: "12px",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);