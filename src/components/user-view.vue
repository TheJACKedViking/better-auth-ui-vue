<template>
    <div
        :class="cn(
            'flex items-center gap-2',
            className,
            classNames?.base
        )"
    >
        <UserAvatar
            :class="cn(size !== 'sm' && 'my-0.5')"
            :class-names="classNames?.avatar"
            :is-pending="isPending"
            :size="size"
            :user="user"
            :localization="localization"
        />

        <div
            :class="cn(
                'grid flex-1 text-left leading-tight',
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
                        size === 'lg' ? 'h-3.5 w-40' : 'h-3 w-32',
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
                    {{ userName }}
                </span>

                <span
                    v-if="showEmail"
                    :class="cn(
                        'truncate opacity-70',
                        size === 'lg' ? 'text-sm' : 'text-xs',
                        classNames?.subtitle
                    )"
                >
                    {{ user?.email }}
                </span>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { AuthUIContextKey } from '../lib/auth-ui-provider'
import { cn } from '../lib/utils'
import type { AuthLocalization } from '../localization/auth-localization'
import type { Profile } from '../types/profile'
import UserAvatar, { type UserAvatarClassNames } from './user-avatar.vue'
import { Skeleton } from './ui'

export interface UserViewClassNames {
    base?: string
    avatar?: UserAvatarClassNames
    content?: string
    title?: string
    subtitle?: string
    skeleton?: string
}

export interface UserViewProps {
    className?: string
    classNames?: UserViewClassNames
    isPending?: boolean
    size?: "sm" | "default" | "lg" | null
    user?: Profile | null
    localization?: AuthLocalization
}

const props = defineProps<UserViewProps>()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('UserView must be used within AuthUIProvider')
}

const { localization: contextLocalization } = context

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const userName = computed(() =>
    props.user?.displayUsername ||
    props.user?.username ||
    props.user?.displayName ||
    props.user?.firstName ||
    props.user?.name ||
    props.user?.fullName ||
    props.user?.email ||
    localization.value?.USER
)

const showEmail = computed(() =>
    !props.user?.isAnonymous &&
    props.size !== 'sm' &&
    (props.user?.name || props.user?.username)
)
</script>

<script lang="ts">
export default {
    name: 'UserView'
}
</script>