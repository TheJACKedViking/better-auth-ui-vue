<template>
    <div>
        <RecaptchaV2 v-if="showRecaptchaV2" ref="captchaRef" />
        <RecaptchaBadge v-if="showRecaptchaBadge" :localization="localization" />
        <VueTurnstile
            v-if="showTurnstile"
            v-model="turnstileToken"
            ref="captchaRef"
            class="mx-auto"
            :site-key="captcha?.siteKey || ''"
            :options="{
                theme: theme,
                size: 'flexible'
            }"
        />
        <div v-if="showHCaptcha" class="mx-auto">
            <VueHcaptcha
                ref="captchaRef"
                :sitekey="captcha?.siteKey || ''"
                :theme="theme"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import VueTurnstile from 'vue-turnstile'
import VueHcaptcha from '@hcaptcha/vue-hcaptcha'

import { useTheme } from '../../composables/use-theme'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import type { AuthLocalization } from '../../localization/auth-localization'
import RecaptchaBadge from './recaptcha-badge.vue'
import RecaptchaV2 from './recaptcha-v2.vue'

// Default captcha endpoints
const DEFAULT_CAPTCHA_ENDPOINTS = [
    '/sign-up/email',
    '/sign-in/email',
    '/forget-password'
]

interface Props {
    localization: Partial<AuthLocalization>
    action?: string // Optional action to check if it's in the endpoints list
}

const props = defineProps<Props>()

const captchaRef = ref()
const turnstileToken = ref('')

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('Captcha must be used within AuthUIProvider')
}

const { captcha } = context
const { theme } = useTheme()

// Check if captcha should be shown for this action
const shouldShow = computed(() => {
    if (!captcha) return false
    
    if (props.action) {
        const endpoints = captcha.endpoints || DEFAULT_CAPTCHA_ENDPOINTS
        return endpoints.includes(props.action)
    }
    
    return true
})

const showRecaptchaV2 = computed(() =>
    shouldShow.value && (
        captcha?.provider === 'google-recaptcha-v2-checkbox' ||
        captcha?.provider === 'google-recaptcha-v2-invisible'
    )
)

const showRecaptchaBadge = computed(() =>
    shouldShow.value && (
        captcha?.provider === 'google-recaptcha-v3' ||
        captcha?.provider === 'google-recaptcha-v2-invisible'
    )
)

const showTurnstile = computed(() =>
    shouldShow.value && captcha?.provider === 'cloudflare-turnstile'
)

const showHCaptcha = computed(() =>
    shouldShow.value && captcha?.provider === 'hcaptcha'
)

defineExpose({
    captchaRef
})
</script>