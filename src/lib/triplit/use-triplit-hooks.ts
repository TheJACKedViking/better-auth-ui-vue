import type { TriplitClient } from "@triplit/client"
import type { User } from "better-auth"
import { computed } from "vue"

import type { Session } from "../../types/auth-client"
import type { AuthHooks } from "../../types/auth-hooks"
import type { Refetch } from "../../types/refetch"
import { useListAccounts } from "./use-list-accounts"
import { useListSessions } from "./use-list-sessions"
import { useSession } from "./use-session"

const namespaces = ["user", "session", "account", "passkey"] as const
type Namespace = (typeof namespaces)[number]

type ModelNames = {
    [key in Namespace]: string
}

export interface UseTriplitOptionsProps {
    // biome-ignore lint/suspicious/noExplicitAny:
    triplit: TriplitClient<any>
    modelNames?: Partial<ModelNames>
    usePlural?: boolean
    sessionData?: { user: User; session: Session } | null
    refetch?: Refetch
    isPending: boolean
}

export function useTriplitHooks({
    triplit,
    usePlural = true,
    modelNames,
    sessionData,
    isPending
}: UseTriplitOptionsProps) {
    const hooks = computed(() => {
        return {
            useSession: () =>
                useSession({
                    triplit,
                    modelNames,
                    usePlural,
                    sessionData,
                    isPending
                }),
            useListAccounts: () =>
                useListAccounts({
                    triplit,
                    modelNames,
                    usePlural,
                    sessionData,
                    isPending
                }),
            useListSessions: () =>
                useListSessions({
                    triplit,
                    modelNames,
                    usePlural,
                    sessionData,
                    isPending
                })
        } as AuthHooks
    })

    return {
        hooks: hooks.value
    }
}
