<template>
    <div
        :class="cn(
            'flex w-full flex-col gap-4 md:gap-6',
            className,
            classNames?.cards
        )"
    >
        <OrganizationLogoCard
            v-if="organization?.logo"
            :classNames="classNames?.card"
            :localization="localization"
        />

        <OrganizationNameCard
            :classNames="classNames?.card"
            :localization="localization"
        />

        <OrganizationSlugCard
            :classNames="classNames?.card"
            :localization="localization"
        />

        <DeleteOrganizationCard
            :classNames="classNames?.card"
            :localization="localization"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn } from '../../lib/utils'
import type { SettingsCardsProps } from '../settings/settings-cards.vue'
import DeleteOrganizationCard from './delete-organization-card.vue'
import OrganizationLogoCard from './organization-logo-card.vue'
import OrganizationNameCard from './organization-name-card.vue'
import OrganizationSlugCard from './organization-slug-card.vue'

export type OrganizationSettingsCardsProps = Omit<SettingsCardsProps, 'view'>

const props = defineProps<OrganizationSettingsCardsProps>()

const {
    basePath,
    hooks: { useActiveOrganization },
    organization,
    settings,
    replace,
    viewPaths
} = useAuthUIContext()

const {
    data: activeOrganization,
    isPending: organizationPending,
    isRefetching: organizationFetching
} = useActiveOrganization()

const localization = computed(() => props.localization)

onMounted(() => {
    const checkOrganization = () => {
        if (organizationPending || organizationFetching) return
        if (!activeOrganization)
            replace(`${settings?.basePath || basePath}/${viewPaths.SETTINGS}`)
    }

    const unwatch = watch(
        [activeOrganization, organizationPending, organizationFetching],
        checkOrganization,
        { immediate: true }
    )

    return unwatch
})
</script>