<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex">
            <div
                class="fixed inset-0 bg-black/80"
                @click="close"
            />
            <div
                :class="cn(
                    'relative z-50 flex h-full w-full max-w-xs flex-col bg-background shadow-xl',
                    position === 'left' ? 'mr-auto' : 'ml-auto',
                    className
                )"
                v-bind="$attrs"
            >
                <slot name="content" />
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { cn } from '../../lib/utils'

interface Props {
    isOpen: boolean
    position?: 'left' | 'right'
    className?: string
}

const props = withDefaults(defineProps<Props>(), {
    position: 'right'
})

const emit = defineEmits<{
    'update:isOpen': [value: boolean]
}>()

defineOptions({
    inheritAttrs: false
})

const close = () => {
    emit('update:isOpen', false)
}

provide('drawer-close', close)
</script>