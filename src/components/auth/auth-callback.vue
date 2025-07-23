<template>
    <Loader2 class="animate-spin" />
</template>

<script setup lang="ts">
import { inject, ref, watchEffect } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { useOnSuccessTransition } from '../../composables/use-success-transition'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'

interface Props {
    redirectTo?: string
}

const props = defineProps<Props>()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('AuthCallback must be used within AuthUIProvider')
}

const {
    hooks: { useIsRestoring },
    persistClient
} = context

const isRestoring = useIsRestoring?.()
const isRedirecting = ref(false)

const { onSuccess } = useOnSuccessTransition({ redirectTo: props.redirectTo })

watchEffect(async () => {
    if (isRedirecting.value) return
    
    if (!persistClient) {
        isRedirecting.value = true
        await onSuccess()
        return
    }
    
    if (isRestoring) return
    
    isRedirecting.value = true
    await onSuccess()
})
</script>