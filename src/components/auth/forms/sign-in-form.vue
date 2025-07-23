<template>
    <form
        @submit="onSubmit"
        :class="cn('grid w-full gap-6', className, classNames?.base)"
        novalidate
    >
        <div class="space-y-2">
            <label for="email" :class="classNames?.label">
                {{ usernameEnabled ? localization.USERNAME : localization.EMAIL }}
            </label>
            <input
                v-bind="emailField"
                id="email"
                :type="usernameEnabled ? 'text' : 'email'"
                :autocomplete="usernameEnabled ? 'username' : 'email'"
                :class="cn(
                    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                    classNames?.input
                )"
                :placeholder="usernameEnabled ? localization.SIGN_IN_USERNAME_PLACEHOLDER : localization.EMAIL_PLACEHOLDER"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.value?.email"
                data-slot="input"
            />
            <span v-if="errors.value?.email" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.email }}
            </span>
        </div>

        <div class="space-y-2">
            <div class="flex items-center justify-between">
                <label for="password" :class="classNames?.label">
                    {{ localization.PASSWORD }}
                </label>
                <component
                    v-if="credentials?.forgotPassword"
                    :is="Link"
                    :class="cn('text-sm hover:underline', classNames?.forgotPasswordLink)"
                    :href="`${basePath}/${viewPaths.FORGOT_PASSWORD}${isHydrated ? searchParams : ''}`"
                >
                    {{ localization.FORGOT_PASSWORD_LINK }}
                </component>
            </div>
            <PasswordInput
                v-bind="passwordField"
                id="password"
                autocomplete="current-password"
                :class="classNames?.input"
                :placeholder="localization.PASSWORD_PLACEHOLDER"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.value?.password"
            />
            <span v-if="errors.value?.password" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.password }}
            </span>
        </div>

        <div v-if="rememberMeEnabled" class="flex items-top space-x-2">
            <input
                v-bind="rememberMeField"
                id="rememberMe"
                v-model="rememberMe"
                type="checkbox"
                :class="cn(
                    'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                    classNames?.checkbox
                )"
                :disabled="isSubmitting"
            />
            <label
                for="rememberMe"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {{ localization.REMEMBER_ME }}
            </label>
        </div>

        <Captcha
            ref="captchaRef"
            :localization="localization"
            action="/sign-in/email"
        />

        <button
            type="submit"
            :disabled="isSubmitting"
            :class="cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3 w-full',
                classNames?.button,
                classNames?.primaryButton
            )"
            data-slot="button"
        >
            <Loader2 v-if="isSubmitting" class="animate-spin" />
            <span v-else>{{ localization.SIGN_IN_ACTION }}</span>
        </button>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { BetterFetchOption } from '@better-fetch/fetch'
import { Loader2 } from 'lucide-vue-next'

import { useCaptcha } from '../../../composables/use-captcha'
import { useIsHydrated } from '../../../composables/use-hydrated'
import { useOnSuccessTransition } from '../../../composables/use-success-transition'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import {
    cn,
    getLocalizedError,
    getPasswordSchema,
    isValidEmail
} from '../../../lib/utils'
import type { AuthLocalization } from '../../../localization/auth-localization'
import type { PasswordValidation } from '../../../types/password-validation'
import Captcha from '../../captcha/captcha.vue'
import PasswordInput from '../../password-input.vue'
import type { AuthFormClassNames } from '../auth-form.vue'

export interface SignInFormProps {
    className?: string
    classNames?: AuthFormClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
    passwordValidation?: PasswordValidation
}

const props = defineProps<SignInFormProps>()
const emit = defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const isHydrated = useIsHydrated()
const { captchaRef, getCaptchaHeaders } = useCaptcha({ 
    localization: props.localization
})

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('SignInForm must be used within AuthUIProvider')
}

const {
    authClient,
    basePath,
    credentials,
    localization: contextLocalization,
    viewPaths,
    navigate,
    toast,
    Link
} = context

const rememberMeEnabled = credentials?.rememberMe
const usernameEnabled = credentials?.username
const contextPasswordValidation = credentials?.passwordValidation

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))
const passwordValidation = computed(() => ({ ...contextPasswordValidation, ...props.passwordValidation }))

const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo: props.redirectTo
})

// Form schema
const formSchema = computed(() => z.object({
    email: usernameEnabled
        ? z.string().min(1, {
              message: `${localization.value.USERNAME} ${localization.value.IS_REQUIRED}`
          })
        : z
              .string()
              .min(1, {
                  message: `${localization.value.EMAIL} ${localization.value.IS_REQUIRED}`
              })
              .email({
                  message: `${localization.value.EMAIL} ${localization.value.IS_INVALID}`
              }),
    password: getPasswordSchema(passwordValidation.value, localization.value),
    rememberMe: z.boolean().optional()
}))

// Setup form
const { handleSubmit, defineField, errors, resetField, isSubmitting: formIsSubmitting } = useForm({
    validationSchema: toTypedSchema(formSchema.value),
    initialValues: {
        email: '',
        password: '',
        rememberMe: !rememberMeEnabled
    }
})

const [email, emailField] = defineField('email')
const [password, passwordField] = defineField('password')
const [rememberMe, rememberMeField] = defineField('rememberMe')

const isSubmitting = computed(() => 
    props.isSubmitting || formIsSubmitting.value || transitionPending.value
)

const searchParams = computed(() => {
    if (typeof window !== 'undefined') {
        return window.location.search
    }
    return ''
})

// Emit isSubmitting changes
watch(isSubmitting, (value) => {
    emit('update:isSubmitting', value)
})

// Form submission
const onSubmit = handleSubmit(async (values) => {
    try {
        let response: Record<string, unknown> = {}

        if (usernameEnabled && !isValidEmail(values.email)) {
            const fetchOptions: BetterFetchOption = {
                throw: true,
                headers: await getCaptchaHeaders('/sign-in/username')
            }

            response = await authClient.signIn.username({
                username: values.email,
                password: values.password,
                rememberMe: values.rememberMe,
                fetchOptions
            })
        } else {
            const fetchOptions: BetterFetchOption = {
                throw: true,
                headers: await getCaptchaHeaders('/sign-in/email')
            }

            response = await authClient.signIn.email({
                email: values.email,
                password: values.password,
                rememberMe: values.rememberMe,
                fetchOptions
            })
        }

        if (response.twoFactorRedirect) {
            navigate(
                `${basePath}/${viewPaths.TWO_FACTOR}${window.location.search}`
            )
        } else {
            await onSuccess()
        }
    } catch (error) {
        resetField('password')

        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }
})
</script>