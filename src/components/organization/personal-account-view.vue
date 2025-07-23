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
            :classNames="classNames?.avatar"
            :isPending="isPending"
            :localization="localization"
            :size="size"
            :user="user"
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
                    {{ displayName }}
                </span>

                <span
                    v-if="size !== 'sm'"
                    :class="cn(
                        'truncate opacity-70',
                        size === 'lg' ? 'text-sm' : 'text-xs',
                        classNames?.subtitle
                    )"
                >
                    {{ localization?.PERSONAL_ACCOUNT }}
                </span>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn } from '../../lib/utils'
import UserAvatar from '../user-avatar.vue'
import type { UserViewProps } from '../user-view.vue'

const props = defineProps<UserViewProps>()

const { localization: contextLocalization } = useAuthUIContext()

const localization = computed(
    () => ({ ...contextLocalization, ...props.localization })
)

const displayName = computed(() => 
    props.user?.displayUsername ||
    props.user?.username ||
    props.user?.displayName ||
    props.user?.firstName ||
    props.user?.name ||
    props.user?.fullName ||
    props.user?.email ||
    localization.value?.USER
)
</script>