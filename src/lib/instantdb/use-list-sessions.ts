import type { Session } from "better-auth"
import { computed, ref } from "vue"
import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import type { UseInstantOptionsProps } from "./use-instant-options"

export function useListSessions({
    db,
    modelNames,
    usePlural,
    isPending,
    sessionData
}: UseInstantOptionsProps): ReturnType<AuthHooks["useListSessions"]> {
    const modelName = getModelName({
        namespace: "session",
        modelNames,
        usePlural
    })

    const now = Date.now()

    // Note: InstantDB doesn't have Vue bindings
    // In a real implementation, you would integrate with InstantDB's subscription system
    const sessions = computed(() => {
        // Return current session if available
        if (sessionData?.session) {
            return [sessionData.session] as Session[]
        }
        return []
    })

    return {
        data: sessions.value,
        isPending: !sessions.value && isPending
    }
}
