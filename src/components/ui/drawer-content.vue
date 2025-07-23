<template>
    <div
        :class="cn(
            'flex h-full w-full flex-col overflow-y-auto bg-background',
            className
        )"
        v-bind="$attrs"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
import { cn } from '../../lib/utils'

interface Props {
    className?: string
}

defineProps<Props>()

defineOptions({
    inheritAttrs: false
})
</script>