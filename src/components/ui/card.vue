<template>
    <div
        :class="cn(
            'rounded-xl border bg-card text-card-foreground shadow-xs',
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