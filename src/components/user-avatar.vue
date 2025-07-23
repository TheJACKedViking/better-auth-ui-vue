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
            :alt="avatarName || localization?.USER"
            :class="classNames?.image"
            :src="avatarSrc || undefined"
        />

        <AvatarFallback
            :class="cn(
                'text-foreground uppercase',
                classNames?.fallback
            )"
            :delay-ms="avatarSrc ? 600 : undefined"
        >
            <template v-if="firstTwoCharacters">
                {{ firstTwoCharacters }}
            </template>
            <UserRoundIcon
                v-else
                :class="cn('size-[50%]', classNames?.fallbackIcon)"
            />
        </AvatarFallback>
    </Avatar>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { UserRoundIcon } from 'lucide-vue-next'

import { AuthUIContextKey } from '../lib/auth-ui-provider'
import { getGravatarUrl } from '../lib/gravatar-utils'
import { cn } from '../lib/utils'
import type { AuthLocalization } from '../localization/auth-localization'
import type { Profile } from '../types/profile'
import { Avatar, AvatarFallback, AvatarImage, Skeleton } from './ui'

export interface UserAvatarClassNames {
    base?: string
    image?: string
    fallback?: string
    fallbackIcon?: string
    skeleton?: string
}

export interface UserAvatarProps {
    className?: string
    classNames?: UserAvatarClassNames
    isPending?: boolean
    size?: "sm" | "default" | "lg" | "xl" | null
    user?: Profile | null
    localization?: Partial<AuthLocalization>
}

const props = defineProps<UserAvatarProps>()

defineOptions({
    inheritAttrs: false
})

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('UserAvatar must be used within AuthUIProvider')
}

const { localization: contextLocalization, gravatar } = context

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const avatarName = computed(() =>
    props.user?.displayUsername ||
    props.user?.username ||
    props.user?.displayName ||
    props.user?.firstName ||
    props.user?.name ||
    props.user?.fullName ||
    props.user?.email
)

const userImage = computed(() => 
    props.user?.image || props.user?.avatar || props.user?.avatarUrl
)

// Calculate gravatar URL
const gravatarUrl = computed(() =>
    gravatar && props.user?.email
        ? getGravatarUrl(
              props.user.email,
              gravatar === true ? undefined : gravatar
          )
        : null
)

const avatarSrc = computed(() => gravatar ? gravatarUrl.value : userImage.value)

const firstTwoCharacters = computed(() => avatarName.value?.slice(0, 2))
</script>

<script lang="ts">
export default {
    name: 'UserAvatar'
}
</script>