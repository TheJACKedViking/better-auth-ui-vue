<template>
    <!-- Renders nothing, only redirects -->
</template>

<script setup lang="ts">
import { useAuthenticate } from '../composables/use-authenticate'

/**
 * Redirects the user to the sign-in page
 *
 * Renders nothing and automatically redirects the current user to the authentication
 * sign-in page. Useful for protecting routes that require authentication or
 * redirecting users to sign in from various parts of the application.
 */

useAuthenticate({ authView: 'SIGN_IN' })
</script>