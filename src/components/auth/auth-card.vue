<template>
    <AuthCallback v-if="currentView === 'CALLBACK'" :redirect-to="redirectTo" />
    <SignOut v-else-if="currentView === 'SIGN_OUT'" />
    <AcceptInvitationCard
        v-else-if="currentView === 'ACCEPT_INVITATION'"
        :class="className"
        :class-names="classNames"
        :localization="localization"
    />
    <Loader2 v-else-if="isSettingsViewLoading" class="animate-spin" />
    <SettingsCards
        v-else-if="isSettingsView"
        :class="cn(className)"
        :class-names="classNames?.settings"
        :localization="localization"
        :view="currentView as SettingsView"
    />
    <Card v-else :class="cn('w-full max-w-sm', className, classNames?.base)">
        <CardHeader :class="classNames?.header">
            <slot name="header">
                <CardTitle :class="cn('text-lg md:text-xl', classNames?.title)">
                    {{ localization[currentView as keyof typeof localization] }}
                </CardTitle>

                <CardDescription
                    v-if="description"
                    :class="cn('text-xs md:text-sm', classNames?.description)"
                >
                    {{ description }}
                </CardDescription>
            </slot>
        </CardHeader>

        <CardContent :class="cn('grid gap-6', classNames?.content)">
            <OneTap
                v-if="showOneTap"
                :localization="localization"
                :redirect-to="redirectTo"
            />

            <div v-if="credentials || magicLink || emailOTP" class="grid gap-4">
                <AuthForm
                    :class-names="classNames?.form"
                    :callback-url="callbackURL"
                    :is-submitting="isSubmitting"
                    :localization="localization"
                    :otp-separators="otpSeparators"
                    :pathname="pathname"
                    :redirect-to="redirectTo"
                    @update:is-submitting="setIsSubmitting"
                />

                <MagicLinkButton
                    v-if="showMagicLinkButton"
                    :class-names="classNames"
                    :localization="localization"
                    :view="currentView"
                    :is-submitting="isSubmitting"
                />

                <EmailOTPButton
                    v-if="showEmailOTPButton"
                    :class-names="classNames"
                    :localization="localization"
                    :view="currentView"
                    :is-submitting="isSubmitting"
                />
            </div>

            <template v-if="showSocialProviders">
                <div
                    v-if="credentials || magicLink || emailOTP"
                    :class="cn('flex items-center gap-2', classNames?.continueWith)"
                >
                    <Separator :class="cn('!w-auto grow', classNames?.separator)" />
                    <span class="flex-shrink-0 text-muted-foreground text-sm">
                        {{ localization.OR_CONTINUE_WITH }}
                    </span>
                    <Separator :class="cn('!w-auto grow', classNames?.separator)" />
                </div>

                <div class="grid gap-4">
                    <div
                        v-if="social?.providers?.length || genericOAuth?.providers?.length"
                        :class="cn(
                            'flex w-full items-center justify-between gap-4',
                            computedSocialLayout === 'horizontal' && 'flex-wrap',
                            computedSocialLayout === 'vertical' && 'flex-col',
                            computedSocialLayout === 'grid' && 'grid grid-cols-2'
                        )"
                    >
                        <template v-for="provider in social?.providers" :key="provider">
                            <ProviderButton
                                v-if="getSocialProvider(provider)"
                                :class-names="classNames"
                                :callback-url="callbackURL"
                                :is-submitting="isSubmitting"
                                :localization="localization"
                                :provider="getSocialProvider(provider)!"
                                :redirect-to="redirectTo"
                                :social-layout="computedSocialLayout"
                                @update:is-submitting="setIsSubmitting"
                            />
                        </template>

                        <ProviderButton
                            v-for="provider in genericOAuth?.providers"
                            :key="provider.provider"
                            :class-names="classNames"
                            :callback-url="callbackURL"
                            :is-submitting="isSubmitting"
                            :localization="localization"
                            :provider="provider"
                            :redirect-to="redirectTo"
                            :social-layout="computedSocialLayout"
                            other
                            @update:is-submitting="setIsSubmitting"
                        />
                    </div>

                    <PasskeyButton
                        v-if="showPasskeyButton"
                        :class-names="classNames"
                        :is-submitting="isSubmitting"
                        :localization="localization"
                        :redirect-to="redirectTo"
                        @update:is-submitting="setIsSubmitting"
                    />
                </div>
            </template>
        </CardContent>

        <CardFooter
            v-if="credentials && signUp"
            :class="cn(
                'justify-center gap-1.5 text-muted-foreground text-sm',
                classNames?.footer
            )"
        >
            <ArrowLeftIcon
                v-if="!['SIGN_IN', 'MAGIC_LINK', 'EMAIL_OTP', 'SIGN_UP'].includes(currentView)"
                class="size-3"
            />
            <template v-else>
                {{ footerText }}
            </template>

            <component
                :is="Link"
                v-if="['SIGN_IN', 'MAGIC_LINK', 'EMAIL_OTP', 'SIGN_UP'].includes(currentView)"
                :class="cn('text-foreground underline', classNames?.footerLink)"
                :href="`${basePath}/${viewPaths[footerLinkView]}${isHydrated ? searchParams : ''}`"
            >
                <button
                    :class="footerButtonClasses"
                    data-slot="button"
                >
                    {{ footerLinkText }}
                </button>
            </component>
            <button
                v-else
                :class="footerButtonClasses"
                @click="goBack"
                data-slot="button"
            >
                {{ localization.GO_BACK }}
            </button>
        </CardFooter>
    </Card>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, onUnmounted } from 'vue'
import { ArrowLeftIcon, Loader2 } from 'lucide-vue-next'

import { useIsHydrated } from '../../composables/use-hydrated'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import type { AuthView } from '../../lib/auth-view-paths'
import { socialProviders } from '../../lib/social-providers'
import { cn, getAuthViewByPath } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import AcceptInvitationCard from '../organization/accept-invitation-card.vue'
import { type SettingsCardsClassNames, type SettingsView, settingsViews } from '../../lib/settings-constants'
import SettingsCards from '../settings/settings-cards.vue'
import AuthCallback from './auth-callback.vue'
import AuthForm, { type AuthFormClassNames } from './auth-form.vue'
import EmailOTPButton from './email-otp-button.vue'
import MagicLinkButton from './magic-link-button.vue'
import OneTap from './one-tap.vue'
import PasskeyButton from './passkey-button.vue'
import ProviderButton from './provider-button.vue'
import SignOut from './sign-out.vue'

export interface AuthCardClassNames {
    base?: string
    content?: string
    description?: string
    footer?: string
    footerLink?: string
    continueWith?: string
    form?: AuthFormClassNames
    header?: string
    separator?: string
    settings?: SettingsCardsClassNames
    title?: string
}

export interface AuthCardProps {
    className?: string
    classNames?: AuthCardClassNames
    callbackURL?: string
    localization?: AuthLocalization
    pathname?: string
    redirectTo?: string
    socialLayout?: "auto" | "horizontal" | "grid" | "vertical"
    view?: AuthView
    otpSeparators?: 0 | 1 | 2
}

const props = withDefaults(defineProps<AuthCardProps>(), {
    socialLayout: 'auto',
    otpSeparators: 0
})

const isHydrated = useIsHydrated()
const isSubmitting = ref(false)

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('AuthCard must be used within AuthUIProvider')
}

const {
    basePath,
    credentials,
    localization: contextLocalization,
    magicLink,
    emailOTP,
    oneTap,
    passkey,
    settings,
    signUp,
    social,
    genericOAuth,
    viewPaths,
    replace,
    Link
} = context

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const computedSocialLayout = computed(() => {
    if (props.socialLayout === 'auto') {
        return !credentials
            ? 'vertical'
            : social?.providers && social.providers.length > 2
              ? 'horizontal'
              : 'vertical'
    }
    return props.socialLayout
})

const path = computed(() => props.pathname?.split('/').pop())
const currentView = computed(() => 
    props.view || getAuthViewByPath(viewPaths, path.value) || 'SIGN_IN'
)

const description = computed(() =>
    !credentials && !magicLink && !emailOTP
        ? localization.value.DISABLED_CREDENTIALS_DESCRIPTION
        : localization.value[`${currentView.value}_DESCRIPTION` as keyof typeof localization.value]
)

const isSettingsView = computed(() => 
    settingsViews.includes(currentView.value as SettingsView)
)

const isSettingsViewLoading = computed(() =>
    isSettingsView.value && (!settings || settings.url)
)

const showOneTap = computed(() =>
    oneTap && ['SIGN_IN', 'SIGN_UP', 'MAGIC_LINK', 'EMAIL_OTP'].includes(currentView.value)
)

const showMagicLinkButton = computed(() =>
    magicLink &&
    ((credentials &&
        ['FORGOT_PASSWORD', 'SIGN_UP', 'SIGN_IN', 'MAGIC_LINK', 'EMAIL_OTP'].includes(currentView.value)) ||
        (emailOTP && currentView.value === 'EMAIL_OTP'))
)

const showEmailOTPButton = computed(() =>
    emailOTP &&
    ((credentials &&
        ['FORGOT_PASSWORD', 'SIGN_UP', 'SIGN_IN', 'MAGIC_LINK', 'EMAIL_OTP'].includes(currentView.value)) ||
        (magicLink && ['SIGN_IN', 'MAGIC_LINK'].includes(currentView.value)))
)

const showSocialProviders = computed(() =>
    currentView.value !== 'RESET_PASSWORD' &&
    (social?.providers?.length ||
        genericOAuth?.providers?.length ||
        (currentView.value === 'SIGN_IN' && passkey))
)

const showPasskeyButton = computed(() =>
    passkey &&
    ['SIGN_IN', 'MAGIC_LINK', 'EMAIL_OTP', 'RECOVER_ACCOUNT', 'TWO_FACTOR', 'FORGOT_PASSWORD'].includes(currentView.value)
)

const searchParams = computed(() => {
    if (typeof window !== 'undefined') {
        return window.location.search
    }
    return ''
})

const footerText = computed(() => {
    if (currentView.value === 'SIGN_IN' || currentView.value === 'MAGIC_LINK' || currentView.value === 'EMAIL_OTP') {
        return localization.value.DONT_HAVE_AN_ACCOUNT
    }
    if (currentView.value === 'SIGN_UP') {
        return localization.value.ALREADY_HAVE_AN_ACCOUNT
    }
    return ''
})

const footerLinkView = computed(() => {
    if (currentView.value === 'SIGN_IN' || currentView.value === 'MAGIC_LINK' || currentView.value === 'EMAIL_OTP') {
        return 'SIGN_UP'
    }
    return 'SIGN_IN'
})

const footerLinkText = computed(() => {
    if (currentView.value === 'SIGN_IN' || currentView.value === 'MAGIC_LINK' || currentView.value === 'EMAIL_OTP') {
        return localization.value.SIGN_UP
    }
    return localization.value.SIGN_IN
})

const setIsSubmitting = (value: boolean) => {
    isSubmitting.value = value
}

const getSocialProvider = (provider: string) => {
    return socialProviders.find((socialProvider) => 
        socialProvider.provider === provider
    )
}

// Computed class for footer buttons to avoid template syntax issues
const footerButtonClasses = computed(() => cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-foreground hover:bg-accent hover:text-accent-foreground px-0 underline',
    props.classNames?.footerLink
))

// Handlers
const handlePageHide = () => {
    setIsSubmitting(false)
}

const goBack = () => {
    window.history.back()
}

// Lifecycle
onMounted(() => {
    window.addEventListener('pagehide', handlePageHide)
})

onUnmounted(() => {
    setIsSubmitting(false)
    window.removeEventListener('pagehide', handlePageHide)
})

// Watch for settings redirects
watch([currentView, settings], () => {
    if (currentView.value === 'SETTINGS' && settings?.url) {
        replace(settings.url)
    }
    if (currentView.value === 'SETTINGS' && !settings) {
        replace(props.redirectTo || '/')
    }

    // Handle basePath redirects for settings views
    if (settings?.basePath && settingsViews.includes(currentView.value as SettingsView)) {
        const viewPath = viewPaths[currentView.value as keyof typeof viewPaths]
        const redirectPath = `${settings.basePath}/${viewPath}`
        replace(redirectPath)
    }
}, { immediate: true })
</script>