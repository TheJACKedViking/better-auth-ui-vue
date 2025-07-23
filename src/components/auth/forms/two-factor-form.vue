<template>
    <form
        @submit="onSubmit"
        :class="cn('grid w-full gap-6', className, classNames?.base)"
    >
        <div
            v-if="twoFactor?.includes('totp') && totpURI && method === 'totp'"
            class="space-y-3"
        >
            <label :class="classNames?.label">
                {{ localization.TWO_FACTOR_TOTP_LABEL }}
            </label>
            
            <QrcodeVue
                :value="totpURI"
                :size="200"
                level="M"
                :class="cn('border shadow-xs', classNames?.qrCode)"
            />
        </div>

        <template v-if="method !== null">
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <label for="code" :class="classNames?.label">
                        {{ localization.ONE_TIME_PASSWORD }}
                    </label>
                    
                    <component
                        :is="Link"
                        :class="cn('text-sm hover:underline', classNames?.forgotPasswordLink)"
                        :href="`${basePath}/${viewPaths.RECOVER_ACCOUNT}${isHydrated ? searchParams : ''}`"
                    >
                        {{ localization.FORGOT_AUTHENTICATOR }}
                    </component>
                </div>
                
                <InputOTP
                    v-bind="codeField"
                    id="code"
                    :max-length="6"
                    :container-class-name="classNames?.otpInputContainer"
                    :class-name="classNames?.otpInput"
                    :disabled="isSubmitting"
                    @change="handleOTPChange"
                >
                    <OTPInputGroup :otp-separators="otpSeparators" />
                </InputOTP>
                
                <span v-if="errors.value?.code" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                    {{ errors.value?.code }}
                </span>
            </div>

            <div class="flex items-top space-x-2">
                <input
                    v-bind="trustDeviceField"
                    id="trustDevice"
                    v-model="trustDevice"
                    type="checkbox"
                    :class="cn(
                        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                        classNames?.checkbox
                    )"
                    :disabled="isSubmitting"
                />
                <label
                    for="trustDevice"
                    :class="classNames?.label"
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {{ localization.TRUST_DEVICE }}
                </label>
            </div>
        </template>

        <div class="grid gap-4">
            <button
                v-if="method !== null"
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
                {{ localization.TWO_FACTOR_ACTION }}
            </button>

            <button
                v-if="method === 'otp' && twoFactor?.includes('otp')"
                type="button"
                @click="sendOtp"
                :disabled="cooldownSeconds > 0 || isSendingOtp || isSubmitting"
                :class="cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3',
                    classNames?.button,
                    classNames?.outlineButton
                )"
                data-slot="button"
            >
                <Loader2 v-if="isSendingOtp" class="animate-spin" />
                <SendIcon v-else :class="classNames?.icon" />
                {{ localization.RESEND_CODE }}
                <span v-if="cooldownSeconds > 0">
                    ({{ cooldownSeconds }})
                </span>
            </button>

            <button
                v-if="method !== 'otp' && twoFactor?.includes('otp')"
                type="button"
                @click="setMethod('otp')"
                :disabled="isSubmitting"
                :class="cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 h-9 px-4 py-2 has-[>svg]:px-3',
                    classNames?.button,
                    classNames?.secondaryButton
                )"
                data-slot="button"
            >
                <SendIcon :class="classNames?.icon" />
                {{ localization.SEND_VERIFICATION_CODE }}
            </button>

            <button
                v-if="method !== 'totp' && twoFactor?.includes('totp')"
                type="button"
                @click="setMethod('totp')"
                :disabled="isSubmitting"
                :class="cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 h-9 px-4 py-2 has-[>svg]:px-3',
                    classNames?.button,
                    classNames?.secondaryButton
                )"
                data-slot="button"
            >
                <QrCodeIcon :class="classNames?.icon" />
                {{ localization.CONTINUE_WITH_AUTHENTICATOR }}
            </button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, onUnmounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { BetterFetchError } from '@better-fetch/fetch'
import { Loader2, QrCodeIcon, SendIcon } from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'

import { useIsHydrated } from '../../../composables/use-hydrated'
import { useOnSuccessTransition } from '../../../composables/use-success-transition'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { cn, getLocalizedError, getSearchParam } from '../../../lib/utils'
import type { AuthLocalization } from '../../../localization/auth-localization'
import type { User } from '../../../types/auth-client'
import InputOTP from '../../ui/input-otp.vue'
import OTPInputGroup from '../../ui/input-otp-group.vue'
import type { AuthFormClassNames } from '../auth-form.vue'

export interface TwoFactorFormProps {
    className?: string
    classNames?: AuthFormClassNames
    isSubmitting?: boolean
    localization?: Partial<AuthLocalization>
    otpSeparators?: 0 | 1 | 2
    redirectTo?: string
}

const props = withDefaults(defineProps<TwoFactorFormProps>(), {
    otpSeparators: 0
})

const emit = defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const isHydrated = useIsHydrated()
const totpURI = computed(() => isHydrated.value ? getSearchParam('totpURI') : null)
const initialSendRef = ref(false)

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('TwoFactorForm must be used within AuthUIProvider')
}

const {
    authClient,
    basePath,
    hooks: { useSession },
    localization: contextLocalization,
    twoFactor,
    viewPaths,
    toast,
    Link
} = context

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo: props.redirectTo
})

const { data: sessionData } = useSession()
const isTwoFactorEnabled = computed(() => (sessionData?.user as User)?.twoFactorEnabled)

const method = ref<'totp' | 'otp' | null>(
    twoFactor?.length === 1 ? twoFactor[0] : null
)

const isSendingOtp = ref(false)
const cooldownSeconds = ref(0)

// Form schema
const formSchema = computed(() => toTypedSchema(
    z.object({
        code: z
            .string()
            .min(1, {
                message: `${localization.value.ONE_TIME_PASSWORD} ${localization.value.IS_REQUIRED}`
            })
            .min(6, {
                message: `${localization.value.ONE_TIME_PASSWORD} ${localization.value.IS_INVALID}`
            }),
        trustDevice: z.boolean().optional()
    })
))

// Setup form
const { handleSubmit, defineField, errors, isSubmitting: formIsSubmitting, resetForm } = useForm({
    validationSchema: formSchema.value,
    initialValues: {
        code: '',
        trustDevice: false
    }
})

const [code, codeField] = defineField('code')
const [trustDevice, trustDeviceField] = defineField('trustDevice')

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

// Cooldown timer
let cooldownTimer: NodeJS.Timeout | null = null
watch(cooldownSeconds, (newValue) => {
    if (newValue <= 0) {
        if (cooldownTimer) {
            clearTimeout(cooldownTimer)
            cooldownTimer = null
        }
        return
    }
    
    cooldownTimer = setTimeout(() => {
        cooldownSeconds.value--
    }, 1000)
})

onUnmounted(() => {
    if (cooldownTimer) {
        clearTimeout(cooldownTimer)
    }
})

// Auto-send OTP when method is set to OTP
watch(method, (newMethod) => {
    if (
        newMethod === 'otp' &&
        cooldownSeconds.value <= 0 &&
        !initialSendRef.value
    ) {
        initialSendRef.value = true
        sendOtp()
    }
})

const sendOtp = async () => {
    if (isSendingOtp.value || cooldownSeconds.value > 0) return

    try {
        isSendingOtp.value = true
        await authClient.twoFactor.sendOtp({
            fetchOptions: { throw: true }
        })
        cooldownSeconds.value = 60
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })

        if (
            (error as BetterFetchError).error.code ===
            'INVALID_TWO_FACTOR_COOKIE'
        ) {
            history.back()
        }
    } finally {
        initialSendRef.value = false
        isSendingOtp.value = false
    }
}

const setMethod = (newMethod: 'totp' | 'otp') => {
    method.value = newMethod
}

// Handle OTP auto-submit on complete
const handleOTPChange = (value: string) => {
    if (value.length === 6) {
        handleSubmit(verifyCode)()
    }
}

// Form submission
const verifyCode = async (values: unknown) => {
    try {
        const formValues = values as { code: string; trustDevice?: boolean }
        const verifyMethod =
            method.value === 'totp'
                ? authClient.twoFactor.verifyTotp
                : authClient.twoFactor.verifyOtp

        await verifyMethod({
            code: formValues.code,
            trustDevice: formValues.trustDevice,
            fetchOptions: { throw: true }
        })

        await onSuccess()

        if (sessionData && !isTwoFactorEnabled.value) {
            toast({
                variant: 'success',
                message: localization.value?.TWO_FACTOR_ENABLED
            })
        }
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