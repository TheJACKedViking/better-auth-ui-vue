<template>
    <CardHeader :class="cn(classNames?.header, className)">
        <template v-if="isPending">
            <Skeleton
                :class="cn(
                    'my-0.5 h-5 w-1/3 md:h-5.5',
                    classNames?.skeleton
                )"
            />

            <Skeleton
                v-if="description"
                :class="cn(
                    'mt-1.5 mb-0.5 h-3 w-2/3 md:h-3.5',
                    classNames?.skeleton
                )"
            />
        </template>
        <template v-else>
            <CardTitle
                :class="cn('text-lg md:text-xl', classNames?.title)"
            >
                <slot name="title">{{ title }}</slot>
            </CardTitle>

            <CardDescription
                v-if="description"
                :class="cn(
                    'text-xs md:text-sm',
                    classNames?.description
                )"
            >
                <slot name="description">{{ description }}</slot>
            </CardDescription>
        </template>
    </CardHeader>
</template>

<script setup lang="ts">
import { cn } from '../../../lib/utils'
import type { SettingsCardClassNames } from './settings-card.vue'

export interface SettingsCardHeaderProps {
    className?: string
    classNames?: SettingsCardClassNames
    description?: any
    isPending?: boolean
    title: any
}

defineProps<SettingsCardHeaderProps>()
</script>

<script lang="ts">
export default {
    name: 'SettingsCardHeader'
}
</script>