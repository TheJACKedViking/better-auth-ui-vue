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
                    {{ localization.UPDATE_ROLE }}
                </DialogTitle>

                <DialogDescription
                    :class="cn(
                        'text-xs md:text-sm',
                        classNames?.description
                    )"
                >
                    {{ localization.UPDATE_ROLE_DESCRIPTION }}
                </DialogDescription>
            </DialogHeader>

            <div class="grid gap-6 py-4">
                <MemberCell
                    :class="classNames?.cell"
                    :member="member"
                    :localization="localization"
                    :hideActions="true"
                />

                <Select
                    v-model="selectedRole"
                >
                    <SelectTrigger class="w-full">
                        <SelectValue
                            :placeholder="localization.SELECT_ROLE"
                        />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem
                            v-for="role in availableRoles"
                            :key="role.role"
                            :value="role.role"
                        >
                            {{ role.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
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
                    :disabled="isUpdating"
                >
                    {{ localization.CANCEL }}
                </Button>

                <Button
                    type="button"
                    @click="updateMemberRole"
                    :class="cn(
                        classNames?.button,
                        classNames?.primaryButton
                    )"
                    :disabled="isUpdating"
                >
                    <Loader2Icon v-if="isUpdating" class="animate-spin" />
                    {{ localization.UPDATE_ROLE }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import type { User } from 'better-auth'
import type { Member } from 'better-auth/plugins/organization'
import { Loader2Icon } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn, getLocalizedError } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardClassNames } from '../settings/shared/settings-card.vue'
import MemberCell from './member-cell.vue'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui'

export interface UpdateMemberRoleDialogProps {
    open?: boolean
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
    member: Member & { user: Partial<User> }
}

const props = defineProps<UpdateMemberRoleDialogProps>()
const emit = defineEmits<{
    'update:open': [value: boolean]
}>()

const {
    authClient,
    hooks: { useActiveOrganization, useSession },
    localization: contextLocalization,
    organization,
    toast
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { refetch } = useActiveOrganization()
const { data: sessionData } = useSession()
const { data: activeOrganization } = useActiveOrganization()

const isUpdating = ref(false)
const selectedRole = ref(props.member.role)

const builtInRoles = computed(() => [
    { role: 'owner', label: localization.value.OWNER },
    { role: 'admin', label: localization.value.ADMIN },
    { role: 'member', label: localization.value.MEMBER }
])

const roles = computed(() => [...builtInRoles.value, ...(organization?.customRoles || [])])

const currentUserRole = computed(() => 
    activeOrganization?.members?.find(
        (m: any) => m.user.id === sessionData?.user.id
    )?.role
)

const availableRoles = computed(() => 
    roles.value.filter((role) => {
        if (role.role === 'owner') {
            return currentUserRole.value === 'owner'
        }

        if (role.role === 'admin') {
            return currentUserRole.value === 'owner' || currentUserRole.value === 'admin'
        }

        return true
    })
)

const handleOpenChange = (value: boolean) => {
    emit('update:open', value)
}

const updateMemberRole = async () => {
    if (selectedRole.value === props.member.role) {
        toast({
            variant: 'error',
            message: `${localization.value.ROLE} ${localization.value.IS_THE_SAME}`
        })

        return
    }

    isUpdating.value = true

    try {
        await authClient.organization.updateMemberRole({
            memberId: props.member.id,
            // @ts-ignore - role is a string but the type expects specific values
            role: selectedRole.value,
            organizationId: props.member.organizationId,
            fetchOptions: {
                throw: true
            }
        })

        toast({
            variant: 'success',
            message: localization.value.MEMBER_ROLE_UPDATED
        })

        await refetch?.()
        handleOpenChange(false)
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }

    isUpdating.value = false
}
</script>

<script lang="ts">
export default {
    name: 'UpdateMemberRoleDialog'
}
</script>