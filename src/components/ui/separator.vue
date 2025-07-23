<template>
    <div
        :class="cn(
            'shrink-0 bg-border',
            orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
            className
        )"
        :data-orientation="orientation"
        v-bind="$attrs"
    />
</template>

<script setup lang="ts">
import { cn } from '../../lib/utils'

interface Props {
    className?: string
    orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<Props>(), {
    orientation: 'horizontal'
})

defineOptions({
    inheritAttrs: false
})
</script>