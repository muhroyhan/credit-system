import { expect, test } from "@playwright/test";

const password = process.env.SEED_PASSWORD;
test.skip(!password, "Synthetic database required");
test("company API permissions, tenant scope and deletion guard", async ({
  request,
}) => {
  const login = async (username: string, type = "admin", slug?: string) => {
    const response = await request.post("/api/login", {
      data: { username, type, password, slug },
    });
    expect(response.status()).toBe(200);
    return { Authorization: `Bearer ${(await response.json()).authToken}` };
  };
  const writer = await login("admin_sintetis");
  const reader = await login("admin_baca");
  const company = await login("hrd_satu", "company", "sintetis-satu");
  expect((await request.get("/api/user/list")).status()).toBe(401);
  expect(
    (await request.get("/api/user/list", { headers: reader })).status(),
  ).toBe(200);
  expect(
    (await request.get("/api/user/list", { headers: company })).status(),
  ).toBe(403);
  expect(
    (
      await request.get("/api/user/bunga-kredits?slug=sintetis-dua", {
        headers: company,
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.get("/api/user/bunga-kredits?slug=sintetis-satu", {
        headers: company,
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.put("/api/user/delete", {
        headers: writer,
        data: { id: 900001 },
      })
    ).status(),
  ).toBe(409);
  const input = {
    entityTypeId: 900001,
    companyName: "P04 API",
    username: "p04-api",
    email: "p04-api@example.invalid",
    slug: "p04-api",
    password: "Secret123",
    status: "active",
    bungaKredits: [{ bungaPercentage: "1", jangkaWaktuBulan: "12" }],
    biaya: [{ expenseType: "Admin", type: "%", value: 1 }],
  };
  expect(
    (
      await request.post("/api/user/create", { headers: reader, data: input })
    ).status(),
  ).toBe(403);
  const created = await request.post("/api/user/create", {
    headers: writer,
    data: input,
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  try {
    expect(
      (
        await request.post("/api/user/create", { headers: writer, data: input })
      ).status(),
    ).toBe(409);
    const before = await (
      await request.get(`/api/user/detail?id=${id}`, { headers: reader })
    ).json();
    expect(before.bungaKredits).toHaveLength(1);
    expect(before.password).toBeUndefined();
    expect(
      (
        await request.put("/api/user/update", {
          headers: writer,
          data: { ...input, id, biaya: [{ ...input.biaya[0], id: 123456 }] },
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await request.put("/api/user/update", {
          headers: writer,
          data: { ...input, id, bungaKredits: [], biaya: [] },
        })
      ).status(),
    ).toBe(200);
    const after = await (
      await request.get(`/api/user/detail?id=${id}`, { headers: reader })
    ).json();
    expect(after.bungaKredits).toEqual([]);
    expect(after.biaya).toEqual([]);
  } finally {
    expect(
      (
        await request.put("/api/user/delete", { headers: writer, data: { id } })
      ).status(),
    ).toBe(200);
  }
});
test("company forms validate, reconcile arrays and display text detail", async ({
  page,
}) => {
  const name = `p04-ui-${Date.now()}`;
  await page.goto("/login");
  await page.getByLabel("Username atau email").fill("admin_sintetis");
  await page.getByLabel("Password").fill(password ?? "");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.getByRole("link", { name: "Perusahaan", exact: true }).click();
  await page.getByRole("link", { name: "Tambah perusahaan" }).click();
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page.getByLabel("Nama perusahaan")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByRole("textbox", { name: "Badan usaha", exact: true }).click();
  await page.getByRole("option", { name: "PT sintetis" }).click();
  await page.getByLabel("Nama perusahaan").fill(name);
  await page.getByLabel("Username perusahaan").fill(name);
  await page.getByLabel("Email perusahaan").fill(`${name}@example.invalid`);
  await page.getByLabel("Slug", { exact: true }).fill(name);
  await page.getByLabel("Password perusahaan").fill("Secret123");
  await page.getByRole("button", { name: "Tambah bunga", exact: true }).click();
  await page.getByLabel("Bunga 1 (%)", { exact: true }).fill("0.75");
  await page.getByLabel("Tenor 1 (bulan)").fill("12");
  await page.getByRole("button", { name: "Tambah biaya", exact: true }).click();
  await page.getByLabel("Nama biaya 1").fill("Administrasi");
  await page.getByLabel("Jenis biaya 1").fill("%");
  await page.getByLabel("Nilai biaya 1").fill("1");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByRole("cell", { name, exact: true }).first() });
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: "Lihat" }).click();
  await expect(page.getByText("12 bulan: 0.75%")).toBeVisible();
  await expect(page.locator("input")).toHaveCount(0);
  await page.getByRole("link", { name: "Kembali" }).click();
  await row.getByRole("link", { name: "Ubah" }).click();
  await page.getByRole("button", { name: "Hapus bunga 1" }).click();
  await page.getByRole("button", { name: "Hapus biaya 1" }).click();
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await row.getByRole("link", { name: "Lihat" }).click();
  await expect(page.getByText("12 bulan: 0.75%")).toHaveCount(0);
  await page.getByRole("link", { name: "Kembali" }).click();
  page.once("dialog", (d) => d.accept());
  await row.getByRole("button", { name: "Hapus", exact: true }).click();
  await expect(row).toHaveCount(0);
});
