<template>
    <form
        @submit="onSubmit"
        :class="cn('grid w-full gap-6', className, classNames?.base)"
        novalidate
    >
        <div class="space-y-2">
            <label for="email" :class="classNames?.label">
                {{ localization.EMAIL }}
            </label>
            <input
                v-bind="emailField"
                id="email"
                v-model="email"
                type="email"
                :class="cn(
                    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                    classNames?.input
                )"
                :placeholder="localization.EMAIL_PLACEHOLDER"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.value?.email"
                data-slot="input"
            />
            <span v-if="errors.value?.email" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.email }}
            </span>
        </div>

        <Captcha
            ref="captchaRef"
            :localization="localization"
            action="/sign-in/magic-link"
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
            <span v-else>{{ localization.MAGIC_LINK_ACTION }}</span>
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
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { cn, getLocalizedError, getSearchParam } from '../../../lib/utils'
import type { AuthLocalization } from '../../../localization/auth-localization'
import Captcha from '../../captcha/captcha.vue'
import type { AuthFormClassNames } from '../auth-form.vue'

export interface MagicLinkFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
}

const props = defineProps<MagicLinkFormProps>()
const emit = defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const isHydrated = useIsHydrated()
const { captchaRef, getCaptchaHeaders } = useCaptcha({ 
    localization: props.localization
})

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('MagicLinkForm must be used within AuthUIProvider')
}

const {
    authClient,
    basePath,
    baseURL,
    persistClient,
    localization: contextLocalization,
    redirectTo: contextRedirectTo,
    viewPaths,
    toast
} = context

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

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

// Form schema
const formSchema = computed(() => toTypedSchema(
    z.object({
        email: z
            .string()
            .min(1, {
                message: `${localization.value.EMAIL} ${localization.value.IS_REQUIRED}`
            })
            .email({
                message: `${localization.value.EMAIL} ${localization.value.IS_INVALID}`
            })
    })
))

// Setup form
const { handleSubmit, defineField, errors, isSubmitting: formIsSubmitting, resetForm } = useForm({
    validationSchema: formSchema,
    initialValues: {
        email: ''
    }
})

const [email, emailField] = defineField('email')

const isSubmitting = computed(() => 
    props.isSubmitting || formIsSubmitting.value
)

// Emit isSubmitting changes
watch(isSubmitting, (value) => {
    emit('update:isSubmitting', value)
})

// Form submission
const onSubmit = handleSubmit(async (values) => {
    try {
        const fetchOptions: BetterFetchOption = {
            throw: true,
            headers: await getCaptchaHeaders('/sign-in/magic-link')
        }

        await authClient.signIn.magicLink({
            email: values.email,
            callbackURL: getCallbackURL.value,
            fetchOptions
        })

        toast({
            variant: 'success',
            message: localization.value.MAGIC_LINK_EMAIL
        })

        resetForm()
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }
})
</script>