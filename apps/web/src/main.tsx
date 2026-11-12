import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Login } from "@web/features/auth/presentation/Login";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
if (!root) throw new Error("Root element is missing");
createRoot(root).render(
  <MantineProvider>
    <Login />
  </MantineProvider>,
);
