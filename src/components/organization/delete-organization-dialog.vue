<template>
    <Dialog :open="open" @update:open="handleOpenChange">
        <DialogContent
            :class="cn('sm:max-w-md', classNames?.dialog?.content)"
        >
            <DialogHeader :class="classNames?.dialog?.header">
                <DialogTitle
                    :class="cn('text-lg md:text-xl', classNames?.title)"
                >
                    {{ localization?.DELETE_ORGANIZATION }}
                </DialogTitle>

                <DialogDescription
                    :class="cn(
                        'text-xs md:text-sm',
                        classNames?.description
                    )"
                >
                    {{ localization?.DELETE_ORGANIZATION_DESCRIPTION }}
                </DialogDescription>
            </DialogHeader>

            <Card :class="cn('my-2 flex-row p-4', classNames?.cell)">
                <OrganizationView
                    :organization="activeOrganization"
                    :localization="localization"
                />
            </Card>

            <form
                @submit="onSubmit"
                class="grid gap-6"
            >
                <div class="space-y-2">
                    <Label :class="classNames?.label">
                        {{ localization?.DELETE_ORGANIZATION_INSTRUCTIONS }}
                        <span class="font-bold">
                            {{ activeOrganization?.slug }}
                        </span>
                    </Label>

                    <Input
                        v-model="slug"
                        :placeholder="activeOrganization?.slug"
                        :class="cn(classNames?.input, { 'border-destructive': errors.value?.slug })"
                        autocomplete="off"
                    />

                    <div v-if="errors.value?.slug" class="text-sm text-destructive">
                        {{ errors.value.slug }}
                    </div>
                </div>

                <DialogFooter :class="classNames?.dialog?.footer">
                    <Button
                        type="button"
                        variant="secondary"
                        :class="cn(
                            classNames?.button,
                            classNames?.secondaryButton
                        )"
                        @click="handleOpenChange(false)"
                    >
                        {{ localization.CANCEL }}
                    </Button>

                    <Button
                        :class="cn(
                            classNames?.button,
                            classNames?.destructiveButton
                        )"
                        :disabled="isSubmitting"
                        variant="destructive"
                        type="submit"
                    >
                        <Loader2Icon v-if="isSubmitting" class="animate-spin" />
                        {{ localization?.DELETE_ORGANIZATION }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { Loader2Icon } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn, getLocalizedError } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardClassNames } from '../settings/shared/settings-card.vue'
import OrganizationView from './organization-view.vue'
import { Button, Card, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '../ui'

export interface DeleteOrganizationDialogProps {
    open?: boolean
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
}

const props = defineProps<DeleteOrganizationDialogProps>()
const emit = defineEmits<{
    'update:open': [value: boolean]
}>()

const {
    authClient,
    hooks: { useActiveOrganization, useListOrganizations },
    localization: contextLocalization,
    redirectTo,
    navigate,
    toast
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { data: activeOrganization, refetch: refetchActiveOrganization } =
    useActiveOrganization()
const { refetch: refetchOrganizations } = useListOrganizations()

const formSchema = computed(() => 
    toTypedSchema(
        z.object({
            slug: z
                .string()
                .min(1, { message: localization.value.SLUG_REQUIRED! })
                .refine((val) => val === activeOrganization?.slug, {
                    message: localization.value.SLUG_DOES_NOT_MATCH!
                })
        })
    )
)

const { defineField, handleSubmit, errors } = useForm({
    validationSchema: formSchema,
    initialValues: {
        slug: ''
    }
})

const [slug] = defineField('slug')

const isSubmitting = ref(false)

const handleOpenChange = (value: boolean) => {
    emit('update:open', value)
}

const onSubmit = handleSubmit(async () => {
    if (!activeOrganization) return

    isSubmitting.value = true

    try {
        await authClient.organization.delete({
            organizationId: activeOrganization.id,
            fetchOptions: {
                throw: true
            }
        })

        await refetchOrganizations?.()
        await refetchActiveOrganization?.()

        toast({
            variant: 'success',
            message: localization.value.DELETE_ORGANIZATION_SUCCESS!
        })
        navigate(redirectTo)
        handleOpenChange(false)
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }

    isSubmitting.value = false
})
</script>

<script lang="ts">
export default {
    name: 'DeleteOrganizationDialog'
}
</script>