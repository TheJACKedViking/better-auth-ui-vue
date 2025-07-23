<template>
    <>
        <SettingsCard
            v-if="isPending || isOwner"
            :className="className"
            :classNames="classNames"
            :actionLabel="localization?.DELETE_ORGANIZATION"
            :description="localization?.DELETE_ORGANIZATION_DESCRIPTION"
            :isPending="isPending"
            :title="localization?.DELETE_ORGANIZATION"
            variant="destructive"
            :action="() => showDialog = true"
        />

        <DeleteOrganizationDialog
            v-model:open="showDialog"
            :classNames="classNames"
            :localization="localization"
        />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import SettingsCard from '../settings/shared/settings-card.vue'
import DeleteOrganizationDialog from './delete-organization-dialog.vue'

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
    hooks: { useActiveOrganization, useSession },
    localization: contextLocalization
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const showDialog = ref(false)

const { data: activeOrganization, isPending: organizationPending } =
    useActiveOrganization()
const { data: sessionData, isPending: sessionPending } = useSession()

const isPending = computed(() => organizationPending || sessionPending)

const membership = computed(() => 
    activeOrganization?.members?.find(
        (member: any) => member.userId === sessionData?.user.id
    )
)
const isOwner = computed(() => membership.value?.role === 'owner')
</script>

<script lang="ts">
export default {
    name: 'DeleteOrganizationCard'
}
</script>