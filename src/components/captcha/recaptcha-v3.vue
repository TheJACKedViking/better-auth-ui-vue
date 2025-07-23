<template>
    <div>
        <style v-if="isHydrated">
            .grecaptcha-badge {
                visibility: hidden;
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
        
        <slot />
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, provide, watch } from 'vue'
import { useIsHydrated } from '../../composables/use-hydrated'
import { useLang } from '../../composables/use-lang'
import { useTheme } from '../../composables/use-theme'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'

const isHydrated = useIsHydrated()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('RecaptchaV3 must be used within AuthUIProvider')
}

const { captcha } = context
const { theme } = useTheme()
const { lang } = useLang()

let executeRecaptcha: ((action: string) => Promise<string | null>) | null = null

// Load and initialize reCAPTCHA v3
onMounted(() => {
    if (captcha?.provider !== 'google-recaptcha-v3') return
    
    // Load reCAPTCHA v3 script
    const script = document.createElement('script')
    script.src = captcha.enterprise
        ? `https://www.google.com/recaptcha/enterprise.js?render=${captcha.siteKey}`
        : `https://www.google.com/recaptcha/api.js?render=${captcha.siteKey}`
    
    if (captcha.recaptchaNet) {
        script.src = script.src.replace('www.google.com', 'www.recaptcha.net')
    }
    
    script.async = true
    script.defer = true
    
    script.onload = () => {
        if ((window as any).grecaptcha) {
            (window as any).grecaptcha.ready(() => {
                executeRecaptcha = (action: string) => {
                    return (window as any).grecaptcha.execute(captcha.siteKey, { action })
                }
                
                // Provide the executeRecaptcha function for useCaptcha composable
                provide('executeRecaptchaV3', executeRecaptcha)
                
                updateRecaptchaTheme()
            })
        }
    }
    
    document.head.appendChild(script)
})

// Update reCAPTCHA theme and language
const updateRecaptchaTheme = () => {
    const iframe = document.querySelector("iframe[title='reCAPTCHA']") as HTMLIFrameElement
    if (iframe) {
        const iframeSrcUrl = new URL(iframe.src)
        iframeSrcUrl.searchParams.set('theme', theme.value)
        if (lang.value) iframeSrcUrl.searchParams.set('hl', lang.value)
        iframe.src = iframeSrcUrl.toString()
    }
}

// Watch for theme and language changes
watch([theme, lang], () => {
    if (executeRecaptcha) {
        updateRecaptchaTheme()
    }
})

onUnmounted(() => {
    // Clean up reCAPTCHA
    if ((window as any).grecaptcha) {
        // Note: reCAPTCHA v3 doesn't have a proper cleanup method
        // The badge will be removed when the component is unmounted
    }
})
</script>