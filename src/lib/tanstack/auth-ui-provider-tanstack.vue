<template>
  <AuthUIProvider v-bind="authUIProps">
    <slot />
  </AuthUIProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AuthUIProviderProps } from '../auth-ui-provider.vue'
import AuthUIProvider from '../auth-ui-provider.vue'
import { useTanstackOptions } from './use-tanstack-options'
import type { AnyAuthClient } from '../../types/any-auth-client'

interface AuthUIProviderTanstackProps extends /* @vue-ignore */ Omit<AuthUIProviderProps, 'hooks' | 'mutators' | 'onSessionChange' | 'optimistic'> {
  authClient: AnyAuthClient
}

const props = defineProps<AuthUIProviderTanstackProps>()

const { hooks, mutators, onSessionChange, optimistic } = useTanstackOptions({
  authClient: props.authClient
})

const authUIProps = computed(() => ({
  ...props,
  hooks,
  mutators,
  onSessionChange,
  optimistic
}))
</script>

