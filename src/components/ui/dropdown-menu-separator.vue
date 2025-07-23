<template>
    <div
        :class="cn('-mx-1 my-1 h-px bg-muted', className)"
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