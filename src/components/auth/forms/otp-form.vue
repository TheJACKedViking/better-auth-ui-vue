<template>
    <form
        @submit="onSubmit"
        :class="cn('grid w-full gap-6', className, classNames?.base)"
    >
        <div class="space-y-2">
            <label for="code" :class="classNames?.label">
                {{ localization.EMAIL_OTP }}
            </label>
            <div
                :class="cn(
                    'flex items-center gap-2',
                    classNames?.otpInputContainer
                )"
            >
                <InputOTPGroup :otp-separators="otpSeparators">
                    <template v-for="i in 6" :key="i">
                        <InputOTPSlot
                            :index="i - 1"
                            :is-active="codeValue.length === i - 1"
                            :char="codeValue[i - 1] || ''"
                            :has-fake-caret="codeValue.length === i - 1"
                            :class="classNames?.otpInput"
                            @click="() => handleOTPClick(i - 1)"
                        />
                        <InputOTPSeparator 
                            v-if="shouldShowSeparator(i - 1, otpSeparators)"
                        />
                    </template>
                </InputOTPGroup>
                <input
                    v-bind="codeField"
                    ref="hiddenInputRef"
                    type="text"
                    maxlength="6"
                    pattern="[0-9]*"
                    inputmode="numeric"
                    class="sr-only"
                    :disabled="isSubmitting"
                    @input="handleInput"
                    @keydown="handleKeyDown"
                />
            </div>
            <span v-if="errors.value?.code" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.code }}
            </span>
        </div>

        <div class="grid gap-4">
            <button
                type="submit"
                :disabled="isSubmitting"
                :class="cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3',
                    classNames?.button,
                    classNames?.primaryButton
                )"
                data-slot="button"
            >
                <Loader2 v-if="isSubmitting" class="animate-spin" />
                {{ localization.EMAIL_OTP_VERIFY_ACTION }}
            </button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-vue-next'

import { useOnSuccessTransition } from '../../../composables/use-success-transition'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { cn, getLocalizedError } from '../../../lib/utils'
import type { AuthLocalization } from '../../../localization/auth-localization'
import type { AuthFormClassNames } from '../auth-form.vue'
import InputOTPGroup from '../../ui/input-otp-group.vue'
import InputOTPSlot from '../../ui/input-otp-slot.vue'
import InputOTPSeparator from '../../ui/input-otp-separator.vue'

interface Props {
    className?: string
    classNames?: AuthFormClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    otpSeparators?: 0 | 1 | 2
    redirectTo?: string
    email: string
}

const props = withDefaults(defineProps<Props>(), {
    otpSeparators: 0
})

const emit = defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const hiddenInputRef = ref<HTMLInputElement>()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('OTPForm must be used within AuthUIProvider')
}

const {
    authClient,
    localization: contextLocalization,
    toast
} = context

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo: props.redirectTo
})

// Form schema
const formSchema = computed(() => toTypedSchema(
    z.object({
        code: z
            .string()
            .min(1, {
                message: `${localization.value.EMAIL_OTP} ${localization.value.IS_REQUIRED}`
            })
            .min(6, {
                message: `${localization.value.EMAIL_OTP} ${localization.value.IS_INVALID}`
            })
    })
))

// Setup form
const { handleSubmit, defineField, errors, isSubmitting: formIsSubmitting, resetForm } = useForm({
    validationSchema: formSchema.value,
    initialValues: {
        code: ''
    }
})

const [code, codeField] = defineField('code')

// Computed property to ensure proper type for template usage
const codeValue = computed(() => code.value || '')

const isSubmitting = computed(() => 
    props.isSubmitting || formIsSubmitting.value || transitionPending.value
)

// Emit isSubmitting changes
watch(isSubmitting, (value) => {
    emit('update:isSubmitting', value)
})

// Handle OTP input
const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const value = target.value.replace(/[^0-9]/g, '').slice(0, 6)
    code.value = value
    
    if (value.length === 6) {
        handleSubmit(verifyCode)()
    }
}

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !code.value) {
        e.preventDefault()
    }
}

const handleOTPClick = (index: number) => {
    hiddenInputRef.value?.focus()
    // Set cursor position
    const currentLength = code.value?.length || 0
    if (index <= currentLength) {
        hiddenInputRef.value?.setSelectionRange(index, index)
    }
}

const shouldShowSeparator = (index: number, separators: number) => {
    if (separators === 0) return false
    if (separators === 1) return index === 2
    if (separators === 2) return index === 1 || index === 3
    return false
}

// Form submission
async function verifyCode(values: unknown) {
    try {
        const formValues = values as { code: string }
        await authClient.signIn.emailOtp({
            email: props.email,
            otp: formValues.code,
            fetchOptions: { throw: true }
        })

        await onSuccess()
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })

        resetForm()
    }
}

const onSubmit = handleSubmit(verifyCode)
</script>