<template>
    <div @click="toggleDropdown" ref="triggerRef">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { inject, ref, provide } from 'vue'

interface Props {
    asChild?: boolean
    className?: string
}

defineProps<Props>()

const dropdown = inject<any>('dropdown-menu')
const triggerRef = ref<HTMLElement>()

const toggleDropdown = () => {
    dropdown?.toggleDropdown()
}

provide('dropdown-trigger-ref', triggerRef)
</script>