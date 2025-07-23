<template>
    <>
        <Card :class="cn('flex w-full flex-row items-center p-3 md:p-4', className)">
            <OrganizationView
                :organization="organization"
                :localization="localization"
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        :class="cn(
                            'relative ms-auto',
                            classNames?.button,
                            classNames?.outlineButton
                        )"
                        :disabled="isManagingOrganization"
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        <Loader2Icon v-if="isManagingOrganization" class="animate-spin" />
                        <EllipsisIcon v-else :class="classNames?.icon" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuItem
                        @click="handleManageOrganization"
                        :disabled="isManagingOrganization"
                    >
                        <SettingsIcon :class="classNames?.icon" />
                        {{ localization.MANAGE_ORGANIZATION }}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        @click="isLeaveDialogOpen = true"
                        variant="destructive"
                    >
                        <LogOutIcon :class="classNames?.icon" />
                        {{ localization.LEAVE_ORGANIZATION }}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Card>

        <LeaveOrganizationDialog
            v-model:open="isLeaveDialogOpen"
            :organization="organization"
            :localization="localization"
        />
</template>

<script setup lang="ts">
import type { Organization } from 'better-auth/plugins/organization'
import { EllipsisIcon, Loader2Icon, LogOutIcon, SettingsIcon } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn, getLocalizedError } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardClassNames } from '../settings/shared/settings-card.vue'
import LeaveOrganizationDialog from './leave-organization-dialog.vue'
import OrganizationView from './organization-view.vue'
import { Button, Card, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui'

export interface OrganizationCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    organization: Organization
    localization?: AuthLocalization
}

const props = defineProps<OrganizationCellProps>()

const {
    authClient,
    basePath,
    hooks: { useActiveOrganization },
    localization: contextLocalization,
    settings,
    viewPaths,
    navigate,
    toast
} = useAuthUIContext()

const localization = computed(
    () => ({ ...contextLocalization, ...props.localization })
)

const { data: activeOrganization, refetch: refetchActiveOrganization } =
    useActiveOrganization()
const isLeaveDialogOpen = ref(false)
const isManagingOrganization = ref(false)

const handleManageOrganization = async () => {
    if (activeOrganization?.id === props.organization.id) {
        navigate(
            `${settings?.basePath || basePath}/${viewPaths.ORGANIZATION}`
        )
        return
    }

    isManagingOrganization.value = true

    try {
        await authClient.organization.setActive({
            organizationId: props.organization.id,
            fetchOptions: {
                throw: true
            }
        })

        await refetchActiveOrganization?.()

        navigate(
            `${settings?.basePath || basePath}/${viewPaths.ORGANIZATION}`
        )
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    } finally {
        isManagingOrganization.value = false
    }
}
</script>

<script lang="ts">
export default {
    name: 'OrganizationCell'
}
</script>