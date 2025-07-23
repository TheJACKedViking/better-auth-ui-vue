<template>
    <div>
        <div
            ref="recaptchaContainer"
            :class="cn(
                captcha?.provider === 'google-recaptcha-v2-invisible'
                    ? 'absolute'
                    : 'mx-auto h-[76px] w-[302px] overflow-hidden rounded bg-muted'
            )"
        />
        
        <style>
            .grecaptcha-badge {
                border-radius: var(--radius) !important;
                --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
                box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow) !important;
                border-style: var(--tw-border-style) !important;
                border-width: 1px;
            }

            .dark .grecaptcha-badge {
                border-color: var(--input) !important;
            }
        </style>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, watch } from 'vue'
import { useLang } from '../../composables/use-lang'
import { useTheme } from '../../composables/use-theme'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import { cn } from '../../lib/utils'

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('RecaptchaV2 must be used within AuthUIProvider')
}

const { captcha } = context
const { theme } = useTheme()
const { lang } = useLang()

const recaptchaContainer = ref<HTMLDivElement>()
let recaptchaId: number | null = null

const instance = ref<any>(null)

// Set global recaptcha options
onMounted(() => {
    if (!captcha) return
    
    ;(window as any).recaptchaOptions = {
        useRecaptchaNet: captcha?.recaptchaNet,
        enterprise: captcha?.enterprise
    }
    
    loadRecaptcha()
})

const loadRecaptcha = () => {
    if (!captcha || !recaptchaContainer.value) return
    
    // Load reCAPTCHA script if not already loaded
    if (!(window as any).grecaptcha) {
        const script = document.createElement('script')
        script.src = captcha?.enterprise
            ? 'https://www.google.com/recaptcha/enterprise.js?render=explicit'
            : 'https://www.google.com/recaptcha/api.js?render=explicit'
        script.async = true
        script.defer = true
        script.onload = renderRecaptcha
        document.head.appendChild(script)
    } else {
        renderRecaptcha()
    }
}

const renderRecaptcha = () => {
    if (!captcha || !recaptchaContainer.value || !(window as any).grecaptcha) return
    
    // Clear existing recaptcha if any
    if (recaptchaId !== null) {
        (window as any).grecaptcha.reset(recaptchaId)
    }
    
    recaptchaId = (window as any).grecaptcha.render(recaptchaContainer.value, {
        sitekey: captcha?.siteKey,
        theme: theme.value,
        hl: lang.value,
        size: captcha?.provider === 'google-recaptcha-v2-invisible' ? 'invisible' : 'normal'
    })
    
    instance.value = {
        getValue: () => (window as any).grecaptcha.getResponse(recaptchaId),
        executeAsync: () => new Promise((resolve) => {
            (window as any).grecaptcha.execute(recaptchaId, {
                callback: (response: string) => resolve(response)
            })
        })
    }
}

// Re-render when theme or language changes
watch([theme, lang], () => {
    if (recaptchaId !== null && (window as any).grecaptcha) {
        renderRecaptcha()
    }
})

onUnmounted(() => {
    if (recaptchaId !== null && (window as any).grecaptcha) {
        (window as any).grecaptcha.reset(recaptchaId)
    }
})

defineExpose({
    instance
})
</script>