<template>
    <Dialog :open="open" @update:open="handleOpenChange">
        <DialogContent :class="classNames?.dialog?.content">
            <DialogHeader :class="classNames?.dialog?.header">
                <DialogTitle
                    :class="cn('text-lg md:text-xl', classNames?.title)"
                >
                    {{ localization.INVITE_MEMBER }}
                </DialogTitle>

                <DialogDescription
                    :class="cn(
                        'text-xs md:text-sm',
                        classNames?.description
                    )"
                >
                    {{ localization.INVITE_MEMBER_DESCRIPTION }}
                </DialogDescription>
            </DialogHeader>

            <form
                @submit="onSubmit"
                class="space-y-6"
            >
                <div class="space-y-2">
                    <Label :class="classNames?.label">
                        {{ localization.EMAIL }}
                    </Label>
                    <Input
                        v-model="email"
                        :placeholder="localization.EMAIL_PLACEHOLDER"
                        type="email"
                        :class="cn(classNames?.input, { 'border-destructive': errors.value?.email })"
                    />
                    <div v-if="errors.value?.email" class="text-sm text-destructive">
                        {{ errors.value.email }}
                    </div>
                </div>

                <div class="space-y-2">
                    <Label :class="classNames?.label">
                        {{ localization.ROLE }}
                    </Label>
                    <Select
                        :model-value="role.value"
                        @update:model-value="(val) => role.value = val"
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="availableRole in availableRoles"
                                :key="availableRole.role"
                                :value="availableRole.role"
                            >
                                {{ availableRole.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <div v-if="errors.value?.role" class="text-sm text-destructive">
                        {{ errors.value.role }}
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
                        {{ localization.SEND_INVITATION }}
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
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui'

export interface InviteMemberDialogProps {
    open?: boolean
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
}

const props = defineProps<InviteMemberDialogProps>()
const emit = defineEmits<{
    'update:open': [value: boolean]
}>()

const {
    authClient,
    hooks: { useActiveOrganization, useSession },
    localization: contextLocalization,
    toast,
    organization
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { data: activeOrganization, refetch: refetchActiveOrganization } =
    useActiveOrganization()
const { data: sessionData } = useSession()
const membership = computed(() => 
    activeOrganization?.members?.find(
        (m: any) => m.userId === sessionData?.user.id
    )
)

const builtInRoles = computed(() => [
    { role: 'owner', label: localization.value.OWNER },
    { role: 'admin', label: localization.value.ADMIN },
    { role: 'member', label: localization.value.MEMBER }
] as const)

const roles = computed(() => [...builtInRoles.value, ...(organization?.customRoles || [])])
const availableRoles = computed(() => 
    roles.value.filter(
        (role) => membership.value?.role === 'owner' || role.role !== 'owner'
    )
)

const formSchema = computed(() => 
    toTypedSchema(
        z.object({
            email: z
                .string()
                .min(1, { message: localization.value.EMAIL_REQUIRED })
                .email({
                    message: localization.value.INVALID_EMAIL
                }),
            role: z.string().min(1, {
                message: `${localization.value.ROLE} ${localization.value.IS_REQUIRED}`
            })
        })
    )
)

const { defineField, handleSubmit, errors, resetForm } = useForm({
    validationSchema: formSchema,
    initialValues: {
        email: '',
        role: 'member'
    }
})

const [email] = defineField('email')
const [role] = defineField('role')

const isSubmitting = ref(false)

const handleOpenChange = (value: boolean) => {
    emit('update:open', value)
}

const onSubmit = handleSubmit(async (values) => {
    isSubmitting.value = true

    try {
        await authClient.organization.inviteMember({
            email: values.email,
            role: values.role as 'owner' | 'admin' | 'member',
            organizationId: activeOrganization?.id,
            fetchOptions: { throw: true }
        })

        await refetchActiveOrganization?.()

        handleOpenChange(false)
        resetForm()

        toast({
            variant: 'success',
            message:
                localization.value.SEND_INVITATION_SUCCESS ||
                'Invitation sent successfully'
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
    name: 'InviteMemberDialog'
}
</script>