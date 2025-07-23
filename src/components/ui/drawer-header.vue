<template>
    <div
        :class="cn('grid gap-1.5 p-4 text-center sm:text-left', className)"
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