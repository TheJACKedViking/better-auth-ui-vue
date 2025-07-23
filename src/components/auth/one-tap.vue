<template>
    <!-- One Tap is a background process, no UI rendered -->
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'

import { useOnSuccessTransition } from '../../composables/use-success-transition'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import { getLocalizedError } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'

interface Props {
    localization: Partial<AuthLocalization>
    redirectTo?: string
}

const props = defineProps<Props>()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('OneTap must be used within AuthUIProvider')
}

const {
    authClient,
    localization: contextLocalization,
    toast
} = context

const oneTapFetched = ref(false)

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { onSuccess } = useOnSuccessTransition({ redirectTo: props.redirectTo })

onMounted(() => {
    if (oneTapFetched.value) return
    oneTapFetched.value = true

    try {
        authClient.oneTap({
            fetchOptions: {
                throw: true,
                onSuccess
            }
        })
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }
})
</script>