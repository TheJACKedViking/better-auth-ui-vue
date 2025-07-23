<template>
    <Dialog :open="open" @update:open="handleOpenChange">
        <DialogContent
            :class="classNames?.dialog?.content"
            @openAutoFocus="(e) => e.preventDefault()"
        >
            <DialogHeader :class="classNames?.dialog?.header">
                <DialogTitle
                    :class="cn('text-lg md:text-xl', classNames?.title)"
                >
                    {{ localization.LEAVE_ORGANIZATION }}
                </DialogTitle>

                <DialogDescription
                    :class="cn(
                        'text-xs md:text-sm',
                        classNames?.description
                    )"
                >
                    {{ localization.LEAVE_ORGANIZATION_CONFIRM }}
                </DialogDescription>
            </DialogHeader>

            <Card
                :class="cn(
                    'my-2 flex-row p-4',
                    className,
                    classNames?.cell
                )"
            >
                <OrganizationView
                    :organization="organization"
                    :localization="localization"
                />
            </Card>

            <DialogFooter :class="classNames?.dialog?.footer">
                <Button
                    type="button"
                    variant="outline"
                    @click="handleOpenChange(false)"
                    :class="cn(
                        classNames?.button,
                        classNames?.outlineButton
                    )"
                    :disabled="isLeaving"
                >
                    {{ localization.CANCEL }}
                </Button>

                <Button
                    type="button"
                    variant="destructive"
                    @click="handleLeaveOrganization"
                    :class="cn(
                        classNames?.button,
                        classNames?.destructiveButton
                    )"
                    :disabled="isLeaving"
                >
                    <Loader2Icon v-if="isLeaving" class="animate-spin" />
                    {{ localization.LEAVE_ORGANIZATION }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import type { Organization } from 'better-auth/plugins/organization'
import { Loader2Icon } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { getLocalizedError } from '../../lib/utils'
import { cn } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardClassNames } from '../settings/shared/settings-card.vue'
import OrganizationView from './organization-view.vue'
import { Button, Card, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui'

export interface LeaveOrganizationDialogProps {
    open?: boolean
    className?: string
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
    organization: Organization
}

const props = defineProps<LeaveOrganizationDialogProps>()
const emit = defineEmits<{
    'update:open': [value: boolean]
}>()

const {
    authClient,
    hooks: { useActiveOrganization, useListOrganizations },
    localization: contextLocalization,
    toast
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { data: activeOrganization, refetch: refetchActiveOrganization } =
    useActiveOrganization()
const { refetch: refetchOrganizations } = useListOrganizations()

const isLeaving = ref(false)

const handleOpenChange = (value: boolean) => {
    emit('update:open', value)
}

const handleLeaveOrganization = async () => {
    isLeaving.value = true

    try {
        await authClient.organization.leave({
            organizationId: props.organization.id,
            fetchOptions: {
                throw: true
            }
        })

        toast({
            variant: 'success',
            message: localization.value.LEAVE_ORGANIZATION_SUCCESS
        })

        if (activeOrganization?.id === props.organization.id) {
            refetchActiveOrganization?.()
        }

        await refetchOrganizations?.()

        handleOpenChange(false)
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }

    isLeaving.value = false
}
</script>

<script lang="ts">
export default {
    name: 'LeaveOrganizationDialog'
}
</script>