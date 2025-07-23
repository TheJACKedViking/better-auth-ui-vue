import type { BetterFetchError } from "@better-fetch/fetch"
import type { Invitation } from "better-auth/plugins/organization"
import type { AnyAuthClient } from "./any-auth-client"
import type { ApiKey } from "./api-key"
import type { AuthClient } from "./auth-client"
import type { Refetch } from "./refetch"

type AnyAuthSession = AnyAuthClient["$Infer"]["Session"]

type AuthHook<T> = {
    isPending: boolean
    data?: T | null
    error?: BetterFetchError | null
    refetch?: Refetch
    isRefetching?: boolean
}

export type AuthHooks = {
    useSession: () => AuthHook<{
        user: AnyAuthClient["$Infer"]["Session"]["user"]
        session: AnyAuthClient["$Infer"]["Session"]["session"]
    }>
    useListAccounts: () => AuthHook<{ accountId: string; provider: string }[]>
    useListDeviceSessions: () => AuthHook<AnyAuthClient["$Infer"]["Session"][]>
    useListSessions: () => AuthHook<AnyAuthSession["session"][]>
    useListPasskeys: () => AuthHook<any[]>
    useListApiKeys: () => AuthHook<ApiKey[]>
    useActiveOrganization: () => AuthHook<{
        id: string
        name: string
        createdAt: Date
        slug: string
        metadata?: any
        logo?: string | null
        members?: any[]
        invitations?: any[]
    } | null>
    useListOrganizations: () => AuthHook<{
        id: string
        name: string
        createdAt: Date
        slug: string
        metadata?: any
        logo?: string | null
    }[]>
    useHasPermission: (
        params: Parameters<AuthClient["organization"]["hasPermission"]>[0]
    ) => AuthHook<{
        error: null
        success: boolean
    }>
    useInvitation: (
        params: Parameters<AuthClient["organization"]["getInvitation"]>[0]
    ) => AuthHook<
        Invitation & {
            organizationName: string
            organizationSlug: string
            organizationLogo?: string
        }
    >
    useIsRestoring?: () => boolean
}
