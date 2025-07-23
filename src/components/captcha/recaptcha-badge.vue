<template>
    <div>
        <style v-if="!captcha?.hideBadge && isHydrated">
            .grecaptcha-badge { visibility: visible !important; }
        </style>
        
        <template v-if="captcha?.hideBadge">
            <style>
                .grecaptcha-badge { visibility: hidden; }
            </style>
            
            <p :class="cn('text-muted-foreground text-xs', className)">
                {{ localization.PROTECTED_BY_RECAPTCHA }}
                {{ localization.BY_CONTINUING_YOU_AGREE }} Google
                <a
                    class="text-foreground hover:underline"
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noreferrer"
                >
                    {{ localization.PRIVACY_POLICY }}
                </a>
                &
                <a
                    class="text-foreground hover:underline"
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noreferrer"
                >
                    {{ localization.TERMS_OF_SERVICE }}
                </a>
                .
            </p>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useIsHydrated } from '../../composables/use-hydrated'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import { cn } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'

export interface RecaptchaV3BadgeProps {
    className?: string
    localization?: Partial<AuthLocalization>
}

const props = defineProps<RecaptchaV3BadgeProps>()

const isHydrated = useIsHydrated()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('RecaptchaBadge must be used within AuthUIProvider')
}

const { captcha, localization: contextLocalization } = context
const localization = computed(() => ({ ...contextLocalization, ...props.localization }))
</script>