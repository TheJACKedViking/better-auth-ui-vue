<template>
    <Skeleton
        v-if="isPending"
        :class="cn(
            'shrink-0 rounded-full',
            size === 'sm'
                ? 'size-6'
                : size === 'lg'
                  ? 'size-10'
                  : size === 'xl'
                    ? 'size-12'
                    : 'size-8',
            className,
            classNames?.base,
            classNames?.skeleton
        )"
    />
    <Avatar
        v-else
        :class="cn(
            'bg-muted',
            size === 'sm'
                ? 'size-6'
                : size === 'lg'
                  ? 'size-10'
                  : size === 'xl'
                    ? 'size-12'
                    : 'size-8',
            className,
            classNames?.base
        )"
        v-bind="$attrs"
    >
        <AvatarImage
            :alt="name || localization?.ORGANIZATION"
            :class="classNames?.image"
            :src="src || undefined"
        />
        <AvatarFallback
            :class="cn('text-foreground', classNames?.fallback)"
            :delay-ms="src ? 600 : undefined"
        >
            <BuildingIcon
                :class="cn('size-[50%]', classNames?.fallbackIcon)"
            />
        </AvatarFallback>
    </Avatar>
</template>

<script setup lang="ts">
import type { Organization } from 'better-auth/plugins/organization'
import { Building as BuildingIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { cn } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { Avatar, AvatarFallback, AvatarImage, Skeleton } from '../ui'

export interface OrganizationLogoClassNames {
    base?: string
    image?: string
    fallback?: string
    fallbackIcon?: string
    skeleton?: string
}

export interface OrganizationLogoProps {
    className?: string
    classNames?: OrganizationLogoClassNames
    isPending?: boolean
    size?: 'sm' | 'default' | 'lg' | 'xl' | null
    organization?: Partial<Organization> | null
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
}

const props = defineProps<OrganizationLogoProps>()

const { localization: contextLocalization } = useAuthUIContext()

const localization = computed(() => ({
    ...contextLocalization,
    ...props.localization
}))

const name = computed(() => props.organization?.name)
const src = computed(() => props.organization?.logo)
</script>

<script lang="ts">
export default {
    name: 'OrganizationLogo'
}
</script>