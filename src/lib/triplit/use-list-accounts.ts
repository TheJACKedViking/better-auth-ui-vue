import { computed } from "vue"

import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import { useConditionalQuery } from "./use-conditional-query"
import type { UseTriplitOptionsProps } from "./use-triplit-hooks"
import { useTriplitToken } from "./use-triplit-token"

export function useListAccounts({
    triplit,
    modelNames,
    usePlural,
    isPending
}: UseTriplitOptionsProps): ReturnType<AuthHooks["useListAccounts"]> {
    const modelName = getModelName({
        namespace: "account",
        modelNames,
        usePlural
    })

    const { payload } = useTriplitToken(triplit)

    const queryResult = useConditionalQuery(
        triplit,
        payload.value?.sub && triplit.query(modelName)
    )

    const accounts = computed(() => {
        return queryResult.value?.results?.map((account: any) => ({
            accountId: account.accountId as string,
            provider: account.providerId as string
        })) || []
    })

    return {
        get data() { return accounts.value },
        get isPending() { return isPending || queryResult.value?.fetching },
        get error() { return queryResult.value?.error }
    }
}
