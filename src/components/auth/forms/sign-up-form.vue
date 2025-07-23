<template>
    <form
        @submit="onSubmit"
        :class="cn('grid w-full gap-6', className, classNames?.base)"
        novalidate
    >
        <!-- Avatar Upload Field -->
        <div v-if="signUpFields?.includes('image') && avatar" class="space-y-2">
            <input
                ref="fileInputRef"
                accept="image/*"
                :disabled="uploadingAvatar"
                hidden
                type="file"
                @change="handleFileChange"
            />
            
            <label :class="classNames?.label">{{ localization.AVATAR }}</label>
            
            <div class="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <button
                            class="size-fit rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9"
                            type="button"
                            data-slot="button"
                        >
                            <UserAvatar
                                :is-pending="uploadingAvatar"
                                class="size-16"
                                :user="avatarImage ? {
                                    name: nameValue,
                                    email: emailValue,
                                    image: avatarImage
                                } : null"
                                :localization="localization"
                            />
                        </button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent
                        align="start"
                        @close-auto-focus="(e) => e.preventDefault()"
                    >
                        <DropdownMenuItem
                            @click="openFileDialog"
                            :disabled="uploadingAvatar"
                        >
                            <UploadCloudIcon />
                            {{ localization.UPLOAD_AVATAR }}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                            v-if="avatarImage"
                            @click="handleDeleteAvatar"
                            :disabled="uploadingAvatar"
                            variant="destructive"
                        >
                            <Trash2Icon />
                            {{ localization.DELETE_AVATAR }}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                
                <button
                    type="button"
                    :class="cn(
                        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3',
                        classNames?.button,
                        classNames?.outlineButton
                    )"
                    @click="openFileDialog"
                    :disabled="uploadingAvatar"
                    data-slot="button"
                >
                    <Loader2 v-if="uploadingAvatar" class="animate-spin" />
                    {{ localization.UPLOAD }}
                </button>
            </div>
            <span v-if="errors.value?.image" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.image }}
            </span>
        </div>

        <!-- Name Field -->
        <div v-if="signUpFields?.includes('name')" class="space-y-2">
            <label for="name" :class="classNames?.label">
                {{ localization.NAME }}
            </label>
            <input
                v-bind="nameField"
                id="name"
                v-model="name"
                type="text"
                :class="cn(
                    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                    classNames?.input
                )"
                :placeholder="localization.NAME_PLACEHOLDER"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.value?.name"
                data-slot="input"
            />
            <span v-if="errors.value?.name" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.name }}
            </span>
        </div>

        <!-- Username Field -->
        <div v-if="usernameEnabled" class="space-y-2">
            <label for="username" :class="classNames?.label">
                {{ localization.USERNAME }}
            </label>
            <input
                v-bind="usernameField"
                id="username"
                v-model="username"
                type="text"
                :class="cn(
                    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                    classNames?.input
                )"
                :placeholder="localization.USERNAME_PLACEHOLDER"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.value?.username"
                data-slot="input"
            />
            <span v-if="errors.value?.username" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.username }}
            </span>
        </div>

        <!-- Email Field -->
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

        <!-- Password Field -->
        <div class="space-y-2">
            <label for="password" :class="classNames?.label">
                {{ localization.PASSWORD }}
            </label>
            <PasswordInput
                v-bind="passwordField"
                id="password"
                v-model="passwordValue"
                autocomplete="new-password"
                :class="classNames?.input"
                :placeholder="localization.PASSWORD_PLACEHOLDER"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.value?.password"
                enable-toggle
            />
            <span v-if="errors.value?.password" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.password }}
            </span>
        </div>

        <!-- Confirm Password Field -->
        <div v-if="confirmPasswordEnabled" class="space-y-2">
            <label for="confirmPassword" :class="classNames?.label">
                {{ localization.CONFIRM_PASSWORD }}
            </label>
            <PasswordInput
                v-bind="confirmPasswordField"
                id="confirmPassword"
                v-model="confirmPasswordValue"
                autocomplete="new-password"
                :class="classNames?.input"
                :placeholder="localization.CONFIRM_PASSWORD_PLACEHOLDER"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.value?.confirmPassword"
                enable-toggle
            />
            <span v-if="errors.value?.confirmPassword" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                {{ errors.value?.confirmPassword }}
            </span>
        </div>

        <!-- Additional Fields -->
        <template v-for="field in additionalFieldNames" :key="field">
            <div v-if="additionalFields?.[field]?.type === 'boolean'" class="flex items-top space-x-2">
                <input
                    :id="field"
                    v-model="additionalFieldValues[field]"
                    type="checkbox"
                    :class="cn(
                        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                        classNames?.checkbox
                    )"
                    :disabled="isSubmitting"
                />
                <label
                    :for="field"
                    :class="classNames?.label"
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {{ additionalFields?.[field]?.label }}
                </label>
                <span v-if="errors.value?.[field]" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                    {{ errors.value?.[field] }}
                </span>
            </div>
            
            <div v-else class="space-y-2">
                <label :for="field" :class="classNames?.label">
                    {{ additionalFields?.[field]?.label }}
                </label>
                <input
                    :id="field"
                    v-model="additionalFieldValues[field]"
                    :type="additionalFields?.[field]?.type === 'number' ? 'number' : 'text'"
                    :class="cn(
                        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                        classNames?.input
                    )"
                    :placeholder="additionalFields?.[field]?.placeholder || String(additionalFields?.[field]?.label || '')"
                    :disabled="isSubmitting"
                    :aria-invalid="!!errors.value?.[field]"
                    data-slot="input"
                />
                <span v-if="errors.value?.[field]" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
                    {{ errors.value?.[field] }}
                </span>
            </div>
        </template>

        <Captcha
            ref="captchaRef"
            :localization="localization"
            action="/sign-up/email"
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
            <span v-else>{{ localization.SIGN_UP_ACTION }}</span>
        </button>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, reactive } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { BetterFetchOption } from '@better-fetch/fetch'
import { Loader2, UploadCloudIcon, Trash2Icon } from 'lucide-vue-next'

import { useCaptcha } from '../../../composables/use-captcha'
import { useIsHydrated } from '../../../composables/use-hydrated'
import { useOnSuccessTransition } from '../../../composables/use-success-transition'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { fileToBase64, resizeAndCropImage } from '../../../lib/image-utils'
import {
    cn,
    getLocalizedError,
    getPasswordSchema,
    getSearchParam
} from '../../../lib/utils'
import type { AuthLocalization } from '../../../localization/auth-localization'
import type { PasswordValidation } from '../../../types/password-validation'
import Captcha from '../../captcha/captcha.vue'
import PasswordInput from '../../password-input.vue'
import UserAvatar from '../../user-avatar.vue'
import DropdownMenu from '../../ui/dropdown-menu.vue'
import DropdownMenuTrigger from '../../ui/dropdown-menu-trigger.vue'
import DropdownMenuContent from '../../ui/dropdown-menu-content.vue'
import DropdownMenuItem from '../../ui/dropdown-menu-item.vue'
import type { AuthFormClassNames } from '../auth-form.vue'

export interface SignUpFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
    passwordValidation?: PasswordValidation
}

const props = defineProps<SignUpFormProps>()
const emit = defineEmits<{
    'update:isSubmitting': [value: boolean]
}>()

const isHydrated = useIsHydrated()
const { captchaRef, getCaptchaHeaders } = useCaptcha({ 
    localization: props.localization
})

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('SignUpForm must be used within AuthUIProvider')
}

const {
    additionalFields,
    authClient,
    basePath,
    baseURL,
    credentials,
    emailVerification,
    localization: contextLocalization,
    nameRequired,
    persistClient,
    redirectTo: contextRedirectTo,
    signUp: signUpOptions,
    viewPaths,
    navigate,
    toast,
    avatar
} = context

const confirmPasswordEnabled = credentials?.confirmPassword
const usernameEnabled = credentials?.username
const contextPasswordValidation = credentials?.passwordValidation
const signUpFields = signUpOptions?.fields

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))
const passwordValidation = computed(() => ({ ...contextPasswordValidation, ...props.passwordValidation }))

// Avatar upload state
const fileInputRef = ref<HTMLInputElement>()
const avatarImage = ref<string | null>(null)
const uploadingAvatar = ref(false)

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

const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo: props.redirectTo
})

// Build schema dynamically
const buildSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {
        email: z
            .string()
            .min(1, {
                message: `${localization.value.EMAIL} ${localization.value.IS_REQUIRED}`
            })
            .email({
                message: `${localization.value.EMAIL} ${localization.value.IS_INVALID}`
            }),
        password: getPasswordSchema(passwordValidation.value, localization.value)
    }

    if (confirmPasswordEnabled) {
        schemaFields.confirmPassword = getPasswordSchema(passwordValidation.value, {
            PASSWORD_REQUIRED: localization.value.CONFIRM_PASSWORD_REQUIRED,
            PASSWORD_TOO_SHORT: localization.value.PASSWORD_TOO_SHORT,
            PASSWORD_TOO_LONG: localization.value.PASSWORD_TOO_LONG,
            INVALID_PASSWORD: localization.value.INVALID_PASSWORD
        })
    }

    if (signUpFields?.includes('name')) {
        schemaFields.name = nameRequired
            ? z.string().min(1, {
                  message: `${localization.value.NAME} ${localization.value.IS_REQUIRED}`
              })
            : z.string().optional()
    }

    if (usernameEnabled) {
        schemaFields.username = z.string().min(1, {
            message: `${localization.value.USERNAME} ${localization.value.IS_REQUIRED}`
        })
    }

    if (signUpFields?.includes('image') && avatar) {
        schemaFields.image = z.string().optional()
    }

    // Add additional fields
    if (signUpFields) {
        for (const field of signUpFields) {
            if (field === 'name' || field === 'image') continue
            const additionalField = additionalFields?.[field]
            if (!additionalField) continue

            let fieldSchema: z.ZodTypeAny

            if (additionalField.type === 'number') {
                fieldSchema = additionalField.required
                    ? z.preprocess(
                          (val) => (!val ? undefined : Number(val)),
                          z.number({
                              required_error: `${additionalField.label} ${localization.value.IS_REQUIRED}`,
                              invalid_type_error: `${additionalField.label} ${localization.value.IS_INVALID}`
                          })
                      )
                    : z.coerce
                          .number({
                              invalid_type_error: `${additionalField.label} ${localization.value.IS_INVALID}`
                          })
                          .optional()
            } else if (additionalField.type === 'boolean') {
                fieldSchema = additionalField.required
                    ? z.coerce
                          .boolean({
                              required_error: `${additionalField.label} ${localization.value.IS_REQUIRED}`,
                              invalid_type_error: `${additionalField.label} ${localization.value.IS_INVALID}`
                          })
                          .refine((val) => val === true, {
                              message: `${additionalField.label} ${localization.value.IS_REQUIRED}`
                          })
                    : z.coerce
                          .boolean({
                              invalid_type_error: `${additionalField.label} ${localization.value.IS_INVALID}`
                          })
                          .optional()
            } else {
                fieldSchema = additionalField.required
                    ? z
                          .string()
                          .min(
                              1,
                              `${additionalField.label} ${localization.value.IS_REQUIRED}`
                          )
                    : z.string().optional()
            }

            schemaFields[field] = fieldSchema
        }
    }

    return z.object(schemaFields).refine(
        (data) => {
            if (!confirmPasswordEnabled) return true
            return data.password === data.confirmPassword
        },
        {
            message: localization.value.PASSWORDS_DO_NOT_MATCH!,
            path: ['confirmPassword']
        }
    )
}

const formSchema = computed(() => toTypedSchema(buildSchema()))

// Build initial values
const buildInitialValues = () => {
    const values: Record<string, unknown> = {
        email: '',
        password: '',
        ...(confirmPasswordEnabled && { confirmPassword: '' }),
        ...(signUpFields?.includes('name') ? { name: '' } : {}),
        ...(usernameEnabled ? { username: '' } : {}),
        ...(signUpFields?.includes('image') && avatar ? { image: '' } : {})
    }

    if (signUpFields) {
        for (const field of signUpFields) {
            if (field === 'name' || field === 'image') continue
            const additionalField = additionalFields?.[field]
            if (!additionalField) continue
            values[field] = additionalField.type === 'boolean' ? false : ''
        }
    }

    return values
}

// Setup form
const { handleSubmit, defineField, errors, resetField, isSubmitting: formIsSubmitting, setFieldError, setFieldValue, values } = useForm({
    validationSchema: formSchema.value,
    initialValues: buildInitialValues()
})

// Define fields
const [email, emailField] = defineField('email')
const [password, passwordField] = defineField('password')
const [confirmPassword, confirmPasswordField] = defineField('confirmPassword')
const [name, nameField] = defineField('name')
const [username, usernameField] = defineField('username')
const [image, imageField] = defineField('image')

// Type helpers for template usage
const emailValue = computed<string>(() => String(email.value || ''))
const nameValue = computed<string>(() => String(name.value || ''))

// Type helpers for password fields
const passwordValue = computed({
    get: () => password.value as string,
    set: (val) => { password.value = val }
})
const confirmPasswordValue = computed({
    get: () => confirmPassword.value as string,
    set: (val) => { confirmPassword.value = val }
})

// Additional fields handling
const additionalFieldNames = computed(() => 
    signUpFields?.filter((field: string) => field !== 'name' && field !== 'image' && additionalFields?.[field]) || []
)

const additionalFieldValues = reactive<Record<string, any>>({})

// Initialize additional field values
additionalFieldNames.value.forEach((field: string) => {
    const additionalField = additionalFields?.[field]
    if (additionalField) {
        additionalFieldValues[field] = additionalField.type === 'boolean' ? false : ''
    }
})

const isSubmitting = computed(() => 
    props.isSubmitting || formIsSubmitting.value || transitionPending.value
)

// Emit isSubmitting changes
watch(isSubmitting, (value) => {
    emit('update:isSubmitting', value)
})

// Avatar handling
const handleAvatarChange = async (file: File) => {
    if (!avatar) return

    uploadingAvatar.value = true

    try {
        const resizedFile = await resizeAndCropImage(
            file,
            crypto.randomUUID(),
            avatar.size,
            avatar.extension
        )

        let imageResult: string | undefined | null

        if (avatar.upload) {
            imageResult = await avatar.upload(resizedFile)
        } else {
            imageResult = await fileToBase64(resizedFile)
        }

        if (imageResult) {
            avatarImage.value = imageResult
            setFieldValue('image', imageResult)
        } else {
            avatarImage.value = null
            setFieldValue('image', '')
        }
    } catch (error) {
        console.error(error)
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }

    uploadingAvatar.value = false
}

const handleDeleteAvatar = () => {
    avatarImage.value = null
    setFieldValue('image', '')
}

const openFileDialog = () => fileInputRef.value?.click()

const handleFileChange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.item(0)
    if (file) handleAvatarChange(file)
    ;(event.target as HTMLInputElement).value = ''
}

// Form submission
const onSubmit = handleSubmit(async (formValues) => {
    try {
        // Include additional field values
        const submitValues = {
            ...formValues,
            ...additionalFieldValues
        }
        
        // Validate additional fields with custom validators
        for (const [field, value] of Object.entries(additionalFieldValues)) {
            const additionalField = additionalFields?.[field]
            if (!additionalField?.validate) continue

            if (
                typeof value === 'string' &&
                !(await additionalField.validate(value))
            ) {
                setFieldError(field, `${additionalField.label} ${localization.value.IS_INVALID}`)
                return
            }
        }

        const fetchOptions: BetterFetchOption = {
            throw: true,
            headers: await getCaptchaHeaders('/sign-up/email')
        }

        const { email, password, name, username, image, confirmPassword, ...additionalValues } = submitValues

        const data = await authClient.signUp.email({
            email,
            password,
            name: name || '',
            ...(username !== undefined && { username }),
            ...(image !== undefined && { image }),
            ...additionalValues,
            callbackURL: getCallbackURL.value,
            fetchOptions
        })

        if ('token' in data && data.token) {
            await onSuccess()
        } else {
            navigate(
                `${basePath}/${viewPaths.SIGN_IN}${window.location.search}`
            )
            toast({
                variant: 'success',
                message: localization.value.SIGN_UP_EMAIL!
            })
        }
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })

        resetField('password')
        resetField('confirmPassword')
    }
})
</script>