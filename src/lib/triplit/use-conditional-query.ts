import type {
    FetchResult,
    Models,
    SchemaQuery,
    SubscriptionOptions,
    SubscriptionSignalPayload,
    TriplitClient
} from "@triplit/client"
import type { WorkerClient } from "@triplit/client/worker-client"
import { computed, ref, shallowRef, watchEffect, type ComputedRef } from "vue"

export function useConditionalQuery<
    M extends Models<M>,
    Q extends SchemaQuery<M>
>(
    client: TriplitClient<M> | WorkerClient<M>,
    query?: Q | false | null | "" | 0,
    options?: Partial<SubscriptionOptions> & { disabled?: boolean }
) {
    const state = shallowRef<SubscriptionSignalPayload<M, Q>>({
        results: undefined,
        fetching: true,
        fetchingLocal: false,
        fetchingRemote: false,
        error: undefined
    })
    const remoteFulfilled = ref(false)

    watchEffect((onCleanup) => {
        if (options?.disabled || !query) {
            state.value = {
                results: undefined,
                fetching: false,
                fetchingLocal: false,
                fetchingRemote: false,
                error: undefined
            }
            return
        }

        // Note: Triplit doesn't have Vue bindings, so we need to use the client directly
        // This is a simplified implementation - you would need to integrate with Triplit's
        // subscription system directly
        const unsubscribe = client.subscribe(
            query,
            (results) => {
                state.value = {
                    results,
                    fetching: false,
                    fetchingLocal: false,
                    fetchingRemote: false,
                    error: undefined
                }
            },
            (error: any) => {
                state.value = {
                    ...state.value,
                    error,
                    fetching: false
                }
            }
        )

        onCleanup(() => {
            unsubscribe()
        })
    })

    return computed(() => ({
        ...state.value,
        fetching: state.value.fetching && !remoteFulfilled.value
    }))
}

type useConditionalQueryOnePayload<
    M extends Models<M>,
    Q extends SchemaQuery<M>
> = Omit<SubscriptionSignalPayload<M, Q>, "results"> & {
    result: FetchResult<M, Q, "one">
}

export function useConditionalQueryOne<
    M extends Models<M>,
    Q extends SchemaQuery<M>
>(
    client: TriplitClient<M> | WorkerClient<M>,
    query?: Q | false | null | "" | 0,
    options?: Partial<SubscriptionOptions> & { disabled?: boolean }
): ComputedRef<useConditionalQueryOnePayload<M, Q>> {
    const queryResult = useConditionalQuery(
        client,
        query ? ({ ...query, limit: 1 } as Q) : query,
        options
    )

    return computed(() => {
        const { fetching, fetchingLocal, fetchingRemote, results, error } = queryResult.value
        return {
            fetching,
            fetchingLocal,
            fetchingRemote,
            result: results?.[0] ?? null,
            error
        }
    })
}
