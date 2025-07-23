<template>
    <SelectPortal>
        <SelectContent
            :class="cn(
                'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                className
            )"
            :position="position"
            v-bind="$attrs"
        >
            <SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4"
                >
                    <path d="m18 15-6-6-6 6" />
                </svg>
            </SelectScrollUpButton>
            <SelectViewport
                :class="cn(
                    'p-1',
                    position === 'popper' &&
                        'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
                    viewportClassName
                )"
            >
                <slot />
            </SelectViewport>
            <SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </SelectScrollDownButton>
        </SelectContent>
    </SelectPortal>
</template>

<script setup lang="ts">
import {
    SelectContent,
    SelectPortal,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectViewport
} from 'radix-vue'
import { cn } from '../../lib/utils'

interface Props {
    className?: string
    viewportClassName?: string
    position?: 'item-aligned' | 'popper'
}

withDefaults(defineProps<Props>(), {
    position: 'popper'
})

defineOptions({
    inheritAttrs: false
})
</script>