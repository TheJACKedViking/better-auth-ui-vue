<template>
    <button
        :class="cn(
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 h-9 px-4 py-2 has-[>svg]:px-3 w-full',
            classNames?.form?.button,
            classNames?.form?.secondaryButton
        )"
        :disabled="isSubmitting"
        formnovalidate
        name="passkey"
        value="true"
        @click="signInPassKey"
        data-slot="button"
    >
        <FingerprintIcon />
        {{ localization.SIGN_IN_WITH }} {{ localization.PASSKEY }}
    </button>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { FingerprintIcon } from 'lucide-vue-next'

import { useOnSuccessTransition } from '../../composables/use-success-transition'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import { cn, getLocalizedError } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { AuthCardClassNames } from './auth-card.vue'

interface Props {
    classNames?: AuthCardClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('PasskeyButton must be used within AuthUIProvider')
}

const {
    authClient,
    localization: contextLocalization,
    toast
} = context

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { onSuccess } = useOnSuccessTransition({ redirectTo: props.redirectTo })

const signInPassKey = async () => {
    emit('update:isSubmitting', true)

    try {
        const response = await authClient.signIn.passkey({
            fetchOptions: { throw: true }
        })

        if (response?.error) {
            toast({
                variant: 'error',
                message: getLocalizedError({
                    error: response.error,
                    localization: localization.value
                })
            })

            emit('update:isSubmitting', false)
        } else {
            onSuccess()
        }
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })

        emit('update:isSubmitting', false)
    }
}
</script>