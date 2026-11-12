import type { loginSchema } from "@credit/contracts";
import { type Session, signIn } from "@web/features/auth/data/gateway";
import { useState } from "react";
import type { z } from "zod";
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function login(input: z.input<typeof loginSchema>) {
    setLoading(true);
    setError("");
    try {
      setSession(await signIn(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }
  return { session, loading, error, login, logout: () => setSession(null) };
}
