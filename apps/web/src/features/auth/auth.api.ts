import { loginSchema, slugSchema } from "@credit/contracts";
import type { AppType } from "@credit/server/app";
import { hc } from "hono/client";
import { z } from "zod";

const client = hc<AppType>(window.location.origin);
const sessionSchema = z.object({
  authToken: z.string(),
  type: z.enum(["admin", "company", "debitor"]),
  userData: z.object({ id: z.number() }).passthrough(),
});
export type Session = z.infer<typeof sessionSchema>;
export async function getSlugs() {
  const response = await client.api.user.slugs.$get();
  if (!response.ok) throw new Error("Gagal memuat perusahaan");
  return slugSchema.array().parse(await response.json());
}
export async function signIn(
  input: z.input<typeof loginSchema>,
): Promise<Session> {
  const payload = loginSchema.parse(input);
  const response = await client.api.login.$post(
    {},
    {
      init: {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    },
  );
  if (!response.ok)
    throw new Error("Login gagal. Periksa kredensial dan perusahaan.");
  return sessionSchema.parse(await response.json());
}
