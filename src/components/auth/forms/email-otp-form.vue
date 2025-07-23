<template>
    <EmailForm
        v-if="!email"
        v-bind="$props"
        @set-email="setEmail"
    />
    <OTPForm
        v-else
        v-bind="$props"
        :email="email"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AuthLocalization } from '../../../localization/auth-localization'
import type { AuthFormClassNames } from '../auth-form.vue'
import EmailForm from './email-form.vue'
import OTPForm from './otp-form.vue'

export interface EmailOTPFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    otpSeparators?: 0 | 1 | 2
    redirectTo?: string
}

defineProps<EmailOTPFormProps>()
defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const email = ref<string | undefined>()

const setEmail = (value: string) => {
    email.value = value
}
</script>