import "@mantine/core/styles.css";
import { Container, MantineProvider, Title } from "@mantine/core";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
if (!root) throw new Error("Root element is missing");
createRoot(root).render(
  <MantineProvider>
    <Container>
      <Title>Credit System</Title>
    </Container>
  </MantineProvider>,
);
