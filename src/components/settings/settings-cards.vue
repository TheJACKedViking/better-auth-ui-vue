<template>
    <div
        :class="cn(
            'flex w-full grow flex-col gap-4 md:flex-row md:gap-12',
            className,
            classNames?.base
        )"
    >
        <div class="flex justify-between gap-2 md:hidden">
            <Label class="font-semibold text-base">
                {{ currentItem?.label }}
            </Label>

            <div>
                <DrawerTrigger @click="isDrawerOpen = true">
                    <button
                        :class="cn(
                            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 has-[>svg]:px-3',
                            classNames?.drawer?.trigger
                        )"
                        data-slot="button"
                    >
                        <MenuIcon :class="cn(classNames?.drawer?.menuIcon)" />
                    </button>
                </DrawerTrigger>
                <Drawer v-model:is-open="isDrawerOpen">
                    <template #content>
                        <DrawerContent :class="cn(classNames?.drawer?.content)">
                            <DrawerHeader>
                                <DrawerTitle class="hidden">
                                    {{ localization.SETTINGS }}
                                </DrawerTitle>
                            </DrawerHeader>
                            <div class="flex flex-col px-4 pb-4">
                                <component
                                    :is="Link"
                                    v-for="item in currentNavigationGroup"
                                    :key="item.view"
                                    :href="`${settings?.basePath || basePath}/${viewPaths[item.view]}`"
                                >
                                    <button
                                        :class="cn(
                                            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground h-11 px-4 py-2 has-[>svg]:px-3 w-full justify-start transition-none',
                                            classNames?.drawer?.menuItem,
                                            currentView === item.view
                                                ? 'font-semibold'
                                                : 'text-foreground/70'
                                        )"
                                        data-slot="button"
                                    >
                                        {{ item.label }}
                                    </button>
                                </component>
                            </div>
                        </DrawerContent>
                    </template>
                </Drawer>
            </div>
        </div>

        <div class="hidden md:block">
            <div
                :class="cn(
                    'flex w-60 flex-col gap-1',
                    classNames?.sidebar?.base
                )"
            >
                <component
                    :is="Link"
                    v-for="item in currentNavigationGroup"
                    :key="item.view"
                    :href="`${settings?.basePath || basePath}/${viewPaths[item.view]}`"
                >
                    <button
                        :class="cn(
                            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground h-11 px-4 py-2 has-[>svg]:px-3 w-full justify-start transition-none',
                            classNames?.sidebar?.button,
                            currentView === item.view
                                ? 'font-semibold'
                                : 'text-foreground/70',
                            currentView === item.view &&
                                classNames?.sidebar?.buttonActive
                        )"
                        data-slot="button"
                    >
                        {{ item.label }}
                    </button>
                </component>
            </div>
        </div>

        <AccountSettingsCards
            v-if="currentView === 'SETTINGS'"
            :class-names="classNames"
            :localization="localization"
        />

        <SecuritySettingsCards
            v-if="currentView === 'SECURITY'"
            :class-names="classNames"
            :localization="localization"
        />

        <div
            v-if="currentView === 'API_KEYS' && apiKey"
            :class="cn('flex w-full flex-col', classNames?.cards)"
        >
            <APIKeysCard
                :class-names="classNames?.card"
                :localization="localization"
            />
        </div>

        <OrganizationSettingsCards
            v-if="currentView === 'ORGANIZATION' && organization"
            :class-names="classNames"
            :localization="localization"
        />

        <div
            v-if="currentView === 'ORGANIZATIONS' && organization"
            :class="cn('flex w-full flex-col', classNames?.cards)"
        >
            <OrganizationsCard
                :class-names="classNames?.card"
                :localization="localization"
            />
        </div>

        <div
            v-if="currentView === 'MEMBERS' && organization"
            :class="cn(
                'flex w-full flex-col gap-4 md:gap-6',
                classNames?.cards
            )"
        >
            <OrganizationMembersCard
                :class-names="classNames?.card"
                :localization="localization"
            />

            <OrganizationInvitationsCard
                :class-names="classNames?.card"
                :localization="localization"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { MenuIcon } from 'lucide-vue-next'
import { settingsViews, type SettingsView, type SettingsCardsClassNames } from '../../lib/settings-constants'

import { useAuthenticate } from '../../composables/use-authenticate'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import { cn, getAuthViewByPath } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import OrganizationInvitationsCard from '../organization/organization-invitations-card.vue'
import OrganizationMembersCard from '../organization/organization-members-card.vue'
import OrganizationSettingsCards from '../organization/organization-settings-cards.vue'
import OrganizationsCard from '../organization/organizations-card.vue'
import AccountSettingsCards from './account-settings-cards.vue'
import APIKeysCard from './api-key/api-keys-card.vue'
import SecuritySettingsCards from './security-settings-cards.vue'
import type { SettingsCardClassNames } from './shared/settings-card.vue'

// Type moved to lib/settings-constants.ts

// Moved to lib/settings-constants.ts

interface NavigationItem {
    view: SettingsView
    label?: string
}

export interface SettingsCardsProps {
    className?: string
    classNames?: SettingsCardsClassNames
    localization?: AuthLocalization
    pathname?: string
    view?: SettingsView
}

const props = defineProps<SettingsCardsProps>()

useAuthenticate()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('SettingsCards must be used within AuthUIProvider')
}

const {
    apiKey,
    basePath,
    localization: contextLocalization,
    organization,
    settings,
    viewPaths,
    Link
} = context

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

// Determine view from pathname if provided
const path = computed(() => props.pathname?.split('/').pop())
const currentView = computed(() =>
    props.view ||
    (getAuthViewByPath(viewPaths, path.value) as SettingsView) ||
    'SETTINGS'
)

// Personal settings group
const personalGroup = computed<NavigationItem[]>(() => {
    const items: NavigationItem[] = [
        {
            view: 'SETTINGS',
            label: localization.value.ACCOUNT
        },
        {
            view: 'SECURITY',
            label: localization.value.SECURITY
        }
    ]
    
    if (apiKey) {
        items.push({
            view: 'API_KEYS',
            label: localization.value.API_KEYS
        })
    }
    
    if (organization) {
        items.push({
            view: 'ORGANIZATIONS',
            label: localization.value.ORGANIZATIONS
        })
    }
    
    return items
})

// Organization settings group
const organizationGroup = computed<NavigationItem[]>(() => {
    const items: NavigationItem[] = []
    
    if (organization) {
        items.push({
            view: 'ORGANIZATION',
            label: localization.value.ORGANIZATION
        })
        
        items.push({
            view: 'MEMBERS',
            label: localization.value.MEMBERS
        })
    }
    
    return items
})

// Determine which group the current view belongs to
const isPersonalView = computed(() => 
    personalGroup.value.some((item) => item.view === currentView.value)
)
const isOrganizationView = computed(() =>
    organizationGroup.value.some((item) => item.view === currentView.value) ||
    currentView.value === 'MEMBERS'
)

// Show navigation for the current group
const currentNavigationGroup = computed(() => 
    isOrganizationView.value ? organizationGroup.value : personalGroup.value
)

// Flatten all items for finding current item
const currentItem = computed(() => 
    currentNavigationGroup.value.find((item) => item.view === currentView.value)
)

const isDrawerOpen = ref(false)
</script>