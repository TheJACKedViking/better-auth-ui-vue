<template>
    <SelectRoot v-bind="rootProps">
        <slot />
    </SelectRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SelectRoot } from 'radix-vue'
import type { SelectRootProps } from 'radix-vue'

interface Props extends SelectRootProps {}

const props = defineProps<Props>()

const rootProps = computed(() => {
    const { ...rest } = props
    return rest
})
</script>