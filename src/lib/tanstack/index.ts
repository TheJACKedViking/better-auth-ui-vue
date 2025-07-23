import type { AuthUIProviderProps } from '../auth-ui-provider.vue'
import type { AnyAuthClient } from '../../types/any-auth-client'

export interface AuthUIProviderTanstackProps extends Omit<AuthUIProviderProps, 'hooks' | 'mutators' | 'onSessionChange' | 'optimistic'> {
  authClient: AnyAuthClient
}

export { default as AuthUIProviderTanstack } from './auth-ui-provider-tanstack.vue'