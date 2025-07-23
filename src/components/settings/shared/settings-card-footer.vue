<template>
    <CardFooter
        :class="cn(
            'flex flex-col justify-between gap-4 rounded-b-xl md:flex-row',
            (actionLabel || instructions) && '!py-4 border-t',
            variant === 'destructive'
                ? 'border-destructive/30 bg-destructive/15'
                : 'bg-sidebar',
            className,
            classNames?.footer
        )"
    >
        <template v-if="isPending">
            <Skeleton
                v-if="instructions"
                :class="cn(
                    'my-0.5 h-3 w-48 max-w-full md:h-4 md:w-56',
                    classNames?.skeleton
                )"
            />

            <Skeleton
                v-if="actionLabel"
                :class="cn(
                    'h-8 w-14 md:ms-auto',
                    classNames?.skeleton
                )"
            />
        </template>
        <template v-else>
            <CardDescription
                v-if="instructions"
                :class="cn(
                    'text-center text-muted-foreground text-xs md:text-start md:text-sm',
                    classNames?.instructions
                )"
            >
                <slot name="instructions">{{ instructions }}</slot>
            </CardDescription>

            <SettingsActionButton
                v-if="actionLabel"
                :class-names="classNames"
                :action-label="actionLabel"
                :disabled="disabled"
                :is-submitting="isSubmitting"
                :variant="variant"
                @click="action"
            />
        </template>
    </CardFooter>
</template>

<script setup lang="ts">
import { cn } from '../../../lib/utils'
import SettingsActionButton from './settings-action-button.vue'
import type { SettingsCardClassNames } from './settings-card.vue'

export interface SettingsCardFooterProps {
    className?: string
    classNames?: SettingsCardClassNames
    actionLabel?: any
    disabled?: boolean
    instructions?: any
    isPending?: boolean
    isSubmitting?: boolean
    optimistic?: boolean
    variant?: "default" | "destructive"
    action?: () => Promise<unknown> | unknown
}

defineProps<SettingsCardFooterProps>()
</script>

<script lang="ts">
export default {
    name: 'SettingsCardFooter'
}
</script>