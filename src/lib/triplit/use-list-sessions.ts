import type { Session } from "better-auth"
import { computed } from "vue"
import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import { useConditionalQuery } from "./use-conditional-query"
import type { UseTriplitOptionsProps } from "./use-triplit-hooks"
import { useTriplitToken } from "./use-triplit-token"

export function useListSessions({
    triplit,
    modelNames,
    usePlural,
    isPending
}: UseTriplitOptionsProps): ReturnType<AuthHooks["useListSessions"]> {
    const modelName = getModelName({
        namespace: "session",
        modelNames,
        usePlural
    })

    const { payload } = useTriplitToken(triplit)

    const queryResult = useConditionalQuery(triplit, payload.value?.sub && triplit.query(modelName))

    const sessions = computed(() => queryResult.value?.results as Session[] | undefined)

    return {
        get data() { return sessions.value },
        get isPending() { return isPending || queryResult.value?.fetching },
        get error() { return queryResult.value?.error }
    }
}
