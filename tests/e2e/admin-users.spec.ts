import { expect, test } from "@playwright/test";

const password = process.env.SEED_PASSWORD;
test.skip(!password, "Synthetic test database and seed password required");
test("admin CRUD, role checks and conflicts", async ({ request }) => {
  const signIn = async (username: string) => {
    const response = await request.post("/api/login", {
      data: { type: "admin", username, password },
    });
    expect(response.status()).toBe(200);
    return (await response.json()).authToken as string;
  };
  const writer = await signIn("admin_sintetis");
  const reader = await signIn("admin_baca");
  const writeHeaders = { Authorization: `Bearer ${writer}` };
  const readHeaders = { Authorization: `Bearer ${reader}` };
  expect((await request.get("/api/admin-users")).status()).toBe(401);
  expect(
    (await request.get("/api/admin-users", { headers: readHeaders })).status(),
  ).toBe(200);
  const data = {
    username: "p03_admin",
    email: "p03@example.invalid",
    password: "Secret123",
    isActive: true,
    roles: [{ programId: 900002, value: "READ" }],
  };
  expect(
    (
      await request.post("/api/admin-user/create", {
        headers: readHeaders,
        data,
      })
    ).status(),
  ).toBe(403);
  const created = await request.post("/api/admin-user/create", {
    headers: writeHeaders,
    data,
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  const detail = await request.get(`/api/admin-user?id=${id}`, {
    headers: readHeaders,
  });
  expect(detail.status()).toBe(200);
  const record = await detail.json();
  expect(record.roles).toEqual([{ programId: 900002, value: "READ" }]);
  expect(JSON.stringify(record)).not.toContain("password");
  expect(
    (
      await request.post("/api/admin-user/create", {
        headers: writeHeaders,
        data,
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.put("/api/admin-user/update", {
        headers: writeHeaders,
        data: { ...data, id, roles: [{ programId: 123456, value: "WRITE" }] },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await (
        await request.get(`/api/admin-user?id=${id}`, { headers: readHeaders })
      ).json()
    ).roles,
  ).toEqual([{ programId: 900002, value: "READ" }]);
  expect(
    (
      await request.put("/api/admin-user/update", {
        headers: writeHeaders,
        data: { ...data, id, roles: [{ programId: 900003, value: "WRITE" }] },
      })
    ).status(),
  ).toBe(200);
  const filtered = await (
    await request.get("/api/admin-users?username=p03_admin", {
      headers: readHeaders,
    })
  ).json();
  expect(filtered.count).toBe(1);
  expect(
    (
      await request.put("/api/admin-user/delete", {
        headers: writeHeaders,
        data: { id },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.get(`/api/admin-user?id=${id}`, { headers: readHeaders })
    ).status(),
  ).toBe(404);
});
test("admin interface adds and finds a user", async ({ page }) => {
  const username = `p03_ui_${Date.now()}`;
  await page.goto("/");
  await page.getByLabel("Username atau email").fill("admin_sintetis");
  await page.getByLabel("Password").fill(password ?? "");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Admin User" })).toBeVisible();
  await page.getByRole("button", { name: "Tambah administrator" }).click();
  await page.getByLabel("Username administrator").fill(username);
  await page
    .getByLabel("Email administrator")
    .fill(`${username}@example.invalid`);
  await page.getByLabel("Password administrator").fill("Secret123");
  await page.getByRole("button", { name: "Simpan" }).click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByRole("cell", { name: username }) });
  await expect(row).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await row.getByRole("button", { name: "Hapus" }).click();
  await expect(row).toHaveCount(0);
});

test("read-only admin can inspect but cannot edit", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Username atau email").fill("admin_baca");
  await page.getByLabel("Password").fill(password ?? "");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Admin User" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tambah administrator" }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ubah" })).toHaveCount(0);
  await page.getByRole("button", { name: "Lihat" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Detail administrator" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Simpan" })).toHaveCount(0);
});
