import { createTestAdapters } from "@credit/test-utils/adapters";
import { expect, it } from "vitest";

it("keeps synthetic notifications isolated", () => {
  const adapters = createTestAdapters();
  adapters.whatsapp.send("test");
  expect(adapters.notifications).toEqual(["test"]);
  expect(createTestAdapters().notifications).toEqual([]);
});
