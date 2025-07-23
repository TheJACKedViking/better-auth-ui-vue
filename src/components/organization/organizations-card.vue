<template>
    <>
        <SettingsCard
            :className="className"
            :classNames="classNames"
            :title="localization.ORGANIZATIONS"
            :description="localization.ORGANIZATIONS_DESCRIPTION"
            :instructions="localization.ORGANIZATIONS_INSTRUCTIONS"
            :actionLabel="localization.CREATE_ORGANIZATION"
            :action="() => createDialogOpen = true"
            :isPending="isPending"
            v-bind="$attrs"
        >
            <CardContent
                v-if="organizations && organizations.length > 0"
                :class="cn('grid gap-4', classNames?.content)"
            >
                <OrganizationCell
                    v-for="organization in organizations"
                    :key="organization.id"
                    :classNames="classNames"
                    :organization="organization"
                    :localization="localization"
                />
            </CardContent>
        </SettingsCard>

        <CreateOrganizationDialog
            v-model:open="createDialogOpen"
            :classNames="classNames"
            :localization="localization"
        />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIsHydrated } from '../../composables/use-hydrated'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn } from '../../lib/utils'
import SettingsCard from '../settings/shared/settings-card.vue'
import CreateOrganizationDialog from './create-organization-dialog.vue'
import OrganizationCell from './organization-cell.vue'
import { CardContent } from '../ui'

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
    hooks: { useListOrganizations },
    localization: contextLocalization
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const isHydrated = useIsHydrated()
const { data: organizations, isPending: organizationsPending } =
    useListOrganizations()

const isPending = computed(() => !isHydrated.value || organizationsPending)

const createDialogOpen = ref(false)
</script>