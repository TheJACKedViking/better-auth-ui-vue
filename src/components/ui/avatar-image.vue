<template>
    <img
        v-if="hasError === false"
        :class="cn('aspect-square h-full w-full', className)"
        :src="src"
        :alt="alt"
        @error="handleError"
        v-bind="$attrs"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '../../lib/utils'

interface Props {
    className?: string
    src?: string
    alt?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    error: []
}>()

defineOptions({
    inheritAttrs: false
})

const hasError = ref(false)

const handleError = () => {
    hasError.value = true
    emit('error')
}
</script>