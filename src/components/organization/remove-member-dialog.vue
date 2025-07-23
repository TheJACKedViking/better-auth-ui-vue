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
                    {{ localization.REMOVE_MEMBER }}
                </DialogTitle>

                <DialogDescription
                    :class="cn(
                        'text-xs md:text-sm',
                        classNames?.description
                    )"
                >
                    {{ localization.REMOVE_MEMBER_CONFIRM }}
                </DialogDescription>
            </DialogHeader>

            <MemberCell
                :class="classNames?.cell"
                :member="member"
                :localization="localization"
                :hideActions="true"
            />

            <DialogFooter :class="classNames?.dialog?.footer">
                <Button
                    type="button"
                    variant="outline"
                    @click="handleOpenChange(false)"
                    :class="cn(
                        classNames?.button,
                        classNames?.outlineButton
                    )"
                    :disabled="isRemoving"
                >
                    {{ localization.CANCEL }}
                </Button>

                <Button
                    type="button"
                    variant="destructive"
                    @click="removeMember"
                    :class="cn(
                        classNames?.button,
                        classNames?.destructiveButton
                    )"
                    :disabled="isRemoving"
                >
                    <Loader2Icon v-if="isRemoving" class="animate-spin" />
                    {{ localization.REMOVE_MEMBER }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import type { User } from 'better-auth'
import { Loader2Icon } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import type { Member } from 'better-auth/plugins/organization'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn, getLocalizedError } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardClassNames } from '../settings/shared/settings-card.vue'
import MemberCell from './member-cell.vue'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui'

export interface RemoveMemberDialogProps {
    open?: boolean
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
    member: Member & { user: Partial<User> }
}

const props = defineProps<RemoveMemberDialogProps>()
const emit = defineEmits<{
    'update:open': [value: boolean]
}>()

const {
    authClient,
    hooks: { useActiveOrganization },
    localization: contextLocalization,
    toast,
    organization
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { refetch } = useActiveOrganization()

const builtInRoles = computed(() => [
    { role: 'owner', label: localization.value.OWNER },
    { role: 'admin', label: localization.value.ADMIN },
    { role: 'member', label: localization.value.MEMBER }
])

const roles = computed(() => [...builtInRoles.value, ...(organization?.customRoles || [])])
const role = computed(() => roles.value.find((r) => r.role === props.member.role))

const isRemoving = ref(false)

const handleOpenChange = (value: boolean) => {
    emit('update:open', value)
}

const removeMember = async () => {
    isRemoving.value = true

    try {
        await authClient.organization.removeMember({
            memberIdOrEmail: props.member.id,
            organizationId: props.member.organizationId,
            fetchOptions: {
                throw: true
            }
        })

        toast({
            variant: 'success',
            message: localization.value.REMOVE_MEMBER_SUCCESS
        })

        await refetch?.()
        handleOpenChange(false)
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
    }

    isRemoving.value = false
}
</script>

<script lang="ts">
export default {
    name: 'RemoveMemberDialog'
}
</script>