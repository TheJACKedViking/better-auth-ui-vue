<template>
    <Teleport to="body">
        <div
            v-if="isOpen"
            ref="contentRef"
            :class="cn(
                'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                className
            )"
            :style="dropdownStyles"
            @click.stop
            v-bind="$attrs"
        >
            <slot />
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, onUnmounted } from 'vue'
import { cn } from '../../lib/utils'

interface Props {
    className?: string
    align?: 'center' | 'start' | 'end'
    onCloseAutoFocus?: (e: Event) => void
}

const props = withDefaults(defineProps<Props>(), {
    align: 'center'
})

defineOptions({
    inheritAttrs: false
})

const dropdown = inject<any>('dropdown-menu')
const triggerRef = inject<any>('dropdown-trigger-ref')
const contentRef = ref<HTMLElement>()

const isOpen = computed(() => dropdown?.isOpen.value)

const dropdownStyles = ref({
    position: 'fixed' as const,
    top: '0px',
    left: '0px'
})

const updatePosition = () => {
    if (!triggerRef?.value || !contentRef.value) return
    
    const trigger = triggerRef.value
    const rect = trigger.getBoundingClientRect()
    const contentRect = contentRef.value.getBoundingClientRect()
    
    let left = rect.left
    const top = rect.bottom + 4
    
    // Align adjustment
    if (props.align === 'center') {
        left = rect.left + (rect.width - contentRect.width) / 2
    } else if (props.align === 'end') {
        left = rect.right - contentRect.width
    }
    
    // Ensure it doesn't go off screen
    if (left + contentRect.width > window.innerWidth) {
        left = window.innerWidth - contentRect.width - 8
    }
    if (left < 8) {
        left = 8
    }
    
    dropdownStyles.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`
    }
}

const handleClickOutside = (e: Event) => {
    if (contentRef.value && !contentRef.value.contains(e.target as Node) &&
        triggerRef?.value && !triggerRef.value.contains(e.target as Node)) {
        dropdown?.closeDropdown()
        props.onCloseAutoFocus?.(e)
    }
}

watch(isOpen, (newVal) => {
    if (newVal) {
        setTimeout(() => {
            updatePosition()
            document.addEventListener('click', handleClickOutside)
            document.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)
        }, 0)
    } else {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
    }
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('scroll', updatePosition, true)
    window.removeEventListener('resize', updatePosition)
})
</script>