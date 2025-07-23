<template>
    <div
        :data-active="isActive"
        :class="cn(
            'data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]',
            className
        )"
        data-slot="input-otp-slot"
        @click="handleClick"
        v-bind="$attrs"
    >
        {{ char }}
        <div
            v-if="hasFakeCaret"
            class="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
            <div class="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { cn } from '../../lib/utils'

interface Props {
    index: number
    className?: string
}

const props = defineProps<Props>()

defineOptions({
    inheritAttrs: false
})

const context = inject<any>('OTPInputContext')

const slot = computed(() => context?.slots.value?.[props.index] || {})
const char = computed(() => slot.value.char || '')
const hasFakeCaret = computed(() => slot.value.hasFakeCaret || false)
const isActive = computed(() => slot.value.isActive || false)

const handleClick = () => {
    context?.focus(props.index)
}
</script>

<style>
@keyframes caret-blink {
    0%,
    70%,
    100% {
        opacity: 1;
    }
    20%,
    50% {
        opacity: 0;
    }
}

.animate-caret-blink {
    animation: caret-blink 1.2s ease-out infinite;
}
</style>