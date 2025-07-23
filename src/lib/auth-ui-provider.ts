import type { InjectionKey } from 'vue'
import { inject } from 'vue'
import type { AuthUIContextType } from './auth-ui-provider.vue'

export { default as AuthUIProvider } from './auth-ui-provider.vue'
export type { AuthUIContextType, AuthUIProviderProps } from './auth-ui-provider.vue'

// Export the injection key
export const AuthUIContextKey: InjectionKey<AuthUIContextType> = Symbol('AuthUIContext')

// Export the hook to use the context
export function useAuthUIContext() {
    const context = inject(AuthUIContextKey)
    if (!context) {
        throw new Error('useAuthUIContext must be used within an AuthUIProvider')
    }
    return context
}