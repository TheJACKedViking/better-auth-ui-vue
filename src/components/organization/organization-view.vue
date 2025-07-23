<template>
    <div
        :class="cn(
            'flex items-center gap-2 truncate',
            className,
            classNames?.base
        )"
    >
        <OrganizationLogo
            :class="cn(size !== 'sm' && 'my-0.5')"
            :classNames="classNames?.avatar"
            :isPending="isPending"
            :localization="localization"
            :organization="organization"
            :size="size"
        />

        <div
            :class="cn(
                'flex flex-col truncate text-left leading-tight',
                classNames?.content
            )"
        >
            <template v-if="isPending">
                <Skeleton
                    :class="cn(
                        'max-w-full',
                        size === 'lg' ? 'h-4.5 w-32' : 'h-3.5 w-24',
                        classNames?.title,
                        classNames?.skeleton
                    )"
                />

                <Skeleton
                    v-if="size !== 'sm'"
                    :class="cn(
                        'mt-1.5 max-w-full',
                        size === 'lg' ? 'h-3.5 w-24' : 'h-3 w-16',
                        classNames?.subtitle,
                        classNames?.skeleton
                    )"
                />
            </template>
            <template v-else>
                <span
                    :class="cn(
                        'truncate font-semibold',
                        size === 'lg' ? 'text-base' : 'text-sm',
                        classNames?.title
                    )"
                >
                    {{ organization?.name || localization?.ORGANIZATION }}
                </span>

                <span
                    v-if="size !== 'sm' && organization?.slug"
                    :class="cn(
                        'truncate opacity-70',
                        size === 'lg' ? 'text-sm' : 'text-xs',
                        classNames?.subtitle
                    )"
                >
                    {{ organization.slug }}
                </span>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Organization } from 'better-auth/plugins/organization'
import { computed } from 'vue'
import { cn } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import OrganizationLogo, { type OrganizationLogoClassNames } from './organization-logo.vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { Skeleton } from '../ui'

export interface OrganizationViewClassNames {
    base?: string
    avatar?: OrganizationLogoClassNames
    content?: string
    title?: string
    subtitle?: string
    skeleton?: string
}

export interface OrganizationViewProps {
    className?: string
    classNames?: OrganizationViewClassNames
    isPending?: boolean
    size?: 'sm' | 'default' | 'lg' | null
    organization?: Organization | null
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
}

const props = defineProps<OrganizationViewProps>()

const { localization: contextLocalization } = useAuthUIContext()

const localization = computed(() => ({
    ...contextLocalization,
    ...props.localization
}))
</script>

<script lang="ts">
export default {
    name: 'OrganizationView'
}
</script>