<template>
    <p
        :class="cn('text-sm text-muted-foreground', className)"
        v-bind="$attrs"
    >
        <slot />
    </p>
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