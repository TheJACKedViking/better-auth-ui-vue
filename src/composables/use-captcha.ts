import { ref, inject } from 'vue'
import type { Ref } from 'vue'
import { AuthUIContextKey } from '../lib/auth-ui-provider'
import type { AuthLocalization } from '../localization/auth-localization'

// Default captcha endpoints
const DEFAULT_CAPTCHA_ENDPOINTS = [
    '/sign-up/email',
    '/sign-in/email',
    '/forget-password'
]

// Sanitize action name for reCAPTCHA
// Google reCAPTCHA only allows A-Za-z/_ in action names
const sanitizeActionName = (action: string): string => {
    // First remove leading slash if present
    let result = action.startsWith('/') ? action.substring(1) : action
    
    // Convert both kebab-case and path separators to camelCase
    // Example: "/sign-in/email" becomes "signInEmail"
    result = result
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/\/([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/\//g, '')
        .replace(/[^A-Za-z0-9_]/g, '')
    
    return result
}

export function useCaptcha({
    localization
}: {
    localization: Partial<AuthLocalization>
}) {
    const context = inject(AuthUIContextKey)
    if (!context) {
        throw new Error('useCaptcha must be used within AuthUIProvider')
    }
    
    const { captcha, localization: contextLocalization } = context
    
    const mergedLocalization = { ...contextLocalization, ...localization }
    
    // Vue ref for captcha instance
    const captchaRef = ref<any>(null)
    
    // For reCAPTCHA v3, we'll need to inject the executeRecaptcha function
    const executeRecaptchaV3 = inject<(action: string) => Promise<string | null>>('executeRecaptchaV3', () => Promise.resolve(null))
    
    const executeCaptcha = async (action: string) => {
        if (!captcha) throw new Error(mergedLocalization.MISSING_RESPONSE)
        
        // Sanitize the action name for reCAPTCHA
        let response: string | undefined | null
        
        switch (captcha.provider) {
            case 'google-recaptcha-v3': {
                const sanitizedAction = sanitizeActionName(action)
                response = await executeRecaptchaV3(sanitizedAction)
                break
            }
            case 'google-recaptcha-v2-checkbox': {
                response = captchaRef.value?.getValue?.()
                break
            }
            case 'google-recaptcha-v2-invisible': {
                response = await captchaRef.value?.executeAsync?.()
                break
            }
            case 'cloudflare-turnstile': {
                response = captchaRef.value?.getResponse?.()
                break
            }
            case 'hcaptcha': {
                response = captchaRef.value?.getResponse?.()
                break
            }
        }
        
        if (!response) {
            throw new Error(mergedLocalization.MISSING_RESPONSE)
        }
        
        return response
    }
    
    const getCaptchaHeaders = async (action: string) => {
        if (!captcha) return undefined
        
        // Use custom endpoints if provided, otherwise use defaults
        const endpoints = captcha.endpoints || DEFAULT_CAPTCHA_ENDPOINTS
        
        // Only execute captcha if the action is in the endpoints list
        if (endpoints.includes(action)) {
            return { 'x-captcha-response': await executeCaptcha(action) }
        }
        
        return undefined
    }
    
    return {
        captchaRef,
        getCaptchaHeaders
    }
}