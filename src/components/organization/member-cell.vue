<template>
    <>
        <Card
            :class="cn(
                'flex-row items-center p-4',
                className,
                classNames?.cell
            )"
        >
            <UserView
                :user="member.user"
                :localization="localization"
                class="flex-1"
            />
            <span class="text-sm opacity-70">{{ roleLabel }}</span>

            <DropdownMenu
                v-if="(member.role !== 'owner' || myRole === 'owner') && !hideActions"
            >
                <DropdownMenuTrigger asChild>
                    <Button
                        :class="cn(
                            'relative ms-auto',
                            classNames?.button,
                            classNames?.outlineButton
                        )"
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        <EllipsisIcon :class="classNames?.icon" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    @closeAutoFocus="(e) => e.preventDefault()"
                >
                    <DropdownMenuItem
                        @click="updateRoleDialogOpen = true"
                    >
                        <UserCogIcon :class="classNames?.icon" />
                        {{ localization?.UPDATE_ROLE }}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        @click="removeDialogOpen = true"
                        variant="destructive"
                    >
                        <UserXIcon :class="classNames?.icon" />
                        {{ localization?.REMOVE_MEMBER }}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Card>

        <RemoveMemberDialog
            v-model:open="removeDialogOpen"
            :member="member"
            :classNames="classNames"
            :localization="localization"
        />

        <UpdateMemberRoleDialog
            v-model:open="updateRoleDialogOpen"
            :member="member"
            :classNames="classNames"
            :localization="localization"
        />
</template>

<script setup lang="ts">
import type { User } from 'better-auth'
import type { Member } from 'better-auth/plugins/organization'
import { EllipsisIcon, UserCogIcon, UserXIcon } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardClassNames } from '../settings/shared/settings-card.vue'
import UserView from '../user-view.vue'
import RemoveMemberDialog from './remove-member-dialog.vue'
import UpdateMemberRoleDialog from './update-member-role-dialog.vue'
import { Button, Card, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui'

export interface MemberCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    member: Member & { user: Partial<User> }
    localization?: AuthLocalization
    hideActions?: boolean
}

const props = defineProps<MemberCellProps>()

const {
    organization,
    hooks: { useActiveOrganization, useSession },
    localization: contextLocalization
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { data: sessionData } = useSession()
const { data: activeOrganization } = useActiveOrganization()
const removeDialogOpen = ref(false)
const updateRoleDialogOpen = ref(false)

const builtInRoles = computed(() => [
    { role: 'owner', label: localization.value.OWNER },
    { role: 'admin', label: localization.value.ADMIN },
    { role: 'member', label: localization.value.MEMBER }
])

const myRole = computed(() => 
    activeOrganization?.members?.find(
        (m: any) => m.user.id === sessionData?.user.id
    )?.role
)
const roles = computed(() => [...builtInRoles.value, ...(organization?.customRoles || [])])
const role = computed(() => roles.value.find((r) => r.role === props.member.role))
const roleLabel = computed(() => role.value?.label || props.member.role)
</script>

<script lang="ts">
export default {
    name: 'MemberCell'
}
</script>