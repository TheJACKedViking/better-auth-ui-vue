<template>
    <div
        :class="cn('animate-pulse rounded-md bg-muted', className)"
        v-bind="$attrs"
    />
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