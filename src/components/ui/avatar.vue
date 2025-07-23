<template>
    <div
        :class="cn(
            'relative flex shrink-0 overflow-hidden rounded-full',
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