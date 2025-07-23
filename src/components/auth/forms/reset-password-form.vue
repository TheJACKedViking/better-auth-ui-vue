<template>
    <form
        @submit="onSubmit"
        :class="cn('grid w-full gap-6', className, classNames?.base)"
        novalidate
    >
        <div v-if="error" class="rounded-md bg-destructive/10 p-3">
            <p :class="cn('text-sm text-destructive', classNames?.error)">
                {{ error }}
            </p>
        </div>

        <div class="space-y-2">
            <label for="newPassword" :class="classNames?.label">
                {{ localization.NEW_PASSWORD || 'New Password' }}
            </label>
            <PasswordInput
                v-bind="newPasswordField"
                id="newPassword"
                v-model="newPasswordValue"
                :class="classNames?.input"
                :placeholder="localization.NEW_PASSWORD_PLACEHOLDER || 'Enter your new password'"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.value?.newPassword"
                enable-toggle
            />
            <span v-if="errors.value?.newPassword" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.newPassword }}
            </span>
        </div>

        <div class="space-y-2">
            <label for="confirmPassword" :class="classNames?.label">
                {{ localization.CONFIRM_PASSWORD || 'Confirm Password' }}
            </label>
            <PasswordInput
                v-bind="confirmPasswordField"
                id="confirmPassword"
                v-model="confirmPasswordValue"
                :class="classNames?.input"
                :placeholder="localization.CONFIRM_PASSWORD_PLACEHOLDER || 'Confirm your new password'"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.value?.confirmPassword"
                enable-toggle
            />
            <span v-if="errors.value?.confirmPassword" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.confirmPassword }}
            </span>
        </div>

        <button
            type="submit"
            :disabled="isSubmitting || !token"
            :class="cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3 w-full',
                classNames?.button,
                classNames?.primaryButton
            )"
            data-slot="button"
        >
            <Loader2 v-if="isSubmitting" class="animate-spin" />
            <span v-else>{{ localization.RESET_PASSWORD_ACTION || 'Save new password' }}</span>
        </button>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-vue-next'

import { useOnSuccessTransition } from '../../../composables/use-success-transition'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import {
    cn,
    getLocalizedError,
    getPasswordSchema,
    getSearchParam
} from '../../../lib/utils'
import type { AuthLocalization } from '../../../localization/auth-localization'
import type { PasswordValidation } from '../../../types/password-validation'
import PasswordInput from '../../password-input.vue'
import type { AuthFormClassNames } from '../auth-form.vue'

export interface ResetPasswordFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
    passwordValidation?: PasswordValidation
}

const props = defineProps<ResetPasswordFormProps>()
const emit = defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('ResetPasswordForm must be used within AuthUIProvider')
}

const {
    authClient,
    basePath,
    credentials,
    localization: contextLocalization,
    redirectTo: contextRedirectTo,
    viewPaths,
    navigate,
    toast
} = context

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))
const passwordValidation = computed(() => ({ 
    ...credentials?.passwordValidation, 
    ...props.passwordValidation 
}))

// Get token from URL
const token = ref<string | null>(null)
const error = ref<string>('')

onMounted(() => {
    token.value = getSearchParam('token')
    if (!token.value) {
        error.value = 'Invalid or expired reset link'
    }
})

const getRedirectTo = computed(() => 
    props.redirectTo || getSearchParam('redirectTo') || contextRedirectTo
)

const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo: getRedirectTo.value
})

// Build schema
const formSchema = computed(() => {
    const schema = z.object({
        newPassword: getPasswordSchema(passwordValidation.value, localization.value),
        confirmPassword: getPasswordSchema(passwordValidation.value, {
            PASSWORD_REQUIRED: localization.value.CONFIRM_PASSWORD_REQUIRED,
            PASSWORD_TOO_SHORT: localization.value.PASSWORD_TOO_SHORT,
            PASSWORD_TOO_LONG: localization.value.PASSWORD_TOO_LONG,
            INVALID_PASSWORD: localization.value.INVALID_PASSWORD
        })
    }).refine(
        (data) => data.newPassword === data.confirmPassword,
        {
            message: localization.value.PASSWORDS_DO_NOT_MATCH!,
            path: ['confirmPassword']
        }
    )

    return toTypedSchema(schema)
})

// Setup form
const { handleSubmit, defineField, errors, isSubmitting: formIsSubmitting } = useForm({
    validationSchema: formSchema.value,
    initialValues: {
        newPassword: '',
        confirmPassword: ''
    }
})

// Define fields
const [newPassword, newPasswordField] = defineField('newPassword')
const [confirmPassword, confirmPasswordField] = defineField('confirmPassword')

// Type helpers for password fields
const newPasswordValue = computed({
    get: () => newPassword.value as string,
    set: (val) => { newPassword.value = val }
})
const confirmPasswordValue = computed({
    get: () => confirmPassword.value as string,
    set: (val) => { confirmPassword.value = val }
})

const isSubmitting = computed(() => 
    props.isSubmitting || formIsSubmitting.value || transitionPending.value
)

// Form submission
const onSubmit = handleSubmit(async (values) => {
    if (!token.value || !authClient.resetPassword) {
        error.value = 'Invalid or expired reset link'
        return
    }

    error.value = ''

    try {
        await authClient.resetPassword({
            newPassword: values.newPassword,
            token: token.value
        })

        toast({
            variant: 'success',
            message: localization.value.RESET_PASSWORD_SUCCESS || 'Password reset successfully'
        })

        // Redirect to sign-in page
        navigate(`${basePath}/${viewPaths.SIGN_IN}`)
    } catch (err) {
        error.value = getLocalizedError({ error: err, localization: localization.value })
    }
})
</script>