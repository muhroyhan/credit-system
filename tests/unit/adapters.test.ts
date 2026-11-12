import { expect, it } from "vitest";
import { createTestAdapters } from "../../packages/test-utils/src/adapters";
it("keeps synthetic notifications isolated", () => { const adapters = createTestAdapters(); adapters.whatsapp.send("test"); expect(adapters.notifications).toEqual(["test"]); expect(createTestAdapters().notifications).toEqual([]); });
