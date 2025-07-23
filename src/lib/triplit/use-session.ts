import { computed } from "vue"
import type { User } from "../../types/auth-client"
import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import { useConditionalQueryOne } from "./use-conditional-query"
import type { UseTriplitOptionsProps } from "./use-triplit-hooks"
import { useTriplitToken } from "./use-triplit-token"

export function useSession({
    triplit,
    sessionData,
    isPending,
    refetch,
    usePlural,
    modelNames
}: UseTriplitOptionsProps): ReturnType<AuthHooks["useSession"]> {
    const modelName = getModelName({
        namespace: "user",
        modelNames,
        usePlural
    })

    const { payload } = useTriplitToken(triplit)

    const queryResult = useConditionalQueryOne(
        triplit,
        payload.value?.sub && triplit.query(modelName)
    )

    const data = computed(() => 
        sessionData
            ? {
                  session: sessionData.session,
                  user: (sessionData?.user.id === queryResult.value?.result?.id
                      ? queryResult.value?.result
                      : sessionData.user) as User
              }
            : null
    )

    return {
        get data() { return data.value },
        get error() { return queryResult.value?.error },
        get isPending() { return isPending },
        refetch: refetch || (() => {})
    }
}
