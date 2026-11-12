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
import { useSession } from "@web/features/auth/application/useSession";
import { getSlugs } from "@web/features/auth/data/gateway";
import { useEffect, useState } from "react";
export function Login() {
  const { session, loading, error, login, logout } = useSession();
  const [type, setType] = useState<"admin" | "company" | "debitor">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [companies, setCompanies] = useState<
    { value: string; label: string }[]
  >([]);
  const [companyError, setCompanyError] = useState("");
  useEffect(() => {
    if (type === "admin") return;
    let active = true;
    setCompanyError("");
    getSlugs()
      .then((items) => {
        if (active)
          setCompanies(
            items
              .filter((v) => v.slug)
              .map((v) => ({
                value: v.slug as string,
                label: v.companyName ?? (v.slug as string),
              })),
          );
      })
      .catch(() => {
        if (active) setCompanyError("Gagal memuat daftar perusahaan");
      });
    return () => {
      active = false;
    };
  }, [type]);
  if (window.location.pathname !== "/")
    return (
      <Container>
        <Title>Halaman tidak ditemukan</Title>
        <a href="/">Kembali</a>
      </Container>
    );
  if (session)
    return (
      <Container>
        <Stack>
          <Text>Beranda</Text>
          <Title>Credit System</Title>
          <Text>Masuk sebagai {session.type}</Text>
          <Button onClick={logout}>Keluar</Button>
        </Stack>
      </Container>
    );
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
