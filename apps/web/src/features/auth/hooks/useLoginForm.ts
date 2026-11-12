import { loginSchema } from "@credit/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginInput } from "@web/features/auth/auth.type";
import { useForm } from "react-hook-form";
export function useLoginForm() {
  return useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      type: "admin",
      username: "",
      password: "",
      slug: undefined,
    },
  });
}
