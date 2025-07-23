<template>
    <SettingsCard
        v-if="pendingInvitations?.length"
        :className="className"
        :classNames="classNames"
        :title="localization.PENDING_INVITATIONS"
        :description="localization.PENDING_INVITATIONS_DESCRIPTION"
        :isPending="isPending"
        v-bind="$attrs"
    >
        <CardContent :class="cn('grid gap-4', classNames?.content)">
            <InvitationCell
                v-for="invitation in pendingInvitations"
                :key="invitation.id"
                :classNames="classNames"
                :invitation="invitation"
                :localization="localization"
            />
        </CardContent>
    </SettingsCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn } from '../../lib/utils'
import SettingsCard from '../settings/shared/settings-card.vue'
import InvitationCell from './invitation-cell.vue'
import { CardContent } from '../ui'

// Define props without importing the type
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
    hooks: { useActiveOrganization },
    localization: contextLocalization
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const { data: activeOrganization } = useActiveOrganization()
const invitations = computed(() => activeOrganization?.invitations)

const pendingInvitations = computed(() => 
    invitations.value?.filter(
        (invitation: any) => invitation.status === 'pending'
    )
)

const isPending = computed(() => !activeOrganization)
</script>