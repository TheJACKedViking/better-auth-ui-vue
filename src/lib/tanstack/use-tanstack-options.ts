import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query"
import { computed, ref } from "vue"
import type { AnyAuthClient } from "../../types/any-auth-client"
import type { AuthClient } from "../../types/auth-client"
import type { AuthHooks } from "../../types/auth-hooks"
import type { AuthMutators } from "../../types/auth-mutators"
import type { BetterFetchError } from "@better-fetch/fetch"

// Create Vue-specific TanStack Query hooks for better-auth
function createVueAuthHooks(authClient: AnyAuthClient) {
    const queryClient = useQueryClient()

    // Session hook
    const useSession = () => {
        const { data, error, isPending, refetch, isRefetching } = useQuery({
            queryKey: ['auth-session'],
            queryFn: async () => {
                const result = await (authClient as any).session()
                return result.data
            },
            refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
            staleTime: 1 * 60 * 1000 // Consider stale after 1 minute
        })

        return {
            data: data.value,
            error: error.value as BetterFetchError | null,
            isPending: isPending.value,
            refetch,
            isRefetching: isRefetching?.value ?? false
        }
    }

    // List accounts hook
    const useListAccounts = () => {
        const { data, error, isPending, refetch, isRefetching } = useQuery({
            queryKey: ['auth-accounts'],
            queryFn: async () => {
                const result = await (authClient as any).listAccounts()
                return result.data
            }
        })

        return {
            data: data.value,
            error: error.value as BetterFetchError | null,
            isPending: isPending.value,
            refetch,
            isRefetching: isRefetching?.value ?? false
        }
    }

    // List passkeys hook
    const useListPasskeys = () => {
        const { data, error, isPending, refetch, isRefetching } = useQuery({
            queryKey: ['auth-passkeys'],
            queryFn: async () => {
                const result = await (authClient as any).passkey?.listPasskeys()
                return result?.data || []
            }
        })

        return {
            data: data.value,
            error: error.value as BetterFetchError | null,
            isPending: isPending.value,
            refetch,
            isRefetching: isRefetching?.value ?? false
        }
    }

    // List sessions hook
    const useListSessions = () => {
        const { data, error, isPending, refetch, isRefetching } = useQuery({
            queryKey: ['auth-sessions'],
            queryFn: async () => {
                const result = await (authClient as any).session?.listSessions()
                return result.data
            }
        })

        return {
            data: data.value,
            error: error.value as BetterFetchError | null,
            isPending: isPending.value,
            refetch,
            isRefetching: isRefetching?.value ?? false
        }
    }

    // List device sessions hook
    const useListDeviceSessions = () => {
        const { data, error, isPending, refetch, isRefetching } = useQuery({
            queryKey: ['auth-device-sessions'],
            queryFn: async () => {
                const result = await (authClient as any).session?.listDeviceSessions()
                return result.data
            }
        })

        return {
            data: data.value,
            error: error.value as BetterFetchError | null,
            isPending: isPending.value,
            refetch,
            isRefetching: isRefetching?.value ?? false
        }
    }

    // List API keys hook
    const useListApiKeys = () => {
        const { data, error, isPending, refetch, isRefetching } = useQuery({
            queryKey: ['auth-api-keys'],
            queryFn: async () => {
                const result = await (authClient as any).api?.listApiKeys()
                return result?.data || []
            }
        })

        return {
            data: data.value,
            error: error.value as BetterFetchError | null,
            isPending: isPending.value,
            refetch,
            isRefetching: isRefetching?.value ?? false
        }
    }

    // Organization hooks
    const useActiveOrganization = () => {
        const { data, error, isPending, refetch, isRefetching } = useQuery({
            queryKey: ['auth-active-organization'],
            queryFn: async () => {
                const result = await (authClient as any).organization?.getActiveOrganization()
                return result?.data
            }
        })

        return {
            data: data.value,
            error: error.value as BetterFetchError | null,
            isPending: isPending.value,
            refetch,
            isRefetching: isRefetching?.value ?? false
        }
    }

    const useListOrganizations = () => {
        const { data, error, isPending, refetch, isRefetching } = useQuery({
            queryKey: ['auth-organizations'],
            queryFn: async () => {
                const result = await (authClient as any).organization?.listOrganizations()
                return result?.data || []
            }
        })

        return {
            data: data.value,
            error: error.value as BetterFetchError | null,
            isPending: isPending.value,
            refetch,
            isRefetching: isRefetching?.value ?? false
        }
    }

    const useHasPermission = (params: Parameters<AuthClient["organization"]["hasPermission"]>[0]) => {
        const { data, error, isPending, isRefetching } = useQuery({
            queryKey: ['auth-permission', params],
            queryFn: async () => {
                const result = await (authClient as any).organization?.hasPermission(params)
                return result?.data || { error: null, success: false }
            }
        })

        return {
            data: data.value,
            error: error.value as BetterFetchError | null,
            isPending: isPending.value,
            isRefetching: isRefetching?.value ?? false
        }
    }

    const useInvitation = (params: Parameters<AuthClient["organization"]["getInvitation"]>[0]) => {
        const { data, error, isPending, isRefetching } = useQuery({
            queryKey: ['auth-invitation', params],
            queryFn: async () => {
                const result = await (authClient as any).organization?.getInvitation(params)
                return result?.data
            }
        })

        return {
            data: data.value,
            error: error.value as BetterFetchError | null,
            isPending: isPending.value,
            isRefetching: isRefetching?.value ?? false
        }
    }

    // Mutations
    const useUpdateUser = () => {
        return useMutation({
            mutationFn: async (params: any) => {
                return await (authClient as any).updateUser(params)
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['auth-session'] })
            }
        })
    }

    const useDeletePasskey = () => {
        return useMutation({
            mutationFn: async (params: any) => {
                return await (authClient as any).passkey?.deletePasskey(params)
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['auth-passkeys'] })
            }
        })
    }

    const useUnlinkAccount = () => {
        return useMutation({
            mutationFn: async (params: any) => {
                return await (authClient as any).unlinkAccount(params)
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['auth-accounts'] })
            }
        })
    }

    const useRevokeSession = () => {
        return useMutation({
            mutationFn: async (params: any) => {
                return await (authClient as any).session?.revokeSession(params)
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['auth-sessions'] })
            }
        })
    }

    const useRevokeDeviceSession = () => {
        return useMutation({
            mutationFn: async (params: any) => {
                return await (authClient as any).session?.revokeDeviceSession(params)
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['auth-device-sessions'] })
            }
        })
    }

    const useSetActiveSession = () => {
        return useMutation({
            mutationFn: async (params: any) => {
                return await (authClient as any).session?.setActiveSession(params)
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['auth-session'] })
            }
        })
    }

    return {
        useSession,
        useListAccounts,
        useListPasskeys,
        useListSessions,
        useListDeviceSessions,
        useListApiKeys,
        useActiveOrganization,
        useListOrganizations,
        useHasPermission,
        useInvitation,
        useUpdateUser,
        useDeletePasskey,
        useUnlinkAccount,
        useRevokeSession,
        useRevokeDeviceSession,
        useSetActiveSession
    }
}

export function useTanstackOptions({
    authClient
}: { authClient: AnyAuthClient }) {
    const queryClient = useQueryClient()
    const authHooks = createVueAuthHooks(authClient)

    // Create mutation instances
    const { mutateAsync: updateUserAsync } = authHooks.useUpdateUser()
    const { mutateAsync: deletePasskeyAsync } = authHooks.useDeletePasskey()
    const { mutateAsync: unlinkAccountAsync } = authHooks.useUnlinkAccount()
    const { mutateAsync: revokeSessionAsync } = authHooks.useRevokeSession()
    const { mutateAsync: revokeDeviceSessionAsync } = authHooks.useRevokeDeviceSession()
    const { mutateAsync: setActiveSessionAsync } = authHooks.useSetActiveSession()

    const hooks: AuthHooks = {
        useSession: authHooks.useSession,
        useListAccounts: authHooks.useListAccounts,
        useListPasskeys: authHooks.useListPasskeys,
        useListSessions: authHooks.useListSessions,
        useListDeviceSessions: authHooks.useListDeviceSessions,
        useListApiKeys: authHooks.useListApiKeys,
        useActiveOrganization: authHooks.useActiveOrganization,
        useListOrganizations: authHooks.useListOrganizations,
        useHasPermission: authHooks.useHasPermission,
        useInvitation: authHooks.useInvitation
    }

    const mutators = computed(
        () =>
            ({
                updateUser: async (params) => {
                    const { error } = await updateUserAsync({
                        ...params,
                        fetchOptions: { throw: false }
                    })
                    if (error) throw error
                },
                unlinkAccount: async (params) => {
                    const { error } = await unlinkAccountAsync({
                        ...params,
                        fetchOptions: { throw: false }
                    })
                    if (error) throw error
                },
                deletePasskey: async (params) => {
                    const { error } = await deletePasskeyAsync({
                        ...params,
                        fetchOptions: { throw: false }
                    })
                    if (error) throw error
                },
                revokeSession: async (params) => {
                    const { error } = await revokeSessionAsync({
                        ...params,
                        fetchOptions: { throw: false }
                    })
                    if (error) throw error
                },
                setActiveSession: async (params) => {
                    const { error } = await setActiveSessionAsync({
                        ...params,
                        fetchOptions: { throw: false }
                    })
                    if (error) throw error
                },
                revokeDeviceSession: async (params) => {
                    const { error } = await revokeDeviceSessionAsync({
                        ...params,
                        fetchOptions: { throw: false }
                    })
                    if (error) throw error
                }
            }) as AuthMutators
    )

    const onSessionChange = async () => {
        // Refetch session data
        await queryClient.refetchQueries({ queryKey: ['auth-session'] })
        
        // Invalidate all other auth-related queries
        await queryClient.invalidateQueries({
            predicate: (query) => {
                const key = query.queryKey[0]
                return typeof key === 'string' && key.startsWith('auth-') && key !== 'auth-session'
            }
        })
    }

    return {
        hooks,
        mutators: mutators.value,
        onSessionChange,
        optimistic: true
    }
}
