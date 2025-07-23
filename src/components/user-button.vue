<template>
    <DropdownMenu>
        <DropdownMenuTrigger
            as-child
            :class="cn(
                size === 'icon' && 'rounded-full',
                classNames?.trigger?.base
            )"
        >
            <slot name="trigger">
                <button
                    v-if="size === 'icon'"
                    :class="cn(
                        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground size-9 rounded-full size-fit'
                    )"
                    data-slot="button"
                >
                    <UserAvatar
                        :key="user?.image || 'no-image'"
                        :is-pending="isPending"
                        :class="cn(className, classNames?.base)"
                        :class-names="classNames?.trigger?.avatar"
                        :user="user"
                        :aria-label="localization.ACCOUNT"
                        :localization="localization"
                    />
                </button>
                <button
                    v-else
                    :class="cn(
                        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3 !p-2 h-fit',
                        className,
                        classNames?.trigger?.base
                    )"
                    :data-slot="'button'"
                    v-bind="$attrs"
                >
                    <UserView
                        :size="size"
                        :user="!(user as User)?.isAnonymous ? user : null"
                        :is-pending="isPending"
                        :class-names="classNames?.trigger?.user"
                        :localization="localization"
                    />

                    <ChevronsUpDown class="ml-auto" />
                </button>
            </slot>
        </DropdownMenuTrigger>

        <DropdownMenuContent
            :class="cn(
                'w-[--radix-dropdown-menu-trigger-width] min-w-56 max-w-64',
                classNames?.content?.base
            )"
            :align="align"
            :on-close-auto-focus="(e: Event) => e.preventDefault()"
        >
            <div :class="cn('p-2', classNames?.content?.menuItem)">
                <UserView
                    v-if="(user && !(user as User).isAnonymous) || isPending"
                    :user="user"
                    :is-pending="isPending"
                    :class-names="classNames?.content?.user"
                    :localization="localization"
                />
                <div v-else class="-my-1 text-muted-foreground text-xs">
                    {{ localization.ACCOUNT }}
                </div>
            </div>

            <DropdownMenuSeparator :class="classNames?.content?.separator" />

            <template
                v-for="(link, index) in additionalLinks"
                :key="index"
            >
                <template
                    v-if="link.signedIn === undefined ||
                        (link.signedIn && !!sessionData) ||
                        (!link.signedIn && !sessionData)"
                >
                    <component :is="Link" :href="link.href">
                        <DropdownMenuItem :class="classNames?.content?.menuItem">
                            <component :is="link.icon" v-if="link.icon" />
                            {{ link.label }}
                        </DropdownMenuItem>
                    </component>
                    <DropdownMenuSeparator
                        v-if="link.separator"
                        :class="classNames?.content?.separator"
                    />
                </template>
            </template>

            <template v-if="!user || (user as User).isAnonymous">
                <component :is="Link" :href="`${basePath}/${viewPaths.SIGN_IN}`">
                    <DropdownMenuItem :class="classNames?.content?.menuItem">
                        <LogInIcon />
                        {{ localization.SIGN_IN }}
                    </DropdownMenuItem>
                </component>

                <component
                    v-if="signUp"
                    :is="Link"
                    :href="`${basePath}/${viewPaths.SIGN_UP}`"
                >
                    <DropdownMenuItem :class="classNames?.content?.menuItem">
                        <UserRoundPlus />
                        {{ localization.SIGN_UP }}
                    </DropdownMenuItem>
                </component>
            </template>
            <template v-else>
                <component
                    v-if="!disableDefaultLinks && settings"
                    :is="Link"
                    :href="settings.url || `${settings.basePath || basePath}/${viewPaths.SETTINGS}`"
                >
                    <DropdownMenuItem :class="classNames?.content?.menuItem">
                        <SettingsIcon />
                        {{ localization.SETTINGS }}
                    </DropdownMenuItem>
                </component>

                <component :is="Link" :href="`${basePath}/${viewPaths.SIGN_OUT}`">
                    <DropdownMenuItem :class="classNames?.content?.menuItem">
                        <LogOutIcon />
                        {{ localization.SIGN_OUT }}
                    </DropdownMenuItem>
                </component>
            </template>

            <template v-if="user && multiSession">
                <DropdownMenuSeparator :class="classNames?.content?.separator" />

                <template v-if="!deviceSessions && deviceSessionsPending">
                    <DropdownMenuItem disabled :class="classNames?.content?.menuItem">
                        <UserView
                            :is-pending="true"
                            :class-names="classNames?.content?.user"
                        />
                    </DropdownMenuItem>

                    <DropdownMenuSeparator :class="classNames?.content?.separator" />
                </template>

                <template
                    v-for="session in filteredDeviceSessions"
                    :key="session.session.id"
                >
                    <DropdownMenuItem
                        :class="classNames?.content?.menuItem"
                        @click="() => switchAccount(session.session.token)"
                    >
                        <UserView
                            :user="session.user"
                            :class-names="classNames?.content?.user"
                        />
                    </DropdownMenuItem>

                    <DropdownMenuSeparator :class="classNames?.content?.separator" />
                </template>

                <component :is="Link" :href="`${basePath}/${viewPaths.SIGN_IN}`">
                    <DropdownMenuItem :class="classNames?.content?.menuItem">
                        <PlusCircleIcon />
                        {{ localization.ADD_ACCOUNT }}
                    </DropdownMenuItem>
                </component>
            </template>
        </DropdownMenuContent>
    </DropdownMenu>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted } from 'vue'
import {
    ChevronsUpDown,
    LogInIcon,
    LogOutIcon,
    PlusCircleIcon,
    SettingsIcon,
    UserRoundPlus
} from 'lucide-vue-next'

import { useIsHydrated } from '../composables/use-hydrated'
import { AuthUIContextKey } from '../lib/auth-ui-provider'
import { getLocalizedError } from '../lib/utils'
import { cn } from '../lib/utils'
import type { AuthLocalization } from '../localization/auth-localization'
import type { AnyAuthClient } from '../types/any-auth-client'
import type { User } from '../types/auth-client'
import UserAvatar, { type UserAvatarClassNames } from './user-avatar.vue'
import UserView, { type UserViewClassNames } from './user-view.vue'

export interface UserButtonClassNames {
    base?: string
    skeleton?: string
    trigger?: {
        base?: string
        avatar?: UserAvatarClassNames
        user?: UserViewClassNames
        skeleton?: string
    }
    content?: {
        base?: string
        user?: UserViewClassNames
        avatar?: UserAvatarClassNames
        menuItem?: string
        separator?: string
    }
}

export interface UserButtonProps {
    className?: string
    classNames?: UserButtonClassNames
    align?: "center" | "start" | "end"
    additionalLinks?: {
        href: string
        icon?: any
        label: string
        signedIn?: boolean
        separator?: boolean
    }[]
    trigger?: any
    disableDefaultLinks?: boolean
    localization?: AuthLocalization
    size?: "default" | "sm" | "lg" | "icon" | null
}

const props = defineProps<UserButtonProps>()

defineOptions({
    inheritAttrs: false
})

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('UserButton must be used within AuthUIProvider')
}

const {
    basePath,
    hooks: { useSession, useListDeviceSessions },
    mutators: { setActiveSession },
    localization: contextLocalization,
    multiSession,
    settings,
    signUp,
    toast,
    viewPaths,
    onSessionChange,
    Link
} = context

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

// Device sessions for multi-session support
let deviceSessions = ref<AnyAuthClient["$Infer"]["Session"][] | undefined | null>(null)
let deviceSessionsPending = ref(false)

if (multiSession && useListDeviceSessions) {
    const { data, isPending } = useListDeviceSessions()
    deviceSessions.value = data
    deviceSessionsPending.value = isPending
}

const { data: sessionData, isPending: sessionPending } = useSession()
const user = computed(() => sessionData?.user)
const activeSessionPending = ref(false)

const isHydrated = useIsHydrated()
const isPending = computed(() => sessionPending || activeSessionPending.value || !isHydrated.value)

const switchAccount = async (sessionToken: string) => {
    activeSessionPending.value = true

    try {
        await setActiveSession({ sessionToken })
        onSessionChange?.()
    } catch (error) {
        toast({
            variant: 'error',
            message: getLocalizedError({ error, localization: localization.value })
        })
        activeSessionPending.value = false
    }
}

// Reset activeSessionPending when session changes
watch([sessionData, () => multiSession], () => {
    if (multiSession) {
        activeSessionPending.value = false
    }
})

// Filter device sessions to exclude current user
const filteredDeviceSessions = computed(() =>
    deviceSessions.value?.filter(
        (session) => session.user.id !== user.value?.id
    ) || []
)

// Warning for deprecated behavior
const warningLogged = ref(false)
onMounted(() => {
    if (!props.size && !warningLogged.value) {
        console.warn(
            "[Better Auth UI] The `size` prop of `UserButton` no longer defaults to `icon`. Please pass `size='icon'` to the `UserButton` component to get the same behaviour as before. This warning will be removed in a future release. It can be suppressed in the meantime by defining the `size` prop."
        )
        warningLogged.value = true
    }
})
</script>