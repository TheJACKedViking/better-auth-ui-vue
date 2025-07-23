<template>
    <h3
        :class="cn('font-semibold leading-none tracking-tight', className)"
        v-bind="$attrs"
    >
        <slot />
    </h3>
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