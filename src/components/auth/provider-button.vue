<template>
    <button
        :class="cn(
            socialLayout === 'vertical' ? 'w-full' : 'grow',
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 has-[>svg]:px-3',
            className,
            classNames?.form?.button,
            classNames?.form?.outlineButton,
            classNames?.form?.providerButton
        )"
        :disabled="isSubmitting"
        @click="doSignInSocial"
        data-slot="button"
    >
        <component
            v-if="provider.icon"
            :is="provider.icon"
            :class="classNames?.form?.icon"
        />

        <span v-if="socialLayout === 'grid'">{{ provider.name }}</span>
        <span v-else-if="socialLayout === 'vertical'">
            {{ localization.SIGN_IN_WITH }} {{ provider.name }}
        </span>
    </button>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { SocialProvider } from 'better-auth/social-providers'

import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import type { Provider } from '../../lib/social-providers'
import { cn, getLocalizedError, getSearchParam } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { AuthCardClassNames } from './auth-card.vue'

interface Props {
    className?: string
    classNames?: AuthCardClassNames
    callbackURL?: string
    isSubmitting: boolean
    localization: Partial<AuthLocalization>
    other?: boolean
    provider: Provider
    redirectTo?: string
    socialLayout: "auto" | "horizontal" | "grid" | "vertical"
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('ProviderButton must be used within AuthUIProvider')
}

const {
    authClient,
    basePath,
    baseURL,
    persistClient,
    redirectTo: contextRedirectTo,
    viewPaths,
    social,
    genericOAuth,
    toast
} = context

const getRedirectTo = computed(() =>
    props.redirectTo || getSearchParam('redirectTo') || contextRedirectTo
)

const getCallbackURL = computed(() =>
    `${baseURL}${
        props.callbackURL ||
        (persistClient
            ? `${basePath}/${viewPaths.CALLBACK}?redirectTo=${getRedirectTo.value}`
            : getRedirectTo.value)
    }`
)

const doSignInSocial = async () => {
    emit('update:isSubmitting', true)

    try {
        if (props.other) {
            const oauth2Params = {
                providerId: props.provider.provider,
                callbackURL: getCallbackURL.value,
                fetchOptions: { throw: true }
            }

            if (genericOAuth?.signIn) {
                await genericOAuth.signIn(oauth2Params)

                setTimeout(() => {
                    emit('update:isSubmitting', false)
                }, 10000)
            } else {
                await authClient.signIn.oauth2(oauth2Params)
            }
        } else {
            const socialParams = {
                provider: props.provider.provider as SocialProvider,
                callbackURL: getCallbackURL.value,
                fetchOptions: { throw: true }
            }

            if (social?.signIn) {
                await social.signIn(socialParams)

                setTimeout(() => {
                    emit('update:isSubmitting', false)
                }, 10000)
            } else {
                await authClient.signIn.social(socialParams)
            }
        }
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: props.localization })
        })

        emit('update:isSubmitting', false)
    }
}
</script>