<template>
    <h2
        :class="cn(
            'text-lg font-semibold leading-none tracking-tight',
            className
        )"
        v-bind="$attrs"
    >
        <slot />
    </h2>
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