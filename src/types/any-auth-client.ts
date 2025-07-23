import type { createAuthClient } from "better-auth/client"

export type AnyAuthClient = Omit<
    ReturnType<typeof createAuthClient>,
    "signUp" | "getSession"
>
