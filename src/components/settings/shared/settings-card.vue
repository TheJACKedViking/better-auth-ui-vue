<template>
    <Card
        :class="cn(
            'w-full pb-0 text-start',
            variant === 'destructive' && 'border-destructive/40',
            className,
            classNames?.base
        )"
        v-bind="$attrs"
    >
        <SettingsCardHeader
            :class-names="classNames"
            :description="description"
            :is-pending="isPending"
            :title="title"
        />

        <slot />

        <SettingsCardFooter
            :class-names="classNames"
            :action-label="actionLabel"
            :disabled="disabled"
            :is-pending="isPending"
            :is-submitting="isSubmitting"
            :instructions="instructions"
            :optimistic="optimistic"
            :variant="variant"
            :action="action"
        />
    </Card>
</template>

<script setup lang="ts">
import { cn } from '../../../lib/utils'
import type { AuthLocalization } from '../../../localization/auth-localization'
import type { UserAvatarClassNames } from '../../user-avatar.vue'
import SettingsCardFooter from './settings-card-footer.vue'
import SettingsCardHeader from './settings-card-header.vue'
import { Card } from '../../ui'

export type SettingsCardClassNames = {
    base?: string
    avatar?: UserAvatarClassNames
    button?: string
    cell?: string
    checkbox?: string
    destructiveButton?: string
    content?: string
    description?: string
    dialog?: {
        content?: string
        footer?: string
        header?: string
    }
    error?: string
    footer?: string
    header?: string
    icon?: string
    input?: string
    instructions?: string
    label?: string
    primaryButton?: string
    secondaryButton?: string
    outlineButton?: string
    skeleton?: string
    title?: string
}

export interface SettingsCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    title?: any
    description?: any
    instructions?: any
    actionLabel?: any
    isSubmitting?: boolean
    disabled?: boolean
    isPending?: boolean
    optimistic?: boolean
    variant?: "default" | "destructive"
    localization?: AuthLocalization
    action?: () => Promise<unknown> | unknown
}

defineProps<SettingsCardProps>()

defineOptions({
    inheritAttrs: false
})
</script>

<script lang="ts">
export default {
    name: 'SettingsCard'
}
</script>