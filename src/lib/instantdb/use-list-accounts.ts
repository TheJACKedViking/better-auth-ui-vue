import type { BetterFetchError } from "@better-fetch/fetch"
import { computed } from "vue"
import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import type { UseInstantOptionsProps } from "./use-instant-options"

export function useListAccounts({
    db,
    modelNames,
    usePlural,
    isPending,
    sessionData
}: UseInstantOptionsProps): ReturnType<AuthHooks["useListAccounts"]> {
    const modelName = getModelName({
        namespace: "account",
        modelNames,
        usePlural
    })

    // Note: InstantDB doesn't have Vue bindings
    // In a real implementation, you would integrate with InstantDB's subscription system
    const accounts = computed(() => {
        // Return empty array for now - would need actual InstantDB integration
        return []
    })

    return {
        data: accounts.value,
        isPending: !accounts.value && isPending,
        error: null
    }
}
