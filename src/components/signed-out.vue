<template>
    <template v-if="!data && !isPending">
        <slot />
    </template>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { AuthUIContextKey } from '../lib/auth-ui-provider'

/**
 * Conditionally renders content for unauthenticated users only
 *
 * Renders its children only when no user is authenticated and the authentication
 * state is not pending. If a session exists or is being loaded, nothing is rendered.
 * Useful for displaying sign-in prompts or content exclusive to guests.
 */

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('SignedOut must be used within AuthUIProvider')
}

const { hooks: { useSession } } = context
const { data, isPending } = useSession()
</script>