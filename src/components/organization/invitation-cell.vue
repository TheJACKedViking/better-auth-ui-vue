<template>
    <Card
        :class="cn(
            'flex-row items-center p-4',
            className,
            classNames?.cell
        )"
    >
        <div class="flex flex-1 items-center gap-2">
            <UserAvatar
                class="my-0.5"
                :user="{ email: invitation.email }"
                :localization="localization"
            />

            <div class="grid flex-1 text-left leading-tight">
                <span class="truncate font-semibold text-sm">
                    {{ invitation.email }}
                </span>

                <span class="truncate text-muted-foreground text-xs">
                    {{ localization.EXPIRES }}
                    {{ new Date(invitation.expiresAt).toLocaleDateString() }}
                </span>
            </div>
        </div>

        <span class="truncate text-sm opacity-70">{{ roleLabel }}</span>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    :class="cn(
                        'relative ms-auto',
                        classNames?.button,
                        classNames?.outlineButton
                    )"
                    :disabled="isLoading"
                    size="icon"
                    type="button"
                    variant="outline"
                >
                    <Loader2Icon v-if="isLoading" class="animate-spin" />
                    <EllipsisIcon v-else :class="classNames?.icon" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                @closeAutoFocus="(e) => e.preventDefault()"
            >
                <DropdownMenuItem
                    @click="handleCancelInvitation"
                    :disabled="isLoading"
                    variant="destructive"
                >
                    <XIcon :class="classNames?.icon" />
                    {{ localization.CANCEL_INVITATION }}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </Card>
</template>

<script setup lang="ts">
import type { Invitation } from 'better-auth/plugins/organization'
import { EllipsisIcon, Loader2Icon, XIcon } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn, getLocalizedError } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardClassNames } from '../settings/shared/settings-card.vue'
import UserAvatar from '../user-avatar.vue'
import { Button, Card, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui'

export interface InvitationCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    invitation: Invitation
    localization?: AuthLocalization
}

const props = defineProps<InvitationCellProps>()

const {
    authClient,
    organization,
    hooks: { useActiveOrganization },
    localization: contextLocalization,
    toast
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))
const isLoading = ref(false)

const { refetch } = useActiveOrganization()

const builtInRoles = computed(() => [
    { role: 'owner', label: localization.value.OWNER },
    { role: 'admin', label: localization.value.ADMIN },
    { role: 'member', label: localization.value.MEMBER }
])

const roles = computed(() => [...builtInRoles.value, ...(organization?.customRoles || [])])
const role = computed(() => roles.value.find((r) => r.role === props.invitation.role))
const roleLabel = computed(() => role.value?.label || props.invitation.role)

const handleCancelInvitation = async () => {
    isLoading.value = true

    try {
        await authClient.organization.cancelInvitation({
            invitationId: props.invitation.id,
            fetchOptions: { throw: true }
        })

        await refetch?.()

        toast({
            variant: 'success',
            message: localization.value.INVITATION_CANCELLED
        })
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }

    isLoading.value = false
}
</script>

<script lang="ts">
export default {
    name: 'InvitationCell'
}
</script>