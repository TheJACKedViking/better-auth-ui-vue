import { ref, computed, inject, watchEffect, onUnmounted, shallowRef } from 'vue'
import { authDataCache } from '../lib/auth-data-cache'
import { AuthUIContextKey } from '../lib/auth-ui-provider'
import { getLocalizedError } from '../lib/utils'
import type { FetchError } from '../types/fetch-error'

export function useAuthData<T>({
    queryFn,
    cacheKey,
    staleTime = 10000 // Default 10 seconds
}: {
    queryFn: () => Promise<{ data: T | null; error?: FetchError | null }>
    cacheKey?: string
    staleTime?: number
}) {
    const context = inject(AuthUIContextKey)
    if (!context) {
        throw new Error('useAuthData must be used within AuthUIProvider')
    }
    
    const { authClient, toast, localization, hooks } = context
    const { data: sessionData, isPending: sessionPending } = hooks.useSession()
    
    // Generate a stable cache key based on the queryFn if not provided
    const stableCacheKey = cacheKey || queryFn.toString()
    
    // Subscribe to cache updates for this key
    const cacheEntry = shallowRef(authDataCache.get<T>(stableCacheKey))
    
    const unsubscribe = authDataCache.subscribe(stableCacheKey, () => {
        cacheEntry.value = authDataCache.get<T>(stableCacheKey)
    })
    
    onUnmounted(() => {
        unsubscribe()
    })
    
    const initialized = ref(false)
    const previousUserId = ref<string | undefined>(undefined)
    const error = ref<FetchError | null>(null)
    
    const refetch = async () => {
        // Check if there's already an in-flight request for this key
        const existingRequest = authDataCache.getInFlightRequest<{
            data: T | null
            error?: FetchError | null
        }>(stableCacheKey)
        if (existingRequest) {
            // Wait for the existing request to complete
            try {
                const result = await existingRequest
                if (result.error) {
                    error.value = result.error
                } else {
                    error.value = null
                }
            } catch (err) {
                error.value = err as FetchError
            }
            return
        }
        
        // Mark as refetching if we have cached data
        if (cacheEntry.value?.data !== undefined) {
            authDataCache.setRefetching(stableCacheKey, true)
        }
        
        // Create the fetch promise
        const fetchPromise = queryFn()
        
        // Store the promise as in-flight
        authDataCache.setInFlightRequest(stableCacheKey, fetchPromise)
        
        try {
            const result = await fetchPromise
            
            if (result.error) {
                error.value = result.error
                toast({
                    variant: 'error',
                    message: getLocalizedError({ error: result.error, localization })
                })
            } else {
                error.value = null
            }
            
            // Update cache with new data
            authDataCache.set(stableCacheKey, result.data)
        } catch (err) {
            const fetchError = err as FetchError
            error.value = fetchError
            toast({
                variant: 'error',
                message: getLocalizedError({ error: fetchError, localization })
            })
        } finally {
            authDataCache.setRefetching(stableCacheKey, false)
            authDataCache.removeInFlightRequest(stableCacheKey)
        }
    }
    
    watchEffect(() => {
        const currentUserId = sessionData?.user?.id
        
        if (!sessionData) {
            // Clear cache when session is lost
            authDataCache.setRefetching(stableCacheKey, false)
            authDataCache.clear(stableCacheKey)
            initialized.value = false
            previousUserId.value = undefined
            return
        }
        
        // Check if user ID has changed
        const userIdChanged =
            previousUserId.value !== undefined &&
            previousUserId.value !== currentUserId
        
        // If user changed, clear cache to ensure isPending becomes true
        if (userIdChanged) {
            authDataCache.clear(stableCacheKey)
        }
        
        // If we have cached data, we're not pending anymore
        const hasCachedData = cacheEntry.value?.data !== undefined
        
        // Check if data is stale
        const isStale =
            !cacheEntry.value || Date.now() - cacheEntry.value.timestamp > staleTime
        
        if (
            !initialized.value ||
            !hasCachedData ||
            userIdChanged ||
            (hasCachedData && isStale)
        ) {
            // Only fetch if we don't have data or if the data is stale
            if (!hasCachedData || isStale) {
                initialized.value = true
                refetch()
            }
        }
        
        // Update the previous user ID
        previousUserId.value = currentUserId
    })
    
    // Determine if we're in a pending state
    // We're only pending if:
    // 1. Session is still loading, OR
    // 2. We have no cached data and no error
    const isPending = computed(() => 
        sessionPending || (!cacheEntry.value?.data && !error.value)
    )
    
    const isRefetching = computed(() => cacheEntry.value?.isRefetching ?? false)
    const data = computed(() => cacheEntry.value?.data ?? null)
    
    return {
        data,
        isPending,
        isRefetching,
        error,
        refetch
    }
}