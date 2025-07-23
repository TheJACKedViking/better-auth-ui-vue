import { inject, watchEffect, computed } from 'vue'
import { AuthUIContextKey } from '../lib/auth-ui-provider'
import type { AuthView } from '../server'
import type { AnyAuthClient } from '../types/any-auth-client'

interface AuthenticateOptions<TAuthClient extends AnyAuthClient> {
    authClient?: TAuthClient
    authView?: AuthView
    enabled?: boolean
}

export function useAuthenticate<TAuthClient extends AnyAuthClient>(
    options?: AuthenticateOptions<TAuthClient>
) {
    type Session = TAuthClient['$Infer']['Session']['session']
    type User = TAuthClient['$Infer']['Session']['user']
    
    const { authView = 'SIGN_IN', enabled = true } = options ?? {}
    
    const context = inject(AuthUIContextKey)
    if (!context) {
        throw new Error('useAuthenticate must be used within AuthUIProvider')
    }
    
    const {
        hooks: { useSession },
        basePath,
        viewPaths,
        replace
    } = context
    
    const { data, isPending, error, refetch } = useSession()
    const sessionData = computed(() => data as
        | {
              session: Session
              user: User
          }
        | null
        | undefined
    )
    
    watchEffect(() => {
        if (!enabled || isPending || sessionData.value) return
        
        replace(
            `${basePath}/${viewPaths[authView]}?redirectTo=${window.location.href.replace(window.location.origin, '')}`
        )
    })
    
    return {
        data: sessionData,
        user: computed(() => sessionData.value?.user),
        isPending,
        error,
        refetch
    }
}