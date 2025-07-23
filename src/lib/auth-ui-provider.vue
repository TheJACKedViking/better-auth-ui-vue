<template>
    <component :is="captchaWrapper">
        <slot />
    </component>
</template>

<script lang="ts">
import { h } from 'vue'
import { toast } from 'vue-sonner'
import type { RenderToast } from '../types/render-toast'
import type { Link } from '../types/link'
import type { AuthClient } from '../types/auth-client'
import type { AdditionalFields } from '../types/additional-fields'
import type { AvatarOptions } from '../types/avatar-options'
import type { CaptchaOptions } from '../types/captcha-options'
import type { CredentialsOptions } from '../types/credentials-options'
import type { DeleteUserOptions } from '../types/delete-user-options'
import type { GenericOAuthOptions } from '../types/generic-oauth-options'
import type { GravatarOptions } from '../types/gravatar-options'
import type { AuthHooks } from '../types/auth-hooks'
import type { AuthLocalization } from '../localization/auth-localization'
import type { AuthMutators } from '../types/auth-mutators'
import type { OrganizationOptionsContext } from '../types/organization-options'
import type { SettingsOptions } from '../types/settings-options'
import type { SignUpOptions } from '../types/sign-up-options'
import type { SocialOptions } from '../types/social-options'
import type { AuthViewPaths } from './auth-view-paths'
import type { AnyAuthClient } from '../types/any-auth-client'

// Default functions defined outside script setup to be used in props default
const defaultToast: RenderToast = ({ variant = 'default', message }) => {
    if (!message) return
    
    if (variant === 'default') {
        toast(message)
    } else {
        toast[variant](message)
    }
}

const DefaultLink = ({ href, className, children }: any) => 
    h('a', { class: className, href }, children as any)

// Export types
export type AuthUIContextType = {
    authClient: AuthClient
    additionalFields?: AdditionalFields
    apiKey?:
        | {
              prefix?: string
              metadata?: Record<string, unknown>
          }
        | boolean
    avatar?: AvatarOptions
    basePath: string
    baseURL?: string
    captcha?: CaptchaOptions
    credentials?: CredentialsOptions
    redirectTo: string
    changeEmail?: boolean
    deleteUser?: DeleteUserOptions
    emailVerification?: boolean
    freshAge: number
    genericOAuth?: GenericOAuthOptions
    gravatar?: boolean | GravatarOptions
    hooks: AuthHooks
    localization: AuthLocalization
    magicLink?: boolean
    emailOTP?: boolean
    multiSession?: boolean
    mutators: AuthMutators
    nameRequired?: boolean
    oneTap?: boolean
    optimistic?: boolean
    organization?: OrganizationOptionsContext
    passkey?: boolean
    persistClient?: boolean
    settings?: SettingsOptions
    signUp?: SignUpOptions
    social?: SocialOptions
    toast: RenderToast
    twoFactor?: ('otp' | 'totp')[]
    viewPaths: AuthViewPaths
    navigate: typeof defaultNavigate
    onSessionChange?: () => void | Promise<void>
    replace: typeof defaultReplace
    Link: Link
}

const defaultNavigate = (href: string) => {
    window.location.href = href
}

const defaultReplace = (href: string) => {
    window.location.replace(href)
}

export interface AuthUIProviderProps {
    authClient: AnyAuthClient
    avatar?: boolean | Partial<AvatarOptions>
    avatarExtension?: string
    avatarSize?: number
    deleteAccountVerification?: boolean
    deleteUser?: DeleteUserOptions | boolean
    hooks?: Partial<AuthHooks>
    settings?: boolean | Partial<SettingsOptions>
    settingsFields?: string[]
    settingsURL?: string
    viewPaths?: Partial<AuthViewPaths>
    toast?: RenderToast
    localization?: AuthLocalization
    mutators?: Partial<AuthMutators>
    providers?: SocialProvider[]
    organization?: OrganizationOptions | boolean
    otherProviders?: Provider[]
    signInSocial?: (params: Parameters<AuthClient['signIn']['social']>[0]) => Promise<unknown>
    credentials?: boolean | CredentialsOptions
    confirmPassword?: boolean
    forgotPassword?: boolean
    passwordValidation?: PasswordValidation
    rememberMe?: boolean
    username?: boolean
    uploadAvatar?: (file: File) => Promise<string | undefined | null>
    signUp?: SignUpOptions | boolean
    signUpFields?: string[]
    additionalFields?: AdditionalFields
    apiKey?: boolean | { prefix?: string; metadata?: Record<string, unknown> }
    basePath?: string
    baseURL?: string
    captcha?: CaptchaOptions
    redirectTo?: string
    changeEmail?: boolean
    emailVerification?: boolean
    freshAge?: number
    genericOAuth?: GenericOAuthOptions
    gravatar?: boolean | GravatarOptions
    magicLink?: boolean
    emailOTP?: boolean
    multiSession?: boolean
    nameRequired?: boolean
    oneTap?: boolean
    optimistic?: boolean
    passkey?: boolean
    persistClient?: boolean
    social?: SocialOptions
    twoFactor?: ('otp' | 'totp')[]
    navigate?: typeof defaultNavigate
    onSessionChange?: () => void | Promise<void>
    replace?: typeof defaultReplace
    Link?: Link
}
</script>

<script setup lang="ts">
import { 
    type PropType, 
    type Component,
    provide, 
    computed, 
    onMounted, 
    ref,
    watchEffect
} from 'vue'
import { AuthUIContextKey } from './auth-ui-provider'
import type { SocialProvider } from 'better-auth/social-providers'

import RecaptchaV3 from '../components/captcha/recaptcha-v3.vue'
import { useAuthData } from '../composables/use-auth-data'
import { authLocalization } from '../localization/auth-localization'
import type {
    OrganizationOptions
} from '../types/organization-options'
import type { PasswordValidation } from '../types/password-validation'
import { authViewPaths } from './auth-view-paths'
import type { Provider } from './social-providers'
import { getLocalizedError, getSearchParam } from './utils'

// Injection key is imported from auth-ui-provider.ts

// DefaultLink moved to regular script block above

// defaultToast moved to regular script block above

const props = defineProps({
    authClient: {
        type: Object as PropType<AnyAuthClient>,
        required: true
    },
    avatar: {
        type: [Boolean, Object] as PropType<boolean | Partial<AvatarOptions>>
    },
    avatarExtension: String,
    avatarSize: Number,
    deleteAccountVerification: Boolean,
    deleteUser: {
        type: [Boolean, Object] as PropType<DeleteUserOptions | boolean>
    },
    hooks: {
        type: Object as PropType<Partial<AuthHooks>>
    },
    settings: {
        type: [Boolean, Object] as PropType<boolean | Partial<SettingsOptions>>
    },
    settingsFields: {
        type: Array as PropType<string[]>
    },
    settingsURL: String,
    viewPaths: {
        type: Object as PropType<Partial<AuthViewPaths>>
    },
    toast: {
        type: Function as PropType<RenderToast>,
        default: () => defaultToast
    },
    localization: {
        type: Object as PropType<AuthLocalization>
    },
    mutators: {
        type: Object as PropType<Partial<AuthMutators>>
    },
    providers: {
        type: Array as PropType<SocialProvider[]>
    },
    organization: {
        type: [Boolean, Object] as PropType<OrganizationOptions | boolean>
    },
    otherProviders: {
        type: Array as PropType<Provider[]>
    },
    signInSocial: {
        type: Function as PropType<(params: Parameters<AuthClient['signIn']['social']>[0]) => Promise<unknown>>
    },
    credentials: {
        type: [Boolean, Object] as PropType<boolean | CredentialsOptions>,
        default: true
    },
    confirmPassword: Boolean,
    forgotPassword: Boolean,
    passwordValidation: {
        type: Object as PropType<PasswordValidation>
    },
    rememberMe: Boolean,
    username: Boolean,
    uploadAvatar: {
        type: Function as PropType<(file: File) => Promise<string | undefined | null>>
    },
    signUp: {
        type: [Boolean, Object] as PropType<SignUpOptions | boolean>,
        default: true
    },
    signUpFields: {
        type: Array as PropType<string[]>
    },
    // Partial AuthUIContextType props
    additionalFields: Object as PropType<AdditionalFields>,
    apiKey: [Boolean, Object] as PropType<boolean | { prefix?: string; metadata?: Record<string, unknown> }>,
    basePath: {
        type: String,
        default: '/auth'
    },
    baseURL: {
        type: String,
        default: ''
    },
    captcha: Object as PropType<CaptchaOptions>,
    redirectTo: {
        type: String,
        default: '/'
    },
    changeEmail: {
        type: Boolean,
        default: true
    },
    emailVerification: Boolean,
    freshAge: {
        type: Number,
        default: 60 * 60 * 24
    },
    genericOAuth: Object as PropType<GenericOAuthOptions>,
    gravatar: [Boolean, Object] as PropType<boolean | GravatarOptions>,
    magicLink: Boolean,
    emailOTP: Boolean,
    multiSession: Boolean,
    nameRequired: {
        type: Boolean,
        default: true
    },
    oneTap: Boolean,
    optimistic: Boolean,
    passkey: Boolean,
    persistClient: Boolean,
    social: Object as PropType<SocialOptions>,
    twoFactor: Array as PropType<('otp' | 'totp')[]>,
    navigate: Function as PropType<typeof defaultNavigate>,
    onSessionChange: Function as PropType<() => void | Promise<void>>,
    replace: Function as PropType<typeof defaultReplace>,
    Link: {
        type: Function as PropType<any>,
        default: () => DefaultLink
    }
})

// Show deprecation warnings
onMounted(() => {
    const warnings = [
        { prop: 'uploadAvatar', replacement: 'avatar.upload' },
        { prop: 'avatarExtension', replacement: 'avatar.extension' },
        { prop: 'avatarSize', replacement: 'avatar.size' },
        { prop: 'settingsFields', replacement: 'settings.fields' },
        { prop: 'settingsURL', replacement: 'settings.url' },
        { prop: 'deleteAccountVerification', replacement: 'deleteUser.verification' },
        { prop: 'providers', replacement: 'social.providers' },
        { prop: 'otherProviders', replacement: 'genericOAuth.providers' },
        { prop: 'signInSocial', replacement: 'social.signIn' },
        { prop: 'confirmPassword', replacement: 'credentials.confirmPassword' },
        { prop: 'forgotPassword', replacement: 'credentials.forgotPassword' },
        { prop: 'passwordValidation', replacement: 'credentials.passwordValidation' },
        { prop: 'rememberMe', replacement: 'credentials.rememberMe' },
        { prop: 'username', replacement: 'credentials.username' },
        { prop: 'signUpFields', replacement: 'signUp.fields' }
    ]
    
    warnings.forEach(({ prop, replacement }) => {
        if ((props as any)[prop] !== undefined) {
            console.warn(`[Better Auth UI] ${prop} is deprecated, use ${replacement} instead`)
        }
    })
})

const authClient = props.authClient as AuthClient

// Computed properties for options
const avatar = computed<AvatarOptions | undefined>(() => {
    if (!props.avatar) return
    
    if (props.avatar === true) {
        return {
            extension: props.avatarExtension || 'png',
            size: props.avatarSize || (props.uploadAvatar ? 256 : 128),
            upload: props.uploadAvatar
        }
    }
    
    return {
        upload: props.avatar.upload || props.uploadAvatar,
        extension: props.avatar.extension || props.avatarExtension || 'png',
        size: props.avatar.size || (props.avatar.upload ? 256 : 128)
    }
})

const settings = computed<SettingsOptions | undefined>(() => {
    if (props.settings === false) return
    
    if (props.settings === true || props.settings === undefined) {
        return {
            url: props.settingsURL,
            fields: props.settingsFields || ['image', 'name']
        }
    }
    
    // Remove trailing slash from basePath
    const basePath = props.settings.basePath?.endsWith('/')
        ? props.settings.basePath.slice(0, -1)
        : props.settings.basePath
    
    return {
        url: props.settings.url,
        basePath,
        fields: props.settings.fields || ['image', 'name']
    }
})

const deleteUser = computed<DeleteUserOptions | undefined>(() => {
    if (!props.deleteUser) return
    
    if (props.deleteUser === true) {
        return {
            verification: props.deleteAccountVerification
        }
    }
    
    return props.deleteUser
})

const social = computed<SocialOptions | undefined>(() => {
    if (!props.social && !props.providers) return
    
    if (props.providers) {
        return {
            providers: props.providers,
            signIn: props.signInSocial
        }
    }
    
    return props.social
})

const genericOAuth = computed<GenericOAuthOptions | undefined>(() => {
    if (!props.genericOAuth && !props.otherProviders) return
    
    if (props.otherProviders) {
        return {
            providers: props.otherProviders
        }
    }
    
    return props.genericOAuth
})

const credentials = computed<CredentialsOptions | undefined>(() => {
    if (props.credentials === false) return
    
    if (props.credentials === true) {
        return {
            confirmPassword: props.confirmPassword,
            forgotPassword: props.forgotPassword ?? true,
            passwordValidation: props.passwordValidation,
            rememberMe: props.rememberMe,
            username: props.username
        }
    }
    
    return {
        confirmPassword: props.credentials?.confirmPassword || props.confirmPassword,
        forgotPassword: (props.credentials?.forgotPassword || props.forgotPassword) ?? true,
        passwordValidation: props.credentials?.passwordValidation || props.passwordValidation,
        rememberMe: props.credentials?.rememberMe || props.rememberMe,
        username: props.credentials?.username || props.username
    }
})

const signUp = computed<SignUpOptions | undefined>(() => {
    if (props.signUp === false) return
    
    if (props.signUp === true || props.signUp === undefined) {
        return {
            fields: props.signUpFields || ['name']
        }
    }
    
    return {
        fields: props.signUp.fields || props.signUpFields || ['name']
    }
})

const organization = computed<OrganizationOptionsContext | undefined>(() => {
    if (!props.organization) return
    
    if (props.organization === true) {
        return {
            customRoles: []
        }
    }
    
    let logo: OrganizationOptionsContext['logo'] | undefined
    
    if (props.organization.logo === true) {
        logo = {
            extension: 'png',
            size: 128
        }
    } else if (props.organization.logo) {
        logo = {
            upload: props.organization.logo.upload,
            extension: props.organization.logo.extension || 'png',
            size: props.organization.logo.size || props.organization.logo.upload ? 256 : 128
        }
    }
    
    return {
        ...props.organization,
        logo,
        customRoles: props.organization.customRoles || []
    }
})

const defaultMutators = computed(() => ({
    deleteApiKey: (params) =>
        authClient.apiKey.delete({
            ...params,
            fetchOptions: { throw: true }
        }),
    deletePasskey: (params) =>
        authClient.passkey.deletePasskey({
            ...params,
            fetchOptions: { throw: true }
        }),
    revokeDeviceSession: (params) =>
        authClient.multiSession.revoke({
            ...params,
            fetchOptions: { throw: true }
        }),
    revokeSession: (params) =>
        authClient.revokeSession({
            ...params,
            fetchOptions: { throw: true }
        }),
    setActiveSession: (params) =>
        authClient.multiSession.setActive({
            ...params,
            fetchOptions: { throw: true }
        }),
    updateUser: (params) =>
        authClient.updateUser({
            ...params,
            fetchOptions: { throw: true }
        }),
    unlinkAccount: (params) =>
        authClient.unlinkAccount({
            ...params,
            fetchOptions: { throw: true }
        })
} as AuthMutators))

const defaultHooks = computed(() => ({
    useSession: authClient.useSession,
    useListAccounts: () =>
        useAuthData({
            queryFn: authClient.listAccounts,
            cacheKey: 'listAccounts'
        }),
    useListDeviceSessions: () =>
        useAuthData({
            queryFn: authClient.multiSession.listDeviceSessions,
            cacheKey: 'listDeviceSessions'
        }),
    useListSessions: () =>
        useAuthData({
            queryFn: authClient.listSessions,
            cacheKey: 'listSessions'
        }),
    useListPasskeys: authClient.useListPasskeys,
    useListApiKeys: () =>
        useAuthData({
            queryFn: authClient.apiKey.list,
            cacheKey: 'listApiKeys'
        }),
    useActiveOrganization: authClient.useActiveOrganization,
    useListOrganizations: authClient.useListOrganizations,
    useHasPermission: (params: Parameters<AuthClient["organization"]["hasPermission"]>[0]) =>
        useAuthData({
            queryFn: () => authClient.organization.hasPermission(params),
            cacheKey: `hasPermission:${JSON.stringify(params)}`
        }),
    useInvitation: (params: Parameters<AuthClient["organization"]["getInvitation"]>[0]) =>
        useAuthData({
            queryFn: () => authClient.organization.getInvitation(params),
            cacheKey: `invitation:${JSON.stringify(params)}`
        })
} as any))

const viewPaths = computed(() => ({ ...authViewPaths, ...props.viewPaths } as AuthViewPaths))
const localization = computed(() => ({ ...authLocalization, ...props.localization } as AuthLocalization))
const hooks = computed(() => ({ ...defaultHooks.value, ...props.hooks } as AuthHooks))
const mutators = computed(() => ({ ...defaultMutators.value, ...props.mutators } as AuthMutators))

// Clean up URLs
const baseURL = computed(() => props.baseURL.endsWith('/') ? props.baseURL.slice(0, -1) : props.baseURL)
const basePath = computed(() => {
    const path = props.basePath.endsWith('/') ? props.basePath.slice(0, -1) : props.basePath
    return path === '/' ? '' : path
})

// Handle error query param
const errorShown = ref(false)
onMounted(() => {
    if (errorShown.value) return
    
    const error = getSearchParam('error')
    if (error) {
        errorShown.value = true
        console.log({ error })
        props.toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }
})

// Provide context
const contextValue = computed<AuthUIContextType>(() => ({
    authClient,
    avatar: avatar.value,
    basePath: basePath.value,
    baseURL: baseURL.value,
    captcha: props.captcha,
    redirectTo: props.redirectTo,
    changeEmail: props.changeEmail,
    credentials: credentials.value,
    deleteUser: deleteUser.value,
    freshAge: props.freshAge,
    genericOAuth: genericOAuth.value,
    hooks: hooks.value,
    mutators: mutators.value,
    localization: localization.value,
    nameRequired: props.nameRequired,
    organization: organization.value,
    settings: settings.value,
    signUp: signUp.value,
    social: social.value,
    toast: props.toast,
    navigate: props.navigate || defaultNavigate,
    replace: props.replace || props.navigate || defaultReplace,
    viewPaths: viewPaths.value,
    Link: props.Link,
    additionalFields: props.additionalFields,
    apiKey: props.apiKey,
    emailVerification: props.emailVerification,
    gravatar: props.gravatar,
    magicLink: props.magicLink,
    emailOTP: props.emailOTP,
    multiSession: props.multiSession,
    oneTap: props.oneTap,
    optimistic: props.optimistic,
    passkey: props.passkey,
    persistClient: props.persistClient,
    twoFactor: props.twoFactor,
    onSessionChange: props.onSessionChange
}))

provide(AuthUIContextKey, contextValue.value)

// Determine which wrapper to use
const captchaWrapper = computed(() => {
    if (props.captcha?.provider === 'google-recaptcha-v3') {
        return RecaptchaV3
    }
    return 'div'
})

// Organization refetcher logic
const { data: sessionData } = hooks.value.useSession()
const { data: activeOrganization, refetch: refetchActiveOrganization } = hooks.value.useActiveOrganization()
const { data: organizations, refetch: refetchListOrganizations } = hooks.value.useListOrganizations()

watchEffect(() => {
    if (!sessionData?.user?.id) return
    if (activeOrganization) refetchActiveOrganization?.()
    if (organizations) refetchListOrganizations?.()
})
</script>