<template>
    <SettingsCard
        v-if="!activeOrganization"
        :className="className"
        :classNames="classNames"
        :description="localization.ORGANIZATION_NAME_DESCRIPTION"
        :instructions="localization.ORGANIZATION_NAME_INSTRUCTIONS"
        :isPending="true"
        :title="localization.ORGANIZATION_NAME"
        :actionLabel="localization.SAVE"
        :optimistic="optimistic"
        v-bind="$attrs"
    >
        <CardContent :class="classNames?.content">
            <Skeleton
                :class="cn('h-9 w-full', classNames?.skeleton)"
            />
        </CardContent>
    </SettingsCard>
    <form v-else @submit="onSubmit">
        <SettingsCard
            :className="className"
            :classNames="classNames"
            :description="localization.ORGANIZATION_NAME_DESCRIPTION"
            :instructions="localization.ORGANIZATION_NAME_INSTRUCTIONS"
            :isPending="isPending"
            :title="localization.ORGANIZATION_NAME"
            :actionLabel="localization.SAVE"
            :optimistic="optimistic"
            :disabled="!hasPermission?.success"
            v-bind="$attrs"
        >
            <CardContent :class="classNames?.content">
                <Skeleton
                    v-if="isPending"
                    :class="cn('h-9 w-full', classNames?.skeleton)"
                />
                <div v-else class="space-y-2">
                    <Input
                        v-bind="nameField"
                        :class="cn(classNames?.input, { 'border-destructive': errors.value?.name })"
                        :placeholder="localization.ORGANIZATION_NAME_PLACEHOLDER"
                        :disabled="isSubmitting || !hasPermission?.success"
                    />
                    <div v-if="errors.value?.name" class="text-sm text-destructive">
                        {{ errors.value.name }}
                    </div>
                </div>
            </CardContent>
        </SettingsCard>
    </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn, getLocalizedError } from '../../lib/utils'
import SettingsCard from '../settings/shared/settings-card.vue'
import { CardContent, Input, Skeleton } from '../ui'

// Define props inline to avoid Vue compiler issue
const props = defineProps<{
    className?: string
    classNames?: any
    title?: any
    description?: any
    instructions?: any
    actionLabel?: any
    isSubmitting?: boolean
    disabled?: boolean
    isPending?: boolean
    optimistic?: boolean
    variant?: "default" | "destructive"
    localization?: any
    action?: () => Promise<unknown> | unknown
}>()

const {
    authClient,
    localization: contextLocalization,
    hooks: {
        useActiveOrganization,
        useListOrganizations,
        useHasPermission
    },
    optimistic,
    toast
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { data: activeOrganization, refetch: refetchActiveOrganization } =
    useActiveOrganization()
const { refetch: refetchOrganizations } = useListOrganizations()
const { data: hasPermission, isPending } = useHasPermission({
    permissions: {
        organization: ['update']
    }
})

const formSchema = computed(() => 
    toTypedSchema(
        z.object({
            name: z.string().min(1, {
                message: `${localization.value.ORGANIZATION_NAME} ${localization.value.IS_REQUIRED}`
            })
        })
    )
)

const { defineField, handleSubmit, errors } = useForm({
    validationSchema: formSchema,
    initialValues: {
        name: activeOrganization?.name || ''
    }
})

const [name, nameField] = defineField('name')

const isSubmitting = ref(false)

const onSubmit = handleSubmit(async (values) => {
    if (!activeOrganization) return

    if (activeOrganization.name === values.name) {
        toast({
            variant: 'error',
            message: `${localization.value.ORGANIZATION_NAME} ${localization.value.IS_THE_SAME}`
        })

        return
    }

    isSubmitting.value = true

    try {
        await authClient.organization.update({
            organizationId: activeOrganization.id,
            data: { name: values.name },
            fetchOptions: {
                throw: true
            }
        })

        await refetchActiveOrganization?.()
        await refetchOrganizations?.()

        toast({
            variant: 'success',
            message: `${localization.value.ORGANIZATION_NAME} ${localization.value.UPDATED_SUCCESSFULLY}`
        })
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
    name: 'OrganizationNameCard'
}
</script>