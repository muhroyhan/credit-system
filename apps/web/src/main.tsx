import "@mantine/core/styles.css";
import { MantineProvider, Container, Title } from "@mantine/core";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(<MantineProvider><Container><Title>Credit System</Title></Container></MantineProvider>);
