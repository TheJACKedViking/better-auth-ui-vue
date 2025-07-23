<template>
    <template v-if="isPending">
        <slot />
    </template>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { AuthUIContextKey } from '../lib/auth-ui-provider'

/**
 * Conditionally renders content during authentication loading state
 *
 * Renders its children only when the authentication state is being determined
 * (during the loading/pending phase). Once the authentication state is resolved,
 * nothing is rendered. Useful for displaying loading indicators or temporary
 * content while waiting for the authentication check to complete.
 */

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('AuthLoading must be used within AuthUIProvider')
}

const { hooks: { useSession } } = context
const { isPending } = useSession()
</script>