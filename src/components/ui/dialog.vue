<template>
    <DialogRoot v-bind="rootProps">
        <slot />
    </DialogRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DialogRoot } from 'radix-vue'
import type { DialogRootProps } from 'radix-vue'

interface Props extends DialogRootProps {}

const props = defineProps<Props>()

const rootProps = computed(() => {
    const { ...rest } = props
    return rest
})
</script>