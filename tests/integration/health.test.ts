import { app } from "@credit/server/app";
import { expect, it } from "vitest";

it("serves health over the app boundary", async () => {
  const res = await app.request("/api/health");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ status: "ok" });
});
