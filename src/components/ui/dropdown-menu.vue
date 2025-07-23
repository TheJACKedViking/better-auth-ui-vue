<template>
    <div class="relative inline-block">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

const isOpen = ref(false)
const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}
const closeDropdown = () => {
    isOpen.value = false
}

provide('dropdown-menu', {
    isOpen,
    toggleDropdown,
    closeDropdown
})
</script>