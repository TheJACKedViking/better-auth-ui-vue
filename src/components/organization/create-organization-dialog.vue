<template>
    <Dialog :open="open" @update:open="handleOpenChange">
        <DialogContent
            :class="classNames?.dialog?.content"
            @openAutoFocus="(e) => e.preventDefault()"
        >
            <form @submit="onSubmit">
                <DialogHeader :class="classNames?.dialog?.header">
                    <DialogTitle
                        :class="cn('text-lg md:text-xl', classNames?.title)"
                    >
                        {{ localization.CREATE_ORGANIZATION }}
                    </DialogTitle>

                    <DialogDescription
                        :class="cn(
                            'text-xs md:text-sm',
                            classNames?.description
                        )"
                    >
                        {{ localization.ORGANIZATION_NAME_DESCRIPTION }}
                    </DialogDescription>
                </DialogHeader>

                <div class="grid gap-4 py-4">
                    <input
                        ref="fileInputRef"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleFileChange"
                    />

                    <div v-if="organization?.logo" class="space-y-2">
                        <Label>{{ localization.LOGO }}</Label>

                        <div class="flex gap-4">
                            <OrganizationLogo
                                :organization="{ logo: logoData || undefined }"
                                size="xl"
                                :localization="localization"
                            />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        :disabled="uploadingLogo"
                                        variant="outline"
                                        type="button"
                                    >
                                        <UploadCloudIcon />
                                        {{ localization.UPLOAD }}
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent>
                                    <DropdownMenuItem @click="openFileDialog">
                                        <UploadCloudIcon />
                                        {{ localization.UPLOAD }}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        v-if="logoData"
                                        @click="deleteLogo"
                                        variant="destructive"
                                    >
                                        <Trash2Icon />
                                        {{ localization.DELETE }}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                v-if="!logoData"
                                :disabled="uploadingLogo"
                                variant="outline"
                                @click="openFileDialog"
                                type="button"
                            >
                                <Loader2Icon v-if="uploadingLogo" class="animate-spin" />
                                {{ localization.UPLOAD }}
                            </Button>
                        </div>

                        <div v-if="errors.value?.logo" class="text-sm text-destructive">
                            {{ errors.value.logo }}
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label for="name">{{ localization.ORGANIZATION_NAME }}</Label>
                        <Input
                            id="name"
                            v-model="name"
                            type="text"
                            :placeholder="localization.ORGANIZATION_NAME_PLACEHOLDER"
                            :class="{ 'border-destructive': errors.value?.name }"
                        />
                        <div v-if="errors.value?.name" class="text-sm text-destructive">
                            {{ errors.value.name }}
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label for="slug">{{ localization.ORGANIZATION_SLUG }}</Label>
                        <Input
                            id="slug"
                            v-model="slug"
                            type="text"
                            :placeholder="localization.ORGANIZATION_SLUG_PLACEHOLDER"
                            :class="{ 'border-destructive': errors.value?.slug }"
                        />
                        <div v-if="errors.value?.slug" class="text-sm text-destructive">
                            {{ errors.value.slug }}
                        </div>
                    </div>
                </div>

                <DialogFooter :class="classNames?.dialog?.footer">
                    <Button
                        type="button"
                        variant="outline"
                        @click="handleOpenChange(false)"
                        :class="cn(
                            classNames?.button,
                            classNames?.outlineButton
                        )"
                    >
                        {{ localization.CANCEL }}
                    </Button>

                    <Button
                        type="submit"
                        :class="cn(
                            classNames?.button,
                            classNames?.primaryButton
                        )"
                        :disabled="isSubmitting"
                    >
                        <Loader2Icon v-if="isSubmitting" class="animate-spin" />
                        {{ localization.CREATE_ORGANIZATION }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { Loader2Icon, Trash2Icon, UploadCloudIcon } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { fileToBase64, resizeAndCropImage } from '../../lib/image-utils'
import { cn, getLocalizedError } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardClassNames } from '../settings/shared/settings-card.vue'
import OrganizationLogo from './organization-logo.vue'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Input, Label } from '../ui'

export interface CreateOrganizationDialogProps {
    open?: boolean
    className?: string
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
}

const props = defineProps<CreateOrganizationDialogProps>()
const emit = defineEmits<{
    'update:open': [value: boolean]
}>()

const {
    authClient,
    hooks: { useActiveOrganization, useListOrganizations },
    localization: contextLocalization,
    organization,
    toast
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const logoData = ref<string | null>(null)
const uploadingLogo = ref(false)
const fileInputRef = ref<HTMLInputElement>()

const openFileDialog = () => fileInputRef.value?.click()

const { refetch: refetchActiveOrganization } = useActiveOrganization()
const { refetch: refetchOrganizations } = useListOrganizations()

const formSchema = computed(() =>
    toTypedSchema(
        z.object({
            logo: z.string().optional(),
            name: z.string().min(1, {
                message: `${localization.value.ORGANIZATION_NAME} ${localization.value.IS_REQUIRED}`
            }),
            slug: z
                .string()
                .min(1, {
                    message: `${localization.value.ORGANIZATION_SLUG} ${localization.value.IS_REQUIRED}`
                })
                .regex(/^[a-z0-9-]+$/, {
                    message: `${localization.value.ORGANIZATION_SLUG} ${localization.value.IS_INVALID}`
                })
        })
    )
)

const { defineField, handleSubmit, errors, setFieldValue } = useForm({
    validationSchema: formSchema,
    initialValues: {
        logo: '',
        name: '',
        slug: ''
    }
})

const [name] = defineField('name')
const [slug] = defineField('slug')

const isSubmitting = ref(false)

const handleFileChange = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file || !organization?.logo) return

    await handleLogoChange(file)
}

const handleLogoChange = async (file: File) => {
    if (!organization?.logo) return

    uploadingLogo.value = true

    try {
        const resizedFile = await resizeAndCropImage(
            file,
            crypto.randomUUID(),
            organization.logo.size,
            organization.logo.extension
        )

        let image: string | undefined | null

        if (organization?.logo.upload) {
            image = await organization.logo.upload(resizedFile)
        } else {
            image = await fileToBase64(resizedFile)
        }

        logoData.value = image || null
        setFieldValue('logo', image || '')
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }

    uploadingLogo.value = false
}

const deleteLogo = () => {
    logoData.value = null
    setFieldValue('logo', '')
}

const onSubmit = handleSubmit(async (values) => {
    isSubmitting.value = true

    try {
        const org = await authClient.organization.create({
            name: values.name as string,
            slug: values.slug as string,
            logo: values.logo as string | undefined,
            fetchOptions: { throw: true }
        })

        await authClient.organization.setActive({
            organizationId: org.id
        })

        await refetchActiveOrganization?.()
        await refetchOrganizations?.()

        toast({
            variant: 'success',
            message: localization.value.CREATE_ORGANIZATION_SUCCESS
        })

        handleOpenChange(false)
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }

    isSubmitting.value = false
})

const handleOpenChange = (value: boolean) => {
    emit('update:open', value)
}
</script>

<script lang="ts">
export default {
    name: 'CreateOrganizationDialog'
}
</script>