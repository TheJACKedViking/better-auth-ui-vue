import type { BetterFetchError } from "@better-fetch/fetch"
import { computed, ref, watchEffect } from "vue"
import type { User } from "../../types/auth-client"
import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import type { UseInstantOptionsProps } from "./use-instant-options"

export function useSession({
    db,
    sessionData,
    isPending,
    refetch,
    usePlural,
    modelNames
}: UseInstantOptionsProps): ReturnType<AuthHooks["useSession"]> {
    // Note: InstantDB doesn't have Vue bindings, so we'll need to handle this differently
    // For now, we'll use the sessionData passed in
    const modelName = getModelName({
        namespace: "user",
        modelNames,
        usePlural
    })

    const user = computed(() => {
        // In a real implementation, you would need to integrate with InstantDB's
        // subscription system to get reactive updates
        return sessionData?.user || null
    })

    return {
        data: sessionData
            ? {
                  session: sessionData.session,
                  user: (sessionData?.user.id === user.value?.id
                      ? user.value
                      : sessionData.user) as User
              }
            : null,
        isPending,
        refetch: refetch || (() => {}),
        error: null
    }
}
