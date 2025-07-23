<template>
    <div
        :class="cn(
            'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
            !disabled && 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
            className
        )"
        :data-disabled="disabled || undefined"
        @click="handleClick"
        v-bind="$attrs"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { cn } from '../../lib/utils'

interface Props {
    className?: string
    disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
    click: []
}>()

defineOptions({
    inheritAttrs: false
})

const dropdown = inject<any>('dropdown-menu')

const handleClick = () => {
    if (!props.disabled) {
        emit('click')
        dropdown?.closeDropdown()
    }
}
</script>