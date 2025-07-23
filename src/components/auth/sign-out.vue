<template>
    <Loader2 class="animate-spin" />
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { useOnSuccessTransition } from '../../composables/use-success-transition'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'

const signingOut = ref(false)

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('SignOut must be used within AuthUIProvider')
}

const { authClient, basePath, viewPaths } = context

const { onSuccess } = useOnSuccessTransition({
    redirectTo: `${basePath}/${viewPaths.SIGN_IN}`
})

onMounted(async () => {
    if (signingOut.value) return
    signingOut.value = true
    
    try {
        await authClient.signOut()
    } finally {
        await onSuccess()
    }
})
</script>