import {
  Alert,
  Button,
  Container,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Navigate } from "@tanstack/react-router";
import { useCompanies } from "@web/features/auth/application/useCompanies";
import { useSession } from "@web/features/auth/application/useSession";
import { useState } from "react";
export function Login() {
  const { session, loading, error, login } = useSession();
  const [type, setType] = useState<"admin" | "company" | "debitor">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const { companies, companyError } = useCompanies(type);
  if (session) return <Navigate to="/" replace />;
  return (
    <Container size="xs">
      <Stack>
        <Title>Credit System</Title>
        <Text>Masuk ke akun</Text>
        {error && <Alert color="red">{error}</Alert>}
        {companyError && <Alert color="red">{companyError}</Alert>}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void login({ type, username, password, ...(slug ? { slug } : {}) });
          }}
        >
          <Stack>
            <Select
              label="Jenis akun"
              data={[
                { value: "admin", label: "Admin bank" },
                { value: "company", label: "Perusahaan / HRD" },
                { value: "debitor", label: "Debitor" },
              ]}
              value={type}
              allowDeselect={false}
              onChange={(v) => {
                if (v === "admin" || v === "company" || v === "debitor") {
                  setType(v);
                  setSlug(null);
                }
              }}
            />
            {type !== "admin" && (
              <Select
                label="Perusahaan"
                data={companies}
                value={slug}
                onChange={setSlug}
                required
              />
            )}
            <TextInput
              label="Username atau email"
              value={username}
              onChange={(event) => setUsername(event.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
            />
            <Button type="submit" loading={loading}>
              Masuk
            </Button>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
