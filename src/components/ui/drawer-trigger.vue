<template>
    <div @click="handleClick">
        <slot />
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    click: []
}>()

const handleClick = () => {
    emit('click')
}
</script>