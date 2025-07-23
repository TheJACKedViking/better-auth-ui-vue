<template>
    <div
        v-if="canRender"
        :class="cn(
            'flex h-full w-full items-center justify-center rounded-full bg-muted',
            className
        )"
        v-bind="$attrs"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { cn } from '../../lib/utils'

interface Props {
    className?: string
    delayMs?: number
}

const props = withDefaults(defineProps<Props>(), {
    delayMs: 0
})

defineOptions({
    inheritAttrs: false
})

const canRender = ref(props.delayMs === 0)

onMounted(() => {
    if (props.delayMs > 0) {
        setTimeout(() => {
            canRender.value = true
        }, props.delayMs)
    }
})
</script>