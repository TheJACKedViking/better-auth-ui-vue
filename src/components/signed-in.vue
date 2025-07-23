<template>
    <template v-if="data">
        <slot />
    </template>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { AuthUIContextKey } from '../lib/auth-ui-provider'

/**
 * Conditionally renders content for authenticated users only
 *
 * Renders its children only when a user is authenticated with a valid session.
 * If no session exists, nothing is rendered. Useful for displaying protected
 * content or UI elements that should only be visible to signed-in users.
 */

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('SignedIn must be used within AuthUIProvider')
}

const { hooks: { useSession } } = context
const { data } = useSession()
</script>