import { ref, computed, inject, watch } from 'vue'
import { AuthUIContextKey } from '../lib/auth-ui-provider'
import { getSearchParam } from '../lib/utils'

export function useOnSuccessTransition({
    redirectTo: redirectToProp
}: { redirectTo?: string }) {
    const context = inject(AuthUIContextKey)
    if (!context) {
        throw new Error('useOnSuccessTransition must be used within AuthUIProvider')
    }
    
    const { redirectTo: contextRedirectTo, navigate, hooks, onSessionChange } = context
    const { useSession } = hooks
    
    const getRedirectTo = computed(() =>
        redirectToProp || getSearchParam('redirectTo') || contextRedirectTo
    )
    
    const isPending = ref(false)
    const success = ref(false)
    
    const { refetch: refetchSession } = useSession()
    
    watch([success, isPending], ([successValue, isPendingValue]) => {
        if (!successValue || isPendingValue) return
        
        isPending.value = true
        navigate(getRedirectTo.value)
        isPending.value = false
    })
    
    const onSuccess = async () => {
        await refetchSession?.()
        success.value = true
        
        if (onSessionChange) {
            isPending.value = true
            await onSessionChange()
            isPending.value = false
        }
    }
    
    return { onSuccess, isPending }
}