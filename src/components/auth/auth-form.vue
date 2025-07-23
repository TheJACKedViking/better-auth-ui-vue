<template>
    <component
        :is="currentComponent"
        v-if="currentComponent"
        :class-name="className"
        :class-names="classNames"
        :callback-url="callbackURL"
        :localization="mergedLocalization"
        :redirect-to="redirectTo"
        :is-submitting="isSubmitting"
        :otp-separators="otpSeparators"
        @update:is-submitting="setIsSubmitting"
    />
</template>

<script setup lang="ts">
import { computed, inject, onMounted, watch } from 'vue'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import type { AuthView } from '../../lib/auth-view-paths'
import { getAuthViewByPath } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'

import AuthCallback from './auth-callback.vue'
import EmailOTPForm from './forms/email-otp-form.vue'
import ForgotPasswordForm from './forms/forgot-password-form.vue'
import MagicLinkForm from './forms/magic-link-form.vue'
import RecoverAccountForm from './forms/recover-account-form.vue'
import ResetPasswordForm from './forms/reset-password-form.vue'
import SignInForm from './forms/sign-in-form.vue'
import SignUpForm from './forms/sign-up-form.vue'
import TwoFactorForm from './forms/two-factor-form.vue'
import SignOut from './sign-out.vue'

export type AuthFormClassNames = {
    base?: string
    button?: string
    checkbox?: string
    description?: string
    error?: string
    forgotPasswordLink?: string
    icon?: string
    input?: string
    label?: string
    otpInput?: string
    otpInputContainer?: string
    outlineButton?: string
    primaryButton?: string
    providerButton?: string
    qrCode?: string
    secondaryButton?: string
}

export interface AuthFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isSubmitting?: boolean
    localization?: Partial<AuthLocalization>
    pathname?: string
    redirectTo?: string
    view?: AuthView
    otpSeparators?: 0 | 1 | 2
}

const props = withDefaults(defineProps<AuthFormProps>(), {
    otpSeparators: 0
})

const emit = defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('AuthForm must be used within AuthUIProvider')
}

const {
    basePath,
    credentials,
    localization: contextLocalization,
    magicLink,
    emailOTP,
    signUp,
    twoFactor: twoFactorEnabled,
    viewPaths,
    replace
} = context

const signUpEnabled = computed(() => !!signUp)
const mergedLocalization = computed(() => ({ ...contextLocalization, ...props.localization }))

const path = computed(() => props.pathname?.split('/').pop())

// Check for invalid path and redirect
watch(path, (newPath) => {
    if (newPath && !getAuthViewByPath(viewPaths, newPath)) {
        console.error(`Invalid auth view: ${newPath}`)
        replace(`${basePath}/${viewPaths.SIGN_IN}${window.location.search}`)
    }
}, { immediate: true })

const currentView = computed(() => 
    props.view || getAuthViewByPath(viewPaths, path.value) || 'SIGN_IN'
)

// Check for invalid view based on enabled features
watch(currentView, (view) => {
    let isInvalidView = false

    if (
        view === 'MAGIC_LINK' &&
        (!magicLink || (!credentials && !emailOTP))
    ) {
        isInvalidView = true
    }

    if (
        view === 'EMAIL_OTP' &&
        (!emailOTP || (!credentials && !magicLink))
    ) {
        isInvalidView = true
    }

    if (view === 'SIGN_UP' && !signUpEnabled.value) {
        isInvalidView = true
    }

    if (
        !credentials &&
        [
            'SIGN_UP',
            'FORGOT_PASSWORD',
            'RESET_PASSWORD',
            'TWO_FACTOR',
            'RECOVER_ACCOUNT'
        ].includes(view)
    ) {
        isInvalidView = true
    }

    if (
        ['TWO_FACTOR', 'RECOVER_ACCOUNT'].includes(view) &&
        !twoFactorEnabled
    ) {
        isInvalidView = true
    }

    if (isInvalidView) {
        replace(`${basePath}/${viewPaths.SIGN_IN}${window.location.search}`)
    }
}, { immediate: true })

// Determine which component to render
const currentComponent = computed(() => {
    switch (currentView.value) {
        case 'SIGN_OUT':
            return SignOut
        case 'CALLBACK':
            return AuthCallback
        case 'SIGN_IN':
            if (credentials) return SignInForm
            if (magicLink) return MagicLinkForm
            if (emailOTP) return EmailOTPForm
            return null
        case 'TWO_FACTOR':
            return TwoFactorForm
        case 'RECOVER_ACCOUNT':
            return RecoverAccountForm
        case 'MAGIC_LINK':
            return MagicLinkForm
        case 'EMAIL_OTP':
            return EmailOTPForm
        case 'FORGOT_PASSWORD':
            return ForgotPasswordForm
        case 'RESET_PASSWORD':
            return ResetPasswordForm
        case 'SIGN_UP':
            return signUpEnabled.value ? SignUpForm : null
        default:
            return null
    }
})

const setIsSubmitting = (value: boolean) => {
    emit('update:isSubmitting', value)
}
</script>