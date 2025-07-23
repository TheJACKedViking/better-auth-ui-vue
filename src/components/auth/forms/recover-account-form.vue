<template>
    <form
        @submit="onSubmit"
        :class="cn('grid gap-6', className, classNames?.base)"
    >
        <div class="space-y-2">
            <label for="code" :class="classNames?.label">
                {{ localization.BACKUP_CODE }}
            </label>
            <input
                v-bind="codeField"
                id="code"
                v-model="code"
                type="text"
                :class="cn(
                    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                    classNames?.input
                )"
                :placeholder="localization.BACKUP_CODE_PLACEHOLDER"
                autocomplete="off"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.value?.code"
                data-slot="input"
            />
            <span v-if="errors.value?.code" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.code }}
            </span>
        </div>

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
            <span v-else>{{ localization.RECOVER_ACCOUNT_ACTION }}</span>
        </button>
    </form>
</template>

<script setup lang="ts">
import { computed, inject, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-vue-next'

import { useOnSuccessTransition } from '../../../composables/use-success-transition'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { cn, getLocalizedError } from '../../../lib/utils'
import type { AuthLocalization } from '../../../localization/auth-localization'
import type { AuthFormClassNames } from '../auth-form.vue'

export interface RecoverAccountFormProps {
    className?: string
    classNames?: AuthFormClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
}

const props = defineProps<RecoverAccountFormProps>()
const emit = defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('RecoverAccountForm must be used within AuthUIProvider')
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
        code: z.string().min(1, { message: localization.value.BACKUP_CODE_REQUIRED })
    })
))

// Setup form
const { handleSubmit, defineField, errors, isSubmitting: formIsSubmitting, resetForm } = useForm({
    validationSchema: formSchema,
    initialValues: {
        code: ''
    }
})

const [code, codeField] = defineField('code')

const isSubmitting = computed(() => 
    props.isSubmitting || formIsSubmitting.value || transitionPending.value
)

// Emit isSubmitting changes
watch(isSubmitting, (value) => {
    emit('update:isSubmitting', value)
})

// Form submission
const onSubmit = handleSubmit(async (values) => {
    try {
        await authClient.twoFactor.verifyBackupCode({
            code: values.code,
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
})
</script>